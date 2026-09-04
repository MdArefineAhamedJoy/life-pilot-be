import { boolean, doublePrecision, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const budgetCategoryType = pgEnum("budget_category_type", ["daily", "weekly", "monthly"]);
export const budgetStatus = pgEnum("budget_status", ["active", "paused", "completed"]);
export const budgetCategoryStatus = pgEnum("budget_category_status", ["active", "pushed", "blocked"]);

export const budgetCategories = pgTable("budget_categories", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
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
