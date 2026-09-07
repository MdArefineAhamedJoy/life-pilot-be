import { BadRequestException, Inject, Injectable, NotFoundException, NotImplementedException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { authUsers } from "../auth/auth.schema";
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

      await tx.update(authUsers).set({ name, phone: profile.phone, imageUrl: profile.imageUrl, updatedAt: new Date() })
        .where(eq(authUsers.email, profileEmail));
      return profile;
    });
  }

  async requestPasswordRecovery(payload: RecoveryPayload) {
    const email = cleanText(payload.email);
    assertEmail(email);

    throw new NotImplementedException("Password recovery is unavailable because email delivery has not been configured.");
  }
}
