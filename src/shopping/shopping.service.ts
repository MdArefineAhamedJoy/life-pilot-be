import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { createId, normalizeShoppingItem } from "../shared/life-os.validation";
import { shoppingItemFromRow, toShoppingItemValues } from "../shared/life-os.mapper";
import { shoppingItems } from "./shopping.schema";
import type { ShoppingFilters, ShoppingItem, ShoppingSummary } from "./shopping.types";

@Injectable()
export class ShoppingService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string, page: number, limit: number, filters: ShoppingFilters) {
    const where = this.getWhere(userId, filters);
    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(shoppingItems)
        .where(where)
        .orderBy(desc(shoppingItems.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(shoppingItems).where(where),
    ]);

    return {
      items: rows.map(shoppingItemFromRow),
      page,
      limit,
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async getSummary(userId: string, filters: ShoppingFilters): Promise<ShoppingSummary> {
    const rows = await this.db.select().from(shoppingItems).where(this.getWhere(userId, filters));
    const totalItems = rows.length;
    const pendingItems = rows.filter((item) => item.status === "pending").length;
    const purchasedItems = totalItems - pendingItems;
    const estimatedTotal = rows.reduce((total, item) => total + (item.estimatedPrice ?? 0), 0);

    return { totalItems, pendingItems, purchasedItems, estimatedTotal };
  }

  async create(userId: string, payload: Omit<ShoppingItem, "id">) {
    const item = normalizeShoppingItem(createId("shop"), payload);
    const [row] = await this.db
      .insert(shoppingItems)
      .values({ ...toShoppingItemValues(item), userId })
      .returning();
    return shoppingItemFromRow(row);
  }

  async update(userId: string, shoppingItemId: string, payload: Partial<ShoppingItem>) {
    const current = await this.db.query.shoppingItems.findFirst({
      where: and(eq(shoppingItems.id, shoppingItemId), eq(shoppingItems.userId, userId)),
    });
    if (!current) throw new NotFoundException("Shopping item was not found.");

    const item = normalizeShoppingItem(shoppingItemId, {
      id: current.id,
      name: current.name,
      category: current.category ?? undefined,
      quantity: current.quantity ?? undefined,
      unit: current.unit ?? undefined,
      estimatedPrice: current.estimatedPrice ?? undefined,
      status: current.status,
      note: current.note ?? undefined,
      purchasedAt: current.purchasedAt?.toISOString(),
      ...payload,
    });
    const [row] = await this.db
      .update(shoppingItems)
      .set(toShoppingItemValues(item))
      .where(and(eq(shoppingItems.id, shoppingItemId), eq(shoppingItems.userId, userId)))
      .returning();
    return shoppingItemFromRow(row);
  }

  markPurchased(userId: string, shoppingItemId: string) {
    return this.update(userId, shoppingItemId, {
      status: "purchased",
      purchasedAt: new Date().toISOString(),
    });
  }

  async remove(userId: string, shoppingItemId: string) {
    await this.db
      .delete(shoppingItems)
      .where(and(eq(shoppingItems.id, shoppingItemId), eq(shoppingItems.userId, userId)));
    return { id: shoppingItemId };
  }

  private getWhere(userId: string, filters: ShoppingFilters) {
    const conditions = [eq(shoppingItems.userId, userId)];
    if (filters.search?.trim())
      conditions.push(ilike(shoppingItems.name, `%${filters.search.trim()}%`));
    if (filters.status === "pending" || filters.status === "purchased")
      conditions.push(eq(shoppingItems.status, filters.status));
    if (filters.category?.trim())
      conditions.push(eq(shoppingItems.category, filters.category.trim()));
    return and(...conditions);
  }
}
