export type { Expense } from "../shared/life-os.types";

export type ParsedExpenseRow = {
  itemName: string;
  category: string;
  amount: number;
  quantity?: number;
};
