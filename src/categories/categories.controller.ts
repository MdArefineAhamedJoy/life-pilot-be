import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { BudgetCategory } from "./categories.types";
import { getPagination } from "../shared/api-response";

@Controller("life-os/categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string
  ) {
    const { page, limit } = getPagination(pageQuery, limitQuery);
    return this.categoriesService.findAll(user.id, page, limit);
  }

  @Get(":categoryId")
  async findOne(@CurrentUser() user: AuthUserResponse, @Param("categoryId") categoryId: string) {
    return this.categoriesService.findOne(user.id, categoryId);
  }

  @Post()
  create(@CurrentUser() user: AuthUserResponse, @Body() payload: Omit<BudgetCategory, "id">) {
    return this.categoriesService.create(user.id, payload);
  }

  @Put(":categoryId")
  update(
    @CurrentUser() user: AuthUserResponse,
    @Param("categoryId") categoryId: string,
    @Body() payload: Partial<BudgetCategory>
  ) {
    return this.categoriesService.update(user.id, categoryId, payload);
  }

  @Patch(":categoryId/limit")
  updateLimit(
    @CurrentUser() user: AuthUserResponse,
    @Param("categoryId") categoryId: string,
    @Body("monthlyLimit") monthlyLimit: unknown
  ) {
    return this.categoriesService.updateLimit(user.id, categoryId, monthlyLimit);
  }

  @Delete(":categoryId")
  remove(@CurrentUser() user: AuthUserResponse, @Param("categoryId") categoryId: string) {
    return this.categoriesService.remove(user.id, categoryId);
  }
}
