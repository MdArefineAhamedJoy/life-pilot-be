import type { BudgetCategory } from "../categories/categories.types";
import type { Expense } from "../expenses/expenses.types";
import type { LifeNote } from "../notes/notes.types";
import type { LifeSettings } from "../settings/settings.types";
import type { RoutineTask } from "../tasks/tasks.types";
import type { TimerSession } from "../timer-sessions/timer-sessions.types";

export type LifeOsState = {
  categories: BudgetCategory[];
  expenses: Expense[];
  tasks: RoutineTask[];
  timerSessions: TimerSession[];
  notes: LifeNote[];
  settings: LifeSettings;
};
