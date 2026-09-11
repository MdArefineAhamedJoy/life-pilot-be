import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { Expense, ParsedExpenseRow } from "./expenses.types";
import { getPagination, paginate } from "../shared/api-response";

@Controller("life-os/expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string
  ) {
    const expenses = await this.expensesService.findAll(user.id);
    return paginate(expenses, getPagination(pageQuery, limitQuery));
  }

  @Post()
  create(@CurrentUser() user: AuthUserResponse, @Body() payload: Omit<Expense, "id">) {
    return this.expensesService.create(user.id, payload);
  }

  @Post("bulk")
  createBulk(
    @CurrentUser() user: AuthUserResponse,
    @Body("rows") rows: ParsedExpenseRow[] = [],
    @Body("date") date?: string
  ) {
    return this.expensesService.createBulk(user.id, rows, date);
  }

  @Delete(":expenseId")
  remove(@CurrentUser() user: AuthUserResponse, @Param("expenseId") expenseId: string) {
    return this.expensesService.remove(user.id, expenseId);
  }
}
