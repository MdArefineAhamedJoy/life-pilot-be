import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, count, eq, ilike, like } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { expenses } from "../expenses/expenses.schema";
import { createId, optionalText } from "../shared/life-os.validation";
import { budgets } from "./budgets.schema";
import type {
  Budget,
  BudgetFilters,
  BudgetStatus,
  BudgetSummary,
  BudgetType,
  BudgetUsage,
} from "./budgets.types";

const budgetTypes: BudgetType[] = ["daily", "weekly", "monthly"];
const budgetStatuses: BudgetStatus[] = ["active", "paused", "completed"];

function amount(value: unknown, field: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new BadRequestException(`${field} must be a non-negative number.`);
  }
  return parsed;
}

function optionalAmount(value: unknown, field: string) {
  return value === undefined || value === null || value === "" ? undefined : amount(value, field);
}

function budgetFromRow(row: typeof budgets.$inferSelect): Budget {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    monthlyLimit: row.monthlyLimit,
    weeklyLimit: row.weeklyLimit ?? undefined,
    dailyLimit: row.dailyLimit ?? undefined,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    status: row.status ?? undefined,
    note: row.note ?? undefined,
    extraNote: row.extraNote ?? undefined,
    color: row.color,
    isActive: row.isActive,
  };
}

function normalizeBudget(id: string, payload: Partial<Budget>): Budget {
  const name = optionalText(payload.name);
  if (!name) throw new BadRequestException("Budget name is required.");

  return {
    id,
    name,
    type: budgetTypes.includes(payload.type as BudgetType)
      ? (payload.type as BudgetType)
      : "monthly",
    monthlyLimit: amount(payload.monthlyLimit, "Budget limit"),
    weeklyLimit: optionalAmount(payload.weeklyLimit, "Weekly budget limit"),
    dailyLimit: optionalAmount(payload.dailyLimit, "Daily budget limit"),
    startDate: optionalText(payload.startDate),
    endDate: optionalText(payload.endDate),
    status: budgetStatuses.includes(payload.status as BudgetStatus)
      ? (payload.status as BudgetStatus)
      : undefined,
    note: optionalText(payload.note),
    extraNote: optionalText(payload.extraNote),
    color: optionalText(payload.color) ?? "teal",
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
  };
}

function toBudgetValues(budget: Budget): typeof budgets.$inferInsert {
  return {
    ...budget,
    weeklyLimit: budget.weeklyLimit ?? null,
    dailyLimit: budget.dailyLimit ?? null,
    startDate: budget.startDate ?? null,
    endDate: budget.endDate ?? null,
    status: budget.status ?? null,
    note: budget.note ?? null,
    extraNote: budget.extraNote ?? null,
    updatedAt: new Date(),
  };
}

function todayDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

function currentMonth() {
  return todayDate().slice(0, 7);
}

@Injectable()
export class BudgetsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string, page: number, limit: number, filters: BudgetFilters) {
    const where = this.getWhere(userId, filters);
    const [rows, countRows, monthlyExpenses] = await Promise.all([
      this.db
        .select()
        .from(budgets)
        .where(where)
        .orderBy(asc(budgets.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(budgets).where(where),
      this.getMonthlyExpenses(userId),
    ]);

    return {
      items: this.toUsage(rows.map(budgetFromRow), monthlyExpenses),
      page,
      limit,
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async getSummary(userId: string, filters: BudgetFilters): Promise<BudgetSummary> {
    const [rows, monthlyExpenses] = await Promise.all([
      this.db.select().from(budgets).where(this.getWhere(userId, filters)),
      this.getMonthlyExpenses(userId),
    ]);
    const budgetUsage = this.toUsage(rows.map(budgetFromRow), monthlyExpenses);
    const totalBudget = budgetUsage.reduce((total, budget) => total + budget.monthlyLimit, 0);
    const totalSpent = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
    const todaySpent = monthlyExpenses
      .filter((expense) => expense.date === todayDate())
      .reduce((total, expense) => total + expense.amount, 0);
    const totalActiveBudget = budgetUsage
      .filter((budget) => (budget.status ?? (budget.isActive ? "active" : "paused")) === "active")
      .reduce((total, budget) => total + budget.monthlyLimit, 0);

    return {
      totalBudget,
      totalSpent,
      todaySpent,
      totalActiveBudget,
      remaining: totalBudget - totalSpent,
      usageProgress: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      todayUsageProgress: totalBudget > 0 ? Math.round((todaySpent / totalBudget) * 100) : 0,
      activeBudgetProgress:
        totalBudget > 0 ? Math.round((totalActiveBudget / totalBudget) * 100) : 0,
      budgetCount: budgetUsage.length,
    };
  }

  async findOne(userId: string, budgetId: string) {
    const budget = await this.db.query.budgets.findFirst({
      where: and(eq(budgets.id, budgetId), eq(budgets.userId, userId)),
    });
    if (!budget) throw new NotFoundException("Budget was not found.");
    return budgetFromRow(budget);
  }

  async create(userId: string, payload: Omit<Budget, "id">) {
    const budget = normalizeBudget(createId("budget"), payload);
    const [row] = await this.db
      .insert(budgets)
      .values({ ...toBudgetValues(budget), userId })
      .returning();
    return budgetFromRow(row);
  }

  async update(userId: string, budgetId: string, payload: Partial<Budget>) {
    const current = await this.findOne(userId, budgetId);
    const budget = normalizeBudget(budgetId, { ...current, ...payload });
    const [row] = await this.db
      .update(budgets)
      .set(toBudgetValues(budget))
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .returning();
    return budgetFromRow(row);
  }

  async updateStatus(userId: string, budgetId: string, status: BudgetStatus) {
    if (!budgetStatuses.includes(status)) {
      throw new BadRequestException("Budget status is invalid.");
    }

    return this.update(userId, budgetId, { status, isActive: status === "active" });
  }

  async remove(userId: string, budgetId: string) {
    await this.db.delete(budgets).where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));
    return { id: budgetId };
  }

  private getWhere(userId: string, filters: BudgetFilters) {
    const conditions = [eq(budgets.userId, userId)];

    if (filters.search) {
      conditions.push(ilike(budgets.name, `%${filters.search}%`));
    }
    if (filters.status) {
      conditions.push(eq(budgets.status, filters.status));
    }
    if (filters.type) {
      conditions.push(eq(budgets.type, filters.type));
    }

    return and(...conditions);
  }

  private async getMonthlyExpenses(userId: string) {
    return this.db
      .select({ amount: expenses.amount, category: expenses.category, date: expenses.date })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), like(expenses.date, `${currentMonth()}%`)));
  }

  private toUsage(
    budgetItems: Budget[],
    monthlyExpenses: Array<{ amount: number; category: string; date: string }>
  ): BudgetUsage[] {
    const spentByBudgetName = monthlyExpenses.reduce<Record<string, number>>((totals, expense) => {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
      return totals;
    }, {});

    return budgetItems.map((budget) => {
      const spent = spentByBudgetName[budget.name] ?? 0;
      const remaining = budget.monthlyLimit - spent;

      return {
        ...budget,
        spent,
        remaining,
        percent: budget.monthlyLimit > 0 ? Math.round((spent / budget.monthlyLimit) * 100) : 0,
        isOverBudget: remaining < 0,
      };
    });
  }
}
