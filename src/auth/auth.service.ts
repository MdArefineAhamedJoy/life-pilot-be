import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq, lt } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { accountProfiles } from "../accounts/accounts.schema";
import { authAccessTokens, authSessions, authUsers } from "./auth.schema";
import type { AuthResponse, AuthUserResponse, LoginPayload, RegisterPayload } from "./auth.types";

const scrypt = promisify(scryptCallback);
const sessionDays = 7;
const rememberedSessionDays = 30;
const defaultAccessTokenMinutes = 15;

function accessTokenLifetimeMinutes() {
  const configured = Number(process.env.ACCESS_TOKEN_TTL_MINUTES);
  // Never permit an accidentally long-lived access credential through configuration.
  return Number.isInteger(configured) && configured >= 5 && configured <= 60
    ? configured
    : defaultAccessTokenMinutes;
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function assertEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestException("Valid email is required.");
  }
}

function assertPassword(password: string) {
  if (password.length < 8) {
    throw new BadRequestException("Password must be at least 8 characters.");
  }
}

function userResponse(user: typeof authUsers.$inferSelect): AuthUserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    imageUrl: user.imageUrl ?? undefined,
  };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedKey] = passwordHash.split(":");
  if (!salt || !storedKey) {
    return false;
  }

  const storedBuffer = Buffer.from(storedKey, "hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const name = cleanText(payload.name);
    const email = cleanText(payload.email).toLowerCase();
    const phone = cleanText(payload.phone);
    const imageUrl = cleanText(payload.imageUrl);
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!name) {
      throw new BadRequestException("Name is required.");
    }

    assertEmail(email);
    assertPassword(password);

    const existingUser = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.email, email),
    });

    if (existingUser) {
      throw new ConflictException("An account already exists for this email.");
    }

    const [user] = await this.db
      .insert(authUsers)
      .values({
        name,
        email,
        phone: phone || null,
        imageUrl: imageUrl || null,
        passwordHash: await hashPassword(password),
      })
      .returning();

    await this.db
      .insert(accountProfiles)
      .values({
        name,
        email,
        phone: phone || null,
        imageUrl: imageUrl || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: accountProfiles.email,
        set: {
          name,
          phone: phone || null,
          imageUrl: imageUrl || null,
          updatedAt: new Date(),
        },
      });

    return this.createSession(user);
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const email = cleanText(payload.email).toLowerCase();
    const password = typeof payload.password === "string" ? payload.password : "";

    assertEmail(email);

    const user = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.email, email),
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.createSession(user, payload.rememberMe === true);
  }

  async getCurrentUser(token: string) {
    const accessToken = await this.findValidAccessToken(token);
    const user = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.id, accessToken.userId),
    });

    if (!user) {
      throw new UnauthorizedException("Session user was not found.");
    }

    return userResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const session = await this.findValidRefreshSession(refreshToken);
    const user = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.id, session.userId),
    });

    if (!user) {
      throw new UnauthorizedException("Session user was not found.");
    }

    // Rotate the refresh credential on every use. Its original absolute expiry is retained.
    await this.revokeSession(session.id);
    return this.createSession(user, session.expiresAt);
  }

  async logout(accessToken: string, refreshToken = "") {
    if (accessToken) {
      const access = await this.db.query.authAccessTokens.findFirst({
        where: eq(authAccessTokens.token, hashSessionToken(accessToken)),
      });
      if (access) await this.revokeSession(access.sessionId);
    }

    if (refreshToken) {
      const session = await this.db.query.authSessions.findFirst({
        where: eq(authSessions.token, hashSessionToken(refreshToken)),
      });
      if (session) await this.revokeSession(session.id);
    }

    return { ok: true };
  }

  private async createSession(
    user: typeof authUsers.$inferSelect,
    rememberMeOrExpiresAt: boolean | Date = false
  ): Promise<AuthResponse> {
    const refreshToken = randomBytes(32).toString("base64url");
    const refreshExpiresAt =
      rememberMeOrExpiresAt instanceof Date
        ? rememberMeOrExpiresAt
        : new Date(
            Date.now() +
              (rememberMeOrExpiresAt ? rememberedSessionDays : sessionDays) * 24 * 60 * 60 * 1000
          );
    const accessToken = randomBytes(32).toString("base64url");
    const accessExpiresAt = new Date(Date.now() + accessTokenLifetimeMinutes() * 60 * 1000);

    await this.db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));

    const [session] = await this.db
      .insert(authSessions)
      .values({
        userId: user.id,
        token: hashSessionToken(refreshToken),
        expiresAt: refreshExpiresAt,
      })
      .returning({ id: authSessions.id });

    await this.db.insert(authAccessTokens).values({
      userId: user.id,
      sessionId: session.id,
      token: hashSessionToken(accessToken),
      expiresAt: accessExpiresAt,
    });

    return {
      user: userResponse(user),
      accessToken,
      refreshToken,
      accessExpiresAt: accessExpiresAt.toISOString(),
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  private async findValidRefreshSession(token: string) {
    if (!token) {
      throw new UnauthorizedException("Auth token is required.");
    }

    const session = await this.db.query.authSessions.findFirst({
      where: eq(authSessions.token, hashSessionToken(token)),
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Auth session is invalid or expired.");
    }

    return session;
  }

  private async findValidAccessToken(token: string) {
    if (!token) {
      throw new UnauthorizedException("Auth token is required.");
    }

    const accessToken = await this.db.query.authAccessTokens.findFirst({
      where: eq(authAccessTokens.token, hashSessionToken(token)),
    });

    if (!accessToken || accessToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Access token is invalid or expired.");
    }

    return accessToken;
  }

  private async revokeSession(sessionId: string) {
    await this.db.delete(authAccessTokens).where(eq(authAccessTokens.sessionId, sessionId));
    await this.db.delete(authSessions).where(eq(authSessions.id, sessionId));
  }
}
