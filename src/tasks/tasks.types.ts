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
