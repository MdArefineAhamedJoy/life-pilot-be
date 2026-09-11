import {
  boolean,
  doublePrecision,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { budgetStatus } from "../categories/categories.schema";

export const budgetType = pgEnum("budget_type", ["daily", "weekly", "monthly"]);

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
  name: text("name").notNull(),
  type: budgetType("type").default("monthly").notNull(),
  monthlyLimit: doublePrecision("monthly_limit").notNull(),
  weeklyLimit: doublePrecision("weekly_limit"),
  dailyLimit: doublePrecision("daily_limit"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: budgetStatus("status"),
  note: text("note"),
  extraNote: text("extra_note"),
  color: text("color").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
