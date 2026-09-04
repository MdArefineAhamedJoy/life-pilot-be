import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import type { BudgetCategory } from "./categories.types";

@Controller("life-os/categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  create(@Body() payload: Omit<BudgetCategory, "id">) {
    return this.categoriesService.create(payload);
  }

  @Put(":categoryId")
  update(@Param("categoryId") categoryId: string, @Body() payload: Partial<BudgetCategory>) {
    return this.categoriesService.update(categoryId, payload);
  }

  @Patch(":categoryId/limit")
  updateLimit(@Param("categoryId") categoryId: string, @Body("monthlyLimit") monthlyLimit: unknown) {
    return this.categoriesService.updateLimit(categoryId, monthlyLimit);
  }

  @Delete(":categoryId")
  remove(@Param("categoryId") categoryId: string) {
    return this.categoriesService.remove(categoryId);
  }
}
