import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { passwordRecoveryRequests } from "../auth/auth.schema";
import { accountProfiles } from "./accounts.schema";
import { DRIZZLE, type Database } from "../db/database.module";
import type { ProfilePayload, RecoveryPayload } from "./accounts.types";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function assertEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestException("Valid email is required.");
  }
}

@Injectable()
export class AccountsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

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

    const [profile] = await this.db
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

    return profile;
  }

  async requestPasswordRecovery(payload: RecoveryPayload) {
    const email = cleanText(payload.email);
    assertEmail(email);

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
    const [request] = await this.db
      .insert(passwordRecoveryRequests)
      .values({
        email,
        token,
        expiresAt,
      })
      .returning();

    // Email delivery is not configured yet. Never expose a recovery token in an API response.
    return { ok: true, expiresAt: request.expiresAt };
  }
}
