import { doublePrecision, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const shoppingItemStatus = pgEnum("shopping_item_status", ["pending", "purchased"]);

export const shoppingItems = pgTable("shopping_items", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
  name: text("name").notNull(),
  category: text("category"),
  quantity: doublePrecision("quantity"),
  unit: text("unit"),
  estimatedPrice: doublePrecision("estimated_price"),
  status: shoppingItemStatus("status").default("pending").notNull(),
  note: text("note"),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
