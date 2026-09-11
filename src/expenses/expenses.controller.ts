import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { Expense, ExpenseFilters, ParsedExpenseRow } from "./expenses.types";
import { getPagination } from "../shared/api-response";

function getFilters(
  search?: string,
  date?: string,
  category?: string,
  paymentMethod?: string
): ExpenseFilters {
  const cleanDate = date?.trim();
  if (cleanDate && !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    throw new BadRequestException("Expense date must use YYYY-MM-DD format.");
  }

  return {
    search: search?.trim() || undefined,
    date: cleanDate || undefined,
    category: category?.trim() || undefined,
    paymentMethod: paymentMethod?.trim() || undefined,
  };
}

@Controller("life-os/expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string,
    @Query("search") search?: string,
    @Query("date") date?: string,
    @Query("category") category?: string,
    @Query("paymentMethod") paymentMethod?: string
  ) {
    const { page, limit } = getPagination(pageQuery, limitQuery);
    return this.expensesService.findAll(
      user.id,
      page,
      limit,
      getFilters(search, date, category, paymentMethod)
    );
  }

  @Get("summary")
  getSummary(
    @CurrentUser() user: AuthUserResponse,
    @Query("search") search?: string,
    @Query("date") date?: string,
    @Query("category") category?: string,
    @Query("paymentMethod") paymentMethod?: string
  ) {
    return this.expensesService.getSummary(
      user.id,
      getFilters(search, date, category, paymentMethod)
    );
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
