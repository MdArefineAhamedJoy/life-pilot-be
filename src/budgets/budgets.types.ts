export type BudgetStatus = "active" | "paused" | "completed";

export type BudgetType = "daily" | "weekly" | "monthly";

export type Budget = {
  id: string;
  name: string;
  type: BudgetType;
  monthlyLimit: number;
  weeklyLimit?: number;
  dailyLimit?: number;
  startDate?: string;
  endDate?: string;
  status?: BudgetStatus;
  note?: string;
  extraNote?: string;
  color: string;
  isActive: boolean;
};

export type BudgetUsage = Budget & {
  spent: number;
  remaining: number;
  percent: number;
  isOverBudget: boolean;
};

export type BudgetFilters = {
  search?: string;
  status?: BudgetStatus;
  type?: BudgetType;
};

export type BudgetSummary = {
  totalBudget: number;
  totalSpent: number;
  todaySpent: number;
  totalActiveBudget: number;
  remaining: number;
  usageProgress: number;
  todayUsageProgress: number;
  activeBudgetProgress: number;
  budgetCount: number;
};
