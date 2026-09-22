import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import { getPagination } from "../shared/api-response";
import { ShoppingService } from "./shopping.service";
import type { ShoppingItem, ShoppingItemStatus } from "./shopping.types";

@Controller("life-os/shopping")
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string,
    @Query("search") search?: string,
    @Query("status") status?: ShoppingItemStatus,
    @Query("category") category?: string
  ) {
    const { page, limit } = getPagination(pageQuery, limitQuery);
    return this.shoppingService.findAll(user.id, page, limit, { search, status, category });
  }

  @Get("summary")
  getSummary(
    @CurrentUser() user: AuthUserResponse,
    @Query("search") search?: string,
    @Query("status") status?: ShoppingItemStatus,
    @Query("category") category?: string
  ) {
    return this.shoppingService.getSummary(user.id, { search, status, category });
  }

  @Post()
  create(@CurrentUser() user: AuthUserResponse, @Body() payload: Omit<ShoppingItem, "id">) {
    return this.shoppingService.create(user.id, payload);
  }

  @Patch(":shoppingItemId")
  update(
    @CurrentUser() user: AuthUserResponse,
    @Param("shoppingItemId") shoppingItemId: string,
    @Body() payload: Partial<ShoppingItem>
  ) {
    return this.shoppingService.update(user.id, shoppingItemId, payload);
  }

  @Patch(":shoppingItemId/purchased")
  markPurchased(
    @CurrentUser() user: AuthUserResponse,
    @Param("shoppingItemId") shoppingItemId: string
  ) {
    return this.shoppingService.markPurchased(user.id, shoppingItemId);
  }

  @Delete(":shoppingItemId")
  remove(@CurrentUser() user: AuthUserResponse, @Param("shoppingItemId") shoppingItemId: string) {
    return this.shoppingService.remove(user.id, shoppingItemId);
  }
}
