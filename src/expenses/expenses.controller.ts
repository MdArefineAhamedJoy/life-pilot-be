import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import type { Expense, ParsedExpenseRow } from "./expenses.types";

@Controller("life-os/expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Post()
  create(@Body() payload: Omit<Expense, "id">) {
    return this.expensesService.create(payload);
  }

  @Post("bulk")
  createBulk(@Body("rows") rows: ParsedExpenseRow[] = [], @Body("date") date?: string) {
    return this.expensesService.createBulk(rows, date);
  }

  @Delete(":expenseId")
  remove(@Param("expenseId") expenseId: string) {
    return this.expensesService.remove(expenseId);
  }
}
