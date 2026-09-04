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

export type RoutineStatus = "pending" | "active" | "completed" | "skipped" | "delayed" | "missed";

export type RoutineTask = {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high";
  plannedStart: string;
  plannedEnd: string;
  order?: number;
  actualMinutes?: number;
  status: RoutineStatus;
  repeatRule: "daily" | "weekly" | "custom" | "once";
  alertEnabled?: boolean;
  alertOffsetMinutes?: number;
  reminderAt?: string;
  completedAt?: string;
  note?: string;
};

export type TimerSession = {
  id: string;
  taskId?: string;
  title: string;
  category: string;
  durationSeconds: number;
  mode: "timer" | "stopwatch" | "focus";
  createdAt?: string;
};

export type LifeNote = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type LifeSettings = {
  profileName: string;
  profileEmail: string;
  profilePhone: string;
  profileLocation: string;
  profileRole: string;
  profileBio: string;
  profileImage: string;
  currency: string;
  notificationEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  aiProvider: "off" | "free-api" | "local";
};

export type LifeOsState = {
  categories: BudgetCategory[];
  expenses: Expense[];
  tasks: RoutineTask[];
  timerSessions: TimerSession[];
  notes: LifeNote[];
  settings: LifeSettings;
};
