import { eq } from "drizzle-orm";
import type { Database } from "../db/database.module";
import { authUsers } from "../auth/auth.schema";
import { accountProfiles } from "../accounts/accounts.schema";
import type { LifeSettings } from "../settings/settings.types";

export async function withAccountProfile(
  db: Database,
  userId: string,
  settings: LifeSettings
): Promise<LifeSettings> {
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.id, userId) });
  if (!user) return settings;
  const profile = await db.query.accountProfiles.findFirst({
    where: eq(accountProfiles.email, user.email),
  });
  return {
    ...settings,
    profileName: profile?.name ?? user.name,
    profileEmail: user.email,
    profilePhone: profile?.phone ?? user.phone ?? "",
    profileImage: profile?.imageUrl ?? user.imageUrl ?? "",
    profileLocation: profile?.location ?? "",
    profileRole: profile?.role ?? "",
    profileBio: profile?.bio ?? "",
  };
}
