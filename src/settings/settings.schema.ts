import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const aiProvider = pgEnum("ai_provider", ["off", "free-api", "local"]);

export const lifeSettings = pgTable("life_settings", {
  id: text("id").primaryKey().default("default"),
  profileName: text("profile_name").notNull(),
  profileEmail: text("profile_email").notNull(),
  profilePhone: text("profile_phone").notNull(),
  profileLocation: text("profile_location").notNull(),
  profileRole: text("profile_role").notNull(),
  profileBio: text("profile_bio").notNull(),
  profileImage: text("profile_image").notNull(),
  currency: text("currency").notNull(),
  notificationEnabled: boolean("notification_enabled").default(false).notNull(),
  quietHoursStart: text("quiet_hours_start").notNull(),
  quietHoursEnd: text("quiet_hours_end").notNull(),
  aiProvider: aiProvider("ai_provider").default("off").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
