import { doublePrecision, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const shoppingItemStatus = pgEnum("shopping_item_status", ["pending", "purchased"]);

export const shoppingItems = pgTable("shopping_items", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
  name: text("name").notNull(),
  category: text("category"),
  subCategory: text("sub_category"),
  brand: text("brand"),
  model: text("model"),
  storeName: text("store_name"),
  quantity: doublePrecision("quantity"),
  unit: text("unit"),
  estimatedPrice: doublePrecision("estimated_price"),
  productPrice: doublePrecision("product_price"),
  totalPrice: doublePrecision("total_price"),
  purchaseDate: text("purchase_date"),
  paymentMethod: text("payment_method"),
  receiptDocuments: jsonb("receipt_documents").$type<unknown[]>().default([]).notNull(),
  warrantyStatus: text("warranty_status"),
  warrantyExpiresAt: text("warranty_expires_at"),
  warrantyNote: text("warranty_note"),
  warrantyDocuments: jsonb("warranty_documents").$type<unknown[]>().default([]).notNull(),
  expenseId: text("expense_id"),
  status: shoppingItemStatus("status").default("pending").notNull(),
  note: text("note"),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
