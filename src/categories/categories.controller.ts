import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { BudgetCategory } from "./categories.types";

@Controller("life-os/categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUserResponse) {
    return this.categoriesService.findAll(user.id);
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
