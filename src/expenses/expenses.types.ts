export type ParsedExpenseRow = {
  itemName: string;
  category: string;
  amount: number;
  quantity?: number;
};

export type ExpenseSourceType = "manual" | "image" | "text" | "recurring";

export type Expense = {
  id: string;
  date: string;
  itemName: string;
  category: string;
  amount: number;
  quantity?: number;
  unit?: string;
  paymentMethod?: string;
  note?: string;
  sourceType: ExpenseSourceType;
};

export type ExpenseFilters = {
  search?: string;
  date?: string;
  category?: string;
  paymentMethod?: string;
};

export type ExpenseSummary = {
  totalAmount: number;
  transactionCount: number;
  totalRecordCount: number;
  averageAmount: number;
};
