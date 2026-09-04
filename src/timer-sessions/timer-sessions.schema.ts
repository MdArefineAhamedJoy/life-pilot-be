import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const timerMode = pgEnum("timer_mode", ["timer", "stopwatch", "focus"]);

export const timerSessions = pgTable("timer_sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
  taskId: text("task_id"),
  title: text("title").notNull(),
  category: text("category").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  mode: timerMode("mode").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
