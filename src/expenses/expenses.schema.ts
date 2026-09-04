import { doublePrecision, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const expenseSourceType = pgEnum("expense_source_type", ["manual", "image", "text", "recurring"]);

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
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
