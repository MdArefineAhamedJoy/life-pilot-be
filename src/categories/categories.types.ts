export type BudgetCategory = {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly";
  monthlyLimit: number;
  weeklyLimit?: number;
  dailyLimit?: number;
  startDate?: string;
  endDate?: string;
  status?: "active" | "paused" | "completed";
  categoryStatus?: "active" | "pushed" | "blocked";
  note?: string;
  extraNote?: string;
  color: string;
  isActive: boolean;
};
