import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, count, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { expenses } from "../expenses/expenses.schema";
import { budgetCategories } from "./categories.schema";
import { categoryFromRow, toCategoryValues } from "../shared/life-os.mapper";
import { createId, normalizeCategory } from "../shared/life-os.validation";
import type { BudgetCategory } from "./categories.types";

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string, page: number, limit: number) {
    const where = eq(budgetCategories.userId, userId);
    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(budgetCategories)
        .where(where)
        .orderBy(asc(budgetCategories.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(budgetCategories).where(where),
    ]);

    return {
      items: rows.map(categoryFromRow),
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async findOne(userId: string, categoryId: string) {
    const category = await this.db.query.budgetCategories.findFirst({
      where: and(eq(budgetCategories.id, categoryId), eq(budgetCategories.userId, userId)),
    });
    if (!category) {
      throw new NotFoundException("Budget category was not found.");
    }

    return categoryFromRow(category);
  }

  async create(userId: string, payload: Omit<BudgetCategory, "id">) {
    const category = normalizeCategory(createId("cat"), payload);
    const [row] = await this.db
      .insert(budgetCategories)
      .values({ ...toCategoryValues(category), userId })
      .returning();
    return categoryFromRow(row);
  }

  async update(userId: string, categoryId: string, payload: Partial<BudgetCategory>) {
    const current = await this.db.query.budgetCategories.findFirst({
      where: and(eq(budgetCategories.id, categoryId), eq(budgetCategories.userId, userId)),
    });
    if (!current) {
      throw new NotFoundException("Budget category was not found.");
    }

    const previousName = current.name;
    const nextCategory = normalizeCategory(categoryId, {
      id: current.id,
      name: current.name,
      type: current.type,
      monthlyLimit: current.monthlyLimit,
      weeklyLimit: current.weeklyLimit ?? undefined,
      dailyLimit: current.dailyLimit ?? undefined,
      startDate: current.startDate ?? undefined,
      endDate: current.endDate ?? undefined,
      status: current.status ?? undefined,
      categoryStatus: current.categoryStatus ?? undefined,
      note: current.note ?? undefined,
      extraNote: current.extraNote ?? undefined,
      color: current.color,
      isActive: current.isActive,
      ...payload,
    });

    const [row] = await this.db
      .update(budgetCategories)
      .set(toCategoryValues(nextCategory))
      .where(and(eq(budgetCategories.id, categoryId), eq(budgetCategories.userId, userId)))
      .returning();

    if (previousName !== nextCategory.name) {
      await this.db
        .update(expenses)
        .set({ category: nextCategory.name })
        .where(and(eq(expenses.category, previousName), eq(expenses.userId, userId)));
    }

    return categoryFromRow(row);
  }

  async updateLimit(userId: string, categoryId: string, monthlyLimit: unknown) {
    return this.update(userId, categoryId, { monthlyLimit: monthlyLimit as number });
  }

  async remove(userId: string, categoryId: string) {
    await this.db
      .delete(budgetCategories)
      .where(and(eq(budgetCategories.id, categoryId), eq(budgetCategories.userId, userId)));
    return { id: categoryId };
  }
}
