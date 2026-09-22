import { boolean, doublePrecision, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const mealType = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack"]);
export const mealStatus = pgEnum("meal_status", ["planned", "prepared", "skipped"]);

export const mealPlans = pgTable("meal_plans", {
  id: text("id").primaryKey(),
  userId: uuid("user_id"),
  date: text("date").notNull(),
  mealType: mealType("meal_type").notNull(),
  title: text("title").notNull(),
  servings: integer("servings").default(1).notNull(),
  prepMinutes: integer("prep_minutes"),
  calories: doublePrecision("calories"),
  proteinGrams: doublePrecision("protein_grams"),
  carbsGrams: doublePrecision("carbs_grams"),
  fatGrams: doublePrecision("fat_grams"),
  ingredients: jsonb("ingredients").$type<string[]>().default([]).notNull(),
  shoppingNeeded: boolean("shopping_needed").default(false).notNull(),
  note: text("note"),
  status: mealStatus("status").default("planned").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
