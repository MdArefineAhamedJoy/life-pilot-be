import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { expenses } from "../db/schema";
import { expenseFromRow, toExpenseValues } from "../shared/life-os.mapper";
import { createId, normalizeExpense, numberValue, textValue, todayDate } from "../shared/life-os.validation";
import type { Expense, ParsedExpenseRow } from "./expenses.types";

@Injectable()
export class ExpensesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string) {
    const rows = await this.db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.date), desc(expenses.createdAt));
    return rows.map(expenseFromRow);
  }

  async create(userId: string, payload: Omit<Expense, "id">) {
    const expense = normalizeExpense(createId("expense"), payload);
    const [row] = await this.db.insert(expenses).values({ ...toExpenseValues(expense), userId }).returning();
    return expenseFromRow(row);
  }

  async createBulk(userId: string, rows: ParsedExpenseRow[], date = todayDate()) {
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
        }),
      );

    if (!expensesToInsert.length) {
      return [];
    }

    const insertedRows = await this.db.insert(expenses).values(expensesToInsert.map((expense) => ({ ...toExpenseValues(expense), userId }))).returning();
    return insertedRows.map(expenseFromRow);
  }

  async remove(userId: string, expenseId: string) {
    await this.db.delete(expenses).where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)));
    return { id: expenseId };
  }
}
