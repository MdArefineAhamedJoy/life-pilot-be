import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { createId, optionalNumber, optionalText, requiredText } from "../shared/life-os.validation";
import { mealPlans } from "./meals.schema";
import type { MealFilters, MealPlan, MealStatus, MealSummary, MealType } from "./meals.types";

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const mealStatuses: MealStatus[] = ["planned", "prepared", "skipped"];

function validDate(value: unknown, field: string) {
  const date = requiredText(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new BadRequestException(`${field} must use YYYY-MM-DD.`);
  return date;
}

function mealFromRow(row: typeof mealPlans.$inferSelect): MealPlan {
  return {
    id: row.id, date: row.date, mealType: row.mealType, title: row.title, servings: row.servings,
    prepMinutes: row.prepMinutes ?? undefined, calories: row.calories ?? undefined,
    proteinGrams: row.proteinGrams ?? undefined, carbsGrams: row.carbsGrams ?? undefined,
    fatGrams: row.fatGrams ?? undefined, ingredients: row.ingredients ?? [], shoppingNeeded: row.shoppingNeeded,
    note: row.note ?? undefined, status: row.status, createdAt: row.createdAt.toISOString(),
  };
}

function normalizeMeal(id: string, payload: Partial<MealPlan>): MealPlan {
  const mealType = payload.mealType as MealType;
  if (!mealTypes.includes(mealType)) throw new BadRequestException("Meal type is invalid.");
  const status = payload.status ?? "planned";
  if (!mealStatuses.includes(status)) throw new BadRequestException("Meal status is invalid.");
  const servings = Math.round(optionalNumber(payload.servings) ?? 1);
  if (servings < 1) throw new BadRequestException("Servings must be at least 1.");
  const ingredients = Array.isArray(payload.ingredients) ? [...new Set(payload.ingredients.map((item) => String(item).trim()).filter(Boolean))] : [];
  return {
    id, date: validDate(payload.date, "Meal date"), mealType, title: requiredText(payload.title, "Meal title"), servings,
    prepMinutes: optionalNumber(payload.prepMinutes), calories: optionalNumber(payload.calories),
    proteinGrams: optionalNumber(payload.proteinGrams), carbsGrams: optionalNumber(payload.carbsGrams), fatGrams: optionalNumber(payload.fatGrams),
    ingredients, shoppingNeeded: payload.shoppingNeeded === true, note: optionalText(payload.note), status,
  };
}

function values(meal: MealPlan): typeof mealPlans.$inferInsert {
  const { createdAt: _createdAt, ...data } = meal;
  return { ...data, prepMinutes: meal.prepMinutes ?? null, calories: meal.calories ?? null, proteinGrams: meal.proteinGrams ?? null, carbsGrams: meal.carbsGrams ?? null, fatGrams: meal.fatGrams ?? null, note: meal.note ?? null, updatedAt: new Date() };
}

@Injectable()
export class MealsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string, filters: MealFilters) {
    const conditions = [eq(mealPlans.userId, userId)];
    if (filters.dateFrom) conditions.push(gte(mealPlans.date, validDate(filters.dateFrom, "Start date")));
    if (filters.dateTo) conditions.push(lte(mealPlans.date, validDate(filters.dateTo, "End date")));
    if (filters.status && mealStatuses.includes(filters.status)) conditions.push(eq(mealPlans.status, filters.status));
    const rows = await this.db.select().from(mealPlans).where(and(...conditions)).orderBy(asc(mealPlans.date), asc(mealPlans.mealType));
    return rows.map(mealFromRow);
  }

  async getSummary(userId: string, filters: MealFilters): Promise<MealSummary> {
    const meals = await this.findAll(userId, filters);
    return { totalMeals: meals.length, plannedMeals: meals.filter((meal) => meal.status === "planned").length, preparedMeals: meals.filter((meal) => meal.status === "prepared").length, prepMinutes: meals.reduce((total, meal) => total + (meal.prepMinutes ?? 0), 0), shoppingNeeded: meals.filter((meal) => meal.shoppingNeeded).length };
  }

  async create(userId: string, payload: Omit<MealPlan, "id">) {
    const meal = normalizeMeal(createId("meal"), payload);
    const [row] = await this.db.insert(mealPlans).values({ ...values(meal), userId }).returning();
    return mealFromRow(row);
  }

  async update(userId: string, mealId: string, payload: Partial<MealPlan>) {
    const current = await this.db.query.mealPlans.findFirst({ where: and(eq(mealPlans.id, mealId), eq(mealPlans.userId, userId)) });
    if (!current) throw new NotFoundException("Meal plan was not found.");
    const meal = normalizeMeal(mealId, { ...mealFromRow(current), ...payload });
    const [row] = await this.db.update(mealPlans).set(values(meal)).where(and(eq(mealPlans.id, mealId), eq(mealPlans.userId, userId))).returning();
    return mealFromRow(row);
  }

  async updateStatus(userId: string, mealId: string, status: MealStatus) {
    if (!mealStatuses.includes(status)) throw new BadRequestException("Meal status is invalid.");
    return this.update(userId, mealId, { status });
  }

  async remove(userId: string, mealId: string) {
    await this.db.delete(mealPlans).where(and(eq(mealPlans.id, mealId), eq(mealPlans.userId, userId)));
    return { id: mealId };
  }
}
