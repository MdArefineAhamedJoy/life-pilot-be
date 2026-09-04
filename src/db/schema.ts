import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const passwordRecoveryStatus = pgEnum("password_recovery_status", [
  "pending",
  "used",
  "expired",
]);

export const budgetCategoryType = pgEnum("budget_category_type", ["daily", "weekly", "monthly"]);
export const budgetStatus = pgEnum("budget_status", ["active", "paused", "completed"]);
export const budgetCategoryStatus = pgEnum("budget_category_status", ["active", "pushed", "blocked"]);
export const expenseSourceType = pgEnum("expense_source_type", ["manual", "image", "text", "recurring"]);
export const routinePriority = pgEnum("routine_priority", ["low", "medium", "high"]);
export const routineStatus = pgEnum("routine_status", [
  "pending",
  "active",
  "completed",
  "skipped",
  "delayed",
  "missed",
]);
export const routineRepeatRule = pgEnum("routine_repeat_rule", ["daily", "weekly", "custom", "once"]);
export const timerMode = pgEnum("timer_mode", ["timer", "stopwatch", "focus"]);
export const aiProvider = pgEnum("ai_provider", ["off", "free-api", "local"]);

export const accountProfiles = pgTable("account_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  location: text("location"),
  role: text("role"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authUsers = pgTable("auth_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  imageUrl: text("image_url"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const passwordRecoveryRequests = pgTable("password_recovery_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  status: passwordRecoveryStatus("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: budgetCategoryType("type").default("monthly").notNull(),
  monthlyLimit: doublePrecision("monthly_limit").notNull(),
  weeklyLimit: doublePrecision("weekly_limit"),
  dailyLimit: doublePrecision("daily_limit"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: budgetStatus("status"),
  categoryStatus: budgetCategoryStatus("category_status"),
  note: text("note"),
  extraNote: text("extra_note"),
  color: text("color").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  amount: doublePrecision("amount").notNull(),
  quantity: doublePrecision("quantity"),
  unit: text("unit"),
  paymentMethod: text("payment_method"),
  note: text("note"),
  sourceType: expenseSourceType("source_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const routineTasks = pgTable("routine_tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  priority: routinePriority("priority").default("medium").notNull(),
  plannedStart: text("planned_start").notNull(),
  plannedEnd: text("planned_end").notNull(),
  sortOrder: integer("sort_order"),
  actualMinutes: integer("actual_minutes"),
  status: routineStatus("status").default("pending").notNull(),
  repeatRule: routineRepeatRule("repeat_rule").default("daily").notNull(),
  alertEnabled: boolean("alert_enabled"),
  alertOffsetMinutes: integer("alert_offset_minutes"),
  reminderAt: text("reminder_at"),
  completedAt: text("completed_at"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const timerSessions = pgTable("timer_sessions", {
  id: text("id").primaryKey(),
  taskId: text("task_id"),
  title: text("title").notNull(),
  category: text("category").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  mode: timerMode("mode").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lifeNotes = pgTable("life_notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

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
