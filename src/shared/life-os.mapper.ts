import { budgetCategories } from "../categories/categories.schema";
import { expenses } from "../expenses/expenses.schema";
import { lifeNotes } from "../notes/notes.schema";
import { lifeSettings } from "../settings/settings.schema";
import { routineTasks } from "../tasks/tasks.schema";
import { timerSessions } from "../timer-sessions/timer-sessions.schema";
import { settingsId } from "./life-os.defaults";
import { dateValue, isoDate } from "./life-os.validation";
import type { BudgetCategory } from "../categories/categories.types";
import type { Expense } from "../expenses/expenses.types";
import type { LifeNote } from "../notes/notes.types";
import type { LifeSettings } from "../settings/settings.types";
import type { RoutineTask } from "../tasks/tasks.types";
import type { TimerSession } from "../timer-sessions/timer-sessions.types";

export function toCategoryValues(category: BudgetCategory): typeof budgetCategories.$inferInsert {
  return {
    ...category,
    weeklyLimit: category.weeklyLimit ?? null,
    dailyLimit: category.dailyLimit ?? null,
    startDate: category.startDate ?? null,
    endDate: category.endDate ?? null,
    status: category.status ?? null,
    categoryStatus: category.categoryStatus ?? null,
    note: category.note ?? null,
    extraNote: category.extraNote ?? null,
    updatedAt: new Date(),
  };
}

export function toExpenseValues(expense: Expense): typeof expenses.$inferInsert {
  return {
    ...expense,
    quantity: expense.quantity ?? null,
    unit: expense.unit ?? null,
    paymentMethod: expense.paymentMethod ?? null,
    note: expense.note ?? null,
    updatedAt: new Date(),
  };
}

export function toTaskValues(task: RoutineTask): typeof routineTasks.$inferInsert {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    priority: task.priority,
    plannedStart: task.plannedStart,
    plannedEnd: task.plannedEnd,
    sortOrder: task.order ?? null,
    actualMinutes: task.actualMinutes ?? null,
    status: task.status,
    repeatRule: task.repeatRule,
    alertEnabled: task.alertEnabled ?? null,
    alertOffsetMinutes: task.alertOffsetMinutes ?? null,
    reminderAt: task.reminderAt ?? null,
    completedAt: task.completedAt ?? null,
    note: task.note ?? null,
    updatedAt: new Date(),
  };
}

export function toTimerValues(session: TimerSession): typeof timerSessions.$inferInsert {
  return {
    id: session.id,
    taskId: session.taskId ?? null,
    title: session.title,
    category: session.category,
    durationSeconds: session.durationSeconds,
    mode: session.mode,
    createdAt: dateValue(session.createdAt),
  };
}

export function toNoteValues(note: LifeNote): typeof lifeNotes.$inferInsert {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    tags: note.tags,
    createdAt: dateValue(note.createdAt),
    updatedAt: dateValue(note.updatedAt),
  };
}

export function toSettingsValues(settings: LifeSettings): typeof lifeSettings.$inferInsert {
  return {
    id: settingsId,
    ...settings,
    updatedAt: new Date(),
  };
}

export function categoryFromRow(category: typeof budgetCategories.$inferSelect): BudgetCategory {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    monthlyLimit: category.monthlyLimit,
    weeklyLimit: category.weeklyLimit ?? undefined,
    dailyLimit: category.dailyLimit ?? undefined,
    startDate: category.startDate ?? undefined,
    endDate: category.endDate ?? undefined,
    status: category.status ?? undefined,
    categoryStatus: category.categoryStatus ?? undefined,
    note: category.note ?? undefined,
    extraNote: category.extraNote ?? undefined,
    color: category.color,
    isActive: category.isActive,
  };
}

export function expenseFromRow(expense: typeof expenses.$inferSelect): Expense {
  return {
    id: expense.id,
    date: expense.date,
    itemName: expense.itemName,
    category: expense.category,
    amount: expense.amount,
    quantity: expense.quantity ?? undefined,
    unit: expense.unit ?? undefined,
    paymentMethod: expense.paymentMethod ?? undefined,
    note: expense.note ?? undefined,
    sourceType: expense.sourceType,
  };
}

export function taskFromRow(task: typeof routineTasks.$inferSelect): RoutineTask {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    priority: task.priority,
    plannedStart: task.plannedStart,
    plannedEnd: task.plannedEnd,
    order: task.sortOrder ?? undefined,
    actualMinutes: task.actualMinutes ?? undefined,
    status: task.status,
    repeatRule: task.repeatRule,
    alertEnabled: task.alertEnabled ?? undefined,
    alertOffsetMinutes: task.alertOffsetMinutes ?? undefined,
    reminderAt: task.reminderAt ?? undefined,
    completedAt: task.completedAt ?? undefined,
    note: task.note ?? undefined,
  };
}

export function timerFromRow(session: typeof timerSessions.$inferSelect): TimerSession {
  return {
    id: session.id,
    taskId: session.taskId ?? undefined,
    title: session.title,
    category: session.category,
    durationSeconds: session.durationSeconds,
    mode: session.mode,
    createdAt: isoDate(session.createdAt),
  };
}

export function noteFromRow(note: typeof lifeNotes.$inferSelect): LifeNote {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    tags: note.tags,
    createdAt: isoDate(note.createdAt),
    updatedAt: isoDate(note.updatedAt),
  };
}

export function settingsFromRow(settings: typeof lifeSettings.$inferSelect): LifeSettings {
  return {
    profileName: settings.profileName,
    profileEmail: settings.profileEmail,
    profilePhone: settings.profilePhone,
    profileLocation: settings.profileLocation,
    profileRole: settings.profileRole,
    profileBio: settings.profileBio,
    profileImage: settings.profileImage,
    currency: settings.currency,
    notificationEnabled: settings.notificationEnabled,
    quietHoursStart: settings.quietHoursStart,
    quietHoursEnd: settings.quietHoursEnd,
    aiProvider: settings.aiProvider,
  };
}
