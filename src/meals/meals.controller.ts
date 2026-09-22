import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import { MealsService } from "./meals.service";
import type { MealPlan, MealStatus } from "./meals.types";

@Controller("life-os/meals")
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}
  @Get() findAll(@CurrentUser() user: AuthUserResponse, @Query("dateFrom") dateFrom?: string, @Query("dateTo") dateTo?: string, @Query("status") status?: MealStatus) { return this.mealsService.findAll(user.id, { dateFrom, dateTo, status }); }
  @Get("summary") summary(@CurrentUser() user: AuthUserResponse, @Query("dateFrom") dateFrom?: string, @Query("dateTo") dateTo?: string) { return this.mealsService.getSummary(user.id, { dateFrom, dateTo }); }
  @Post() create(@CurrentUser() user: AuthUserResponse, @Body() payload: Omit<MealPlan, "id">) { return this.mealsService.create(user.id, payload); }
  @Put(":mealId") update(@CurrentUser() user: AuthUserResponse, @Param("mealId") mealId: string, @Body() payload: Partial<MealPlan>) { return this.mealsService.update(user.id, mealId, payload); }
  @Patch(":mealId/status") status(@CurrentUser() user: AuthUserResponse, @Param("mealId") mealId: string, @Body("status") status: MealStatus) { return this.mealsService.updateStatus(user.id, mealId, status); }
  @Delete(":mealId") remove(@CurrentUser() user: AuthUserResponse, @Param("mealId") mealId: string) { return this.mealsService.remove(user.id, mealId); }
}
