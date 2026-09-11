import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const routinePriority = pgEnum("routine_priority", ["low", "medium", "high"]);
export const routineStatus = pgEnum("routine_status", [
  "pending",
  "active",
  "completed",
  "skipped",
  "delayed",
  "missed",
]);
export const routineRepeatRule = pgEnum("routine_repeat_rule", [
  "daily",
  "weekly",
  "custom",
  "once",
]);

export const routineTasks = pgTable("routine_tasks", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
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
