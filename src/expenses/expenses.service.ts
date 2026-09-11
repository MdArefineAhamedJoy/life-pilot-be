import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { expenses } from "./expenses.schema";
import { expenseFromRow, toExpenseValues } from "../shared/life-os.mapper";
import {
  createId,
  normalizeExpense,
  numberValue,
  textValue,
  todayDate,
} from "../shared/life-os.validation";
import type { Expense, ExpenseFilters, ExpenseSummary, ParsedExpenseRow } from "./expenses.types";

@Injectable()
export class ExpensesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string, page: number, limit: number, filters: ExpenseFilters) {
    const where = this.getWhere(userId, filters);
    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(expenses)
        .where(where)
        .orderBy(desc(expenses.date), desc(expenses.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(expenses).where(where),
    ]);

    return {
      items: rows.map(expenseFromRow),
      page,
      limit,
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async getSummary(userId: string, filters: ExpenseFilters): Promise<ExpenseSummary> {
    const where = this.getWhere(userId, filters);
    const [matchingRows, totalRows] = await Promise.all([
      this.db.select({ amount: expenses.amount }).from(expenses).where(where),
      this.db.select({ total: count() }).from(expenses).where(eq(expenses.userId, userId)),
    ]);
    const totalAmount = matchingRows.reduce((total, expense) => total + expense.amount, 0);
    const transactionCount = matchingRows.length;

    return {
      totalAmount,
      transactionCount,
      totalRecordCount: Number(totalRows[0]?.total ?? 0),
      averageAmount: transactionCount > 0 ? totalAmount / transactionCount : 0,
    };
  }

  async create(userId: string, payload: Omit<Expense, "id">) {
    const expense = normalizeExpense(createId("expense"), payload);
    const [row] = await this.db
      .insert(expenses)
      .values({ ...toExpenseValues(expense), userId })
      .returning();
    return expenseFromRow(row);
  }

  async createBulk(userId: string, rows: ParsedExpenseRow[], date = todayDate()) {
    if (!Array.isArray(rows) || rows.some((row) => !row || typeof row !== "object"))
      throw new BadRequestException("Rows must be an array of expense records.");
    const expensesToInsert = rows
      .filter((row) => textValue(row.itemName) && numberValue(row.amount) > 0)
      .map((row) =>
        normalizeExpense(createId("expense"), {
          date,
          itemName: row.itemName,
          category: row.category,
          amount: row.amount,
          quantity: row.quantity,
          sourceType: "text",
        })
      );

    if (!expensesToInsert.length) {
      return [];
    }

    const insertedRows = await this.db
      .insert(expenses)
      .values(expensesToInsert.map((expense) => ({ ...toExpenseValues(expense), userId })))
      .returning();
    return insertedRows.map(expenseFromRow);
  }

  async remove(userId: string, expenseId: string) {
    await this.db
      .delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)));
    return { id: expenseId };
  }

  private getWhere(userId: string, filters: ExpenseFilters) {
    const conditions = [eq(expenses.userId, userId)];

    if (filters.search) conditions.push(ilike(expenses.itemName, `%${filters.search}%`));
    if (filters.date) conditions.push(eq(expenses.date, filters.date));
    if (filters.category) conditions.push(eq(expenses.category, filters.category));
    if (filters.paymentMethod) conditions.push(eq(expenses.paymentMethod, filters.paymentMethod));

    return and(...conditions);
  }
}
