import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { budgetCategories, expenses } from "../db/schema";
import { categoryFromRow, toCategoryValues } from "../shared/life-os.mapper";
import { createId, normalizeCategory, numberValue } from "../shared/life-os.validation";
import type { BudgetCategory } from "./categories.types";

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string) {
    const rows = await this.db.select().from(budgetCategories).where(eq(budgetCategories.userId, userId)).orderBy(asc(budgetCategories.createdAt));
    return rows.map(categoryFromRow);
  }

  async create(userId: string, payload: Omit<BudgetCategory, "id">) {
    const category = normalizeCategory(createId("cat"), payload);
    const [row] = await this.db.insert(budgetCategories).values({ ...toCategoryValues(category), userId }).returning();
    return categoryFromRow(row);
  }

  async update(userId: string, categoryId: string, payload: Partial<BudgetCategory>) {
    const current = await this.db.query.budgetCategories.findFirst({ where: and(eq(budgetCategories.id, categoryId), eq(budgetCategories.userId, userId)) });
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
      await this.db.update(expenses).set({ category: nextCategory.name }).where(and(eq(expenses.category, previousName), eq(expenses.userId, userId)));
    }

    return categoryFromRow(row);
  }

  async updateLimit(userId: string, categoryId: string, monthlyLimit: unknown) {
    const [row] = await this.db
      .update(budgetCategories)
      .set({ monthlyLimit: numberValue(monthlyLimit), updatedAt: new Date() })
      .where(and(eq(budgetCategories.id, categoryId), eq(budgetCategories.userId, userId)))
      .returning();

    if (!row) {
      throw new NotFoundException("Budget category was not found.");
    }

    return categoryFromRow(row);
  }

  async remove(userId: string, categoryId: string) {
    await this.db.delete(budgetCategories).where(and(eq(budgetCategories.id, categoryId), eq(budgetCategories.userId, userId)));
    return { id: categoryId };
  }
}
