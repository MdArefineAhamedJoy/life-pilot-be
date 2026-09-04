export type TimerSession = {
  id: string;
  taskId?: string;
  title: string;
  category: string;
  durationSeconds: number;
  mode: "timer" | "stopwatch" | "focus";
  createdAt?: string;
};
