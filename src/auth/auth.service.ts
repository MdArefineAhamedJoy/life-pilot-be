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
import { authSessions, authUsers } from "./auth.schema";
import type { AuthResponse, AuthUserResponse, LoginPayload, RegisterPayload } from "./auth.types";

const scrypt = promisify(scryptCallback);
const sessionDays = 7;

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

    return this.createSession(user);
  }

  async getCurrentUser(token: string) {
    const session = await this.findValidSession(token);
    const user = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.id, session.userId),
    });

    if (!user) {
      throw new UnauthorizedException("Session user was not found.");
    }

    return userResponse(user);
  }

  async logout(token: string) {
    if (token) {
      await this.db.delete(authSessions).where(eq(authSessions.token, hashSessionToken(token)));
    }

    return { ok: true };
  }

  private async createSession(user: typeof authUsers.$inferSelect): Promise<AuthResponse> {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

    await this.db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));

    await this.db.insert(authSessions).values({
      userId: user.id,
      token: hashSessionToken(token),
      expiresAt,
    });

    return {
      user: userResponse(user),
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  private async findValidSession(token: string) {
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
}
