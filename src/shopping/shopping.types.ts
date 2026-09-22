export type ShoppingItemStatus = "pending" | "purchased";
export type WarrantyStatus = "none" | "warranty" | "guarantee" | "both";

export type ShoppingDocument = {
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  model?: string;
  storeName?: string;
  quantity?: number;
  unit?: string;
  estimatedPrice?: number;
  productPrice?: number;
  totalPrice?: number;
  purchaseDate?: string;
  paymentMethod?: string;
  receiptDocuments?: ShoppingDocument[];
  warrantyStatus?: WarrantyStatus;
  warrantyExpiresAt?: string;
  warrantyNote?: string;
  warrantyDocuments?: ShoppingDocument[];
  expenseId?: string;
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
  purchasedTotal: number;
};
