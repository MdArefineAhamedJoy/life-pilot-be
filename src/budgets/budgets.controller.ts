import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import { getPagination } from "../shared/api-response";
import { BudgetsService } from "./budgets.service";
import type { Budget, BudgetFilters, BudgetStatus, BudgetType } from "./budgets.types";

const budgetStatuses: BudgetStatus[] = ["active", "paused", "completed"];
const budgetTypes: BudgetType[] = ["daily", "weekly", "monthly"];

function getFilters(search?: string, status?: string, type?: string): BudgetFilters {
  if (status && !budgetStatuses.includes(status as BudgetStatus)) {
    throw new BadRequestException("Budget status is invalid.");
  }

  if (type && !budgetTypes.includes(type as BudgetType)) {
    throw new BadRequestException("Budget type is invalid.");
  }

  return {
    search: search?.trim() || undefined,
    status: status as BudgetStatus | undefined,
    type: type as BudgetType | undefined,
  };
}

@Controller("life-os/budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("type") type?: string
  ) {
    const { page, limit } = getPagination(pageQuery, limitQuery);
    return this.budgetsService.findAll(user.id, page, limit, getFilters(search, status, type));
  }

  @Get("summary")
  getSummary(
    @CurrentUser() user: AuthUserResponse,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("type") type?: string
  ) {
    return this.budgetsService.getSummary(user.id, getFilters(search, status, type));
  }

  @Get(":budgetId")
  findOne(@CurrentUser() user: AuthUserResponse, @Param("budgetId") budgetId: string) {
    return this.budgetsService.findOne(user.id, budgetId);
  }

  @Post()
  create(@CurrentUser() user: AuthUserResponse, @Body() payload: Omit<Budget, "id">) {
    return this.budgetsService.create(user.id, payload);
  }

  @Put(":budgetId")
  update(
    @CurrentUser() user: AuthUserResponse,
    @Param("budgetId") budgetId: string,
    @Body() payload: Partial<Budget>
  ) {
    return this.budgetsService.update(user.id, budgetId, payload);
  }

  @Patch(":budgetId/status")
  updateStatus(
    @CurrentUser() user: AuthUserResponse,
    @Param("budgetId") budgetId: string,
    @Body("status") status: BudgetStatus
  ) {
    return this.budgetsService.updateStatus(user.id, budgetId, status);
  }

  @Delete(":budgetId")
  remove(@CurrentUser() user: AuthUserResponse, @Param("budgetId") budgetId: string) {
    return this.budgetsService.remove(user.id, budgetId);
  }
}
