import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { AuthService } from "../auth/auth.service";
import { authUsers, passwordRecoveryRequests } from "../auth/auth.schema";
import { accountProfiles } from "./accounts.schema";
import { DRIZZLE, type Database } from "../db/database.module";
import { EmailService } from "../email/email.service";
import type { ProfilePayload, RecoveryPayload, ResetPasswordPayload } from "./accounts.types";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function assertEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestException("Valid email is required.");
  }
}

function hashRecoveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function passwordResetUrl(token: string) {
  const configuredOrigin =
    process.env.APP_URL?.trim() || process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  const url = new URL("/reset-password", configuredOrigin || "http://localhost:3000");
  url.searchParams.set("token", token);
  return url.toString();
}

@Injectable()
export class AccountsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly authService: AuthService,
    private readonly emailService: EmailService
  ) {}

  async getProfile(email: string) {
    const cleanEmail = cleanText(email);
    assertEmail(cleanEmail);

    const profile = await this.db.query.accountProfiles.findFirst({
      where: eq(accountProfiles.email, cleanEmail),
    });

    if (!profile) {
      throw new NotFoundException("Account profile was not found.");
    }

    return profile;
  }

  async saveProfile(email: string, payload: ProfilePayload) {
    const name = cleanText(payload.name);
    const profileEmail = cleanText(email).toLowerCase();

    if (!name) {
      throw new BadRequestException("Name is required.");
    }

    assertEmail(profileEmail);

    return this.db.transaction(async (tx) => {
      const [profile] = await tx
        .insert(accountProfiles)
        .values({
          name,
          email: profileEmail,
          phone: cleanText(payload.phone) || null,
          location: cleanText(payload.location) || null,
          role: cleanText(payload.role) || null,
          bio: cleanText(payload.bio) || null,
          imageUrl: cleanText(payload.imageUrl) || null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: accountProfiles.email,
          set: {
            name,
            phone: cleanText(payload.phone) || null,
            location: cleanText(payload.location) || null,
            role: cleanText(payload.role) || null,
            bio: cleanText(payload.bio) || null,
            imageUrl: cleanText(payload.imageUrl) || null,
            updatedAt: new Date(),
          },
        })
        .returning();

      await tx
        .update(authUsers)
        .set({ name, phone: profile.phone, imageUrl: profile.imageUrl, updatedAt: new Date() })
        .where(eq(authUsers.email, profileEmail));
      return profile;
    });
  }

  async requestPasswordRecovery(payload: RecoveryPayload) {
    const email = cleanText(payload.email).toLowerCase();
    assertEmail(email);
    this.emailService.ensureConfigured();

    const user = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.email, email),
      columns: { id: true },
    });

    // Do not reveal whether an account exists for the supplied address.
    if (!user) return { ok: true };

    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.db.transaction(async (tx) => {
      await tx
        .update(passwordRecoveryRequests)
        .set({ status: "expired" })
        .where(
          and(
            eq(passwordRecoveryRequests.email, email),
            eq(passwordRecoveryRequests.status, "pending")
          )
        );
      await tx.insert(passwordRecoveryRequests).values({
        email,
        token: hashRecoveryToken(rawToken),
        status: "pending",
        expiresAt,
      });
    });

    await this.emailService.sendPasswordReset(email, passwordResetUrl(rawToken));
    return { ok: true, expiresAt: expiresAt.toISOString() };
  }

  async resetPassword(payload: ResetPasswordPayload) {
    const token = cleanText(payload.token);
    const password = typeof payload.password === "string" ? payload.password : "";
    const passwordConfirmation =
      typeof payload.passwordConfirmation === "string" ? payload.passwordConfirmation : "";

    if (!token) {
      throw new BadRequestException("Password reset token is required.");
    }

    const recovery = await this.db.query.passwordRecoveryRequests.findFirst({
      where: and(
        eq(passwordRecoveryRequests.token, hashRecoveryToken(token)),
        eq(passwordRecoveryRequests.status, "pending"),
        gt(passwordRecoveryRequests.expiresAt, new Date())
      ),
    });

    if (!recovery) {
      throw new BadRequestException("This password reset link is invalid or has expired.");
    }

    if (password.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters.");
    }
    if (password !== passwordConfirmation) {
      throw new BadRequestException("Password confirmation does not match.");
    }

    const [claimedRecovery] = await this.db
      .update(passwordRecoveryRequests)
      .set({ status: "used" })
      .where(
        and(
          eq(passwordRecoveryRequests.id, recovery.id),
          eq(passwordRecoveryRequests.status, "pending")
        )
      )
      .returning({ id: passwordRecoveryRequests.id });
    if (!claimedRecovery) {
      throw new BadRequestException("This password reset link has already been used.");
    }

    await this.authService.replacePassword(recovery.email, password, passwordConfirmation);

    return { ok: true };
  }
}
