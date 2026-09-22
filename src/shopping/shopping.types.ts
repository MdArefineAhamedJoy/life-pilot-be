export type ShoppingItemStatus = "pending" | "purchased";

export type ShoppingItem = {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  estimatedPrice?: number;
  status: ShoppingItemStatus;
  note?: string;
  purchasedAt?: string;
  createdAt?: string;
};

export type ShoppingFilters = {
  search?: string;
  status?: ShoppingItemStatus;
  category?: string;
};

export type ShoppingSummary = {
  totalItems: number;
  pendingItems: number;
  purchasedItems: number;
  estimatedTotal: number;
};
