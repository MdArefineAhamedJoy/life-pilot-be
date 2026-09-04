import { Inject, Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { expenses } from "../db/schema";
import { expenseFromRow, toExpenseValues } from "../shared/life-os.mapper";
import { createId, normalizeExpense, numberValue, textValue, todayDate } from "../shared/life-os.validation";
import type { Expense, ParsedExpenseRow } from "./expenses.types";

@Injectable()
export class ExpensesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll() {
    const rows = await this.db.select().from(expenses).orderBy(desc(expenses.date), desc(expenses.createdAt));
    return rows.map(expenseFromRow);
  }

  async create(payload: Omit<Expense, "id">) {
    const expense = normalizeExpense(createId("expense"), payload);
    const [row] = await this.db.insert(expenses).values(toExpenseValues(expense)).returning();
    return expenseFromRow(row);
  }

  async createBulk(rows: ParsedExpenseRow[], date = todayDate()) {
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

    const insertedRows = await this.db.insert(expenses).values(expensesToInsert.map(toExpenseValues)).returning();
    return insertedRows.map(expenseFromRow);
  }

  async remove(expenseId: string) {
    await this.db.delete(expenses).where(eq(expenses.id, expenseId));
    return { id: expenseId };
  }
}
