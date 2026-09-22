import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { expenses } from "../expenses/expenses.schema";
import { createId, normalizeExpense, normalizeShoppingItem, todayDate } from "../shared/life-os.validation";
import { shoppingItemFromRow, toExpenseValues, toShoppingItemValues } from "../shared/life-os.mapper";
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
    const purchasedTotal = rows.reduce(
      (total, item) => total + (item.status === "purchased" ? (item.totalPrice ?? item.estimatedPrice ?? 0) : 0),
      0
    );

    return { totalItems, pendingItems, purchasedItems, estimatedTotal, purchasedTotal };
  }

  async create(userId: string, payload: Omit<ShoppingItem, "id">) {
    const item = normalizeShoppingItem(createId("shop"), payload);
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(shoppingItems)
        .values({ ...toShoppingItemValues(item), userId })
        .returning();

      if (item.status !== "purchased" || this.getPaidAmount(item) <= 0) {
        return shoppingItemFromRow(row);
      }

      const expense = normalizeExpense(createId("expense"), {
        date: item.purchaseDate ?? todayDate(),
        itemName: item.name,
        category: item.category ?? "Shopping",
        amount: this.getPaidAmount(item),
        quantity: item.quantity,
        unit: item.unit,
        paymentMethod: item.paymentMethod,
        note: this.shoppingExpenseNote(item),
        sourceType: "manual",
      });
      const [expenseRow] = await tx
        .insert(expenses)
        .values({ ...toExpenseValues(expense), userId })
        .returning();
      const [updatedRow] = await tx
        .update(shoppingItems)
        .set({ expenseId: expenseRow.id, updatedAt: new Date() })
        .where(eq(shoppingItems.id, row.id))
        .returning();
      return shoppingItemFromRow(updatedRow);
    });
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
      subCategory: current.subCategory ?? undefined,
      brand: current.brand ?? undefined,
      model: current.model ?? undefined,
      storeName: current.storeName ?? undefined,
      quantity: current.quantity ?? undefined,
      unit: current.unit ?? undefined,
      estimatedPrice: current.estimatedPrice ?? undefined,
      productPrice: current.productPrice ?? undefined,
      totalPrice: current.totalPrice ?? undefined,
      purchaseDate: current.purchaseDate ?? undefined,
      paymentMethod: current.paymentMethod ?? undefined,
      receiptDocuments: (current.receiptDocuments as ShoppingItem["receiptDocuments"]) ?? [],
      warrantyStatus: current.warrantyStatus as ShoppingItem["warrantyStatus"],
      warrantyExpiresAt: current.warrantyExpiresAt ?? undefined,
      warrantyNote: current.warrantyNote ?? undefined,
      warrantyDocuments: (current.warrantyDocuments as ShoppingItem["warrantyDocuments"]) ?? [],
      expenseId: current.expenseId ?? undefined,
      status: current.status,
      note: current.note ?? undefined,
      purchasedAt: current.purchasedAt?.toISOString(),
      ...payload,
    });
    return this.db.transaction(async (tx) => {
      let expenseId = item.expenseId;
      const paidAmount = this.getPaidAmount(item);

      if (item.status === "purchased" && paidAmount > 0) {
        const expense = normalizeExpense(expenseId ?? createId("expense"), {
          date: item.purchaseDate ?? todayDate(),
          itemName: item.name,
          category: item.category ?? "Shopping",
          amount: paidAmount,
          quantity: item.quantity,
          unit: item.unit,
          paymentMethod: item.paymentMethod,
          note: this.shoppingExpenseNote(item),
          sourceType: "manual",
        });
        if (expenseId) {
          await tx
            .update(expenses)
            .set(toExpenseValues(expense))
            .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)));
        } else {
          const [expenseRow] = await tx
            .insert(expenses)
            .values({ ...toExpenseValues(expense), userId })
            .returning();
          expenseId = expenseRow.id;
        }
      }

      const [row] = await tx
        .update(shoppingItems)
        .set(toShoppingItemValues({ ...item, expenseId }))
        .where(and(eq(shoppingItems.id, shoppingItemId), eq(shoppingItems.userId, userId)))
        .returning();
      return shoppingItemFromRow(row);
    });
  }

  markPurchased(userId: string, shoppingItemId: string) {
    return this.update(userId, shoppingItemId, {
      status: "purchased",
      purchasedAt: new Date().toISOString(),
    });
  }

  private getPaidAmount(item: ShoppingItem) {
    return item.totalPrice ?? item.estimatedPrice ?? 0;
  }

  private shoppingExpenseNote(item: ShoppingItem) {
    const details = [
      item.subCategory && `Subcategory: ${item.subCategory}`,
      item.storeName && `Store: ${item.storeName}`,
      item.brand && `Brand: ${item.brand}`,
    ].filter(Boolean);
    return details.join(" · ") || item.note;
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
