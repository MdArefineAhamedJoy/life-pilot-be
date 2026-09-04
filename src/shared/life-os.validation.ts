import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { defaultState } from "./life-os.defaults";
import type { BudgetCategory } from "../categories/categories.types";
import type { Expense } from "../expenses/expenses.types";
import type { LifeOsState } from "../life-os-state/life-os-state.types";
import type { LifeNote } from "../notes/notes.types";
import type { LifeSettings } from "../settings/settings.types";
import type { RoutineTask } from "../tasks/tasks.types";
import type { TimerSession } from "../timer-sessions/timer-sessions.types";

const categoryTypes = ["daily", "weekly", "monthly"] as const;
const budgetStatuses = ["active", "paused", "completed"] as const;
const categoryStatuses = ["active", "pushed", "blocked"] as const;
const sourceTypes = ["manual", "image", "text", "recurring"] as const;
const priorities = ["low", "medium", "high"] as const;
const taskStatuses = ["pending", "active", "completed", "skipped", "delayed", "missed"] as const;
const repeatRules = ["daily", "weekly", "custom", "once"] as const;
const timerModes = ["timer", "stopwatch", "focus"] as const;
const aiProviders = ["off", "free-api", "local"] as const;

export function createId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function requiredText(value: unknown, field: string) {
  const text = optionalText(value);
  if (!text) {
    throw new BadRequestException(`${field} is required.`);
  }
  return text;
}

export function numberValue(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function optionalNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function dateValue(value: unknown) {
  if (typeof value !== "string" || !value) {
    return new Date();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function isoDate(value: Date) {
  return value.toISOString();
}

export function normalizeTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
    : [];
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function maybeOneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : undefined;
}

export function normalizeCategory(id: string, payload: Partial<BudgetCategory>): BudgetCategory {
  return {
    id,
    name: requiredText(payload.name, "Category name"),
    type: oneOf(payload.type, categoryTypes, "monthly"),
    monthlyLimit: numberValue(payload.monthlyLimit),
    weeklyLimit: optionalNumber(payload.weeklyLimit),
    dailyLimit: optionalNumber(payload.dailyLimit),
    startDate: optionalText(payload.startDate),
    endDate: optionalText(payload.endDate),
    status: maybeOneOf(payload.status, budgetStatuses),
    categoryStatus: maybeOneOf(payload.categoryStatus, categoryStatuses),
    note: optionalText(payload.note),
    extraNote: optionalText(payload.extraNote),
    color: textValue(payload.color, "teal") || "teal",
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
  };
}

export function normalizeExpense(id: string, payload: Partial<Expense>): Expense {
  return {
    id,
    date: requiredText(payload.date, "Expense date"),
    itemName: requiredText(payload.itemName, "Expense item name"),
    category: requiredText(payload.category, "Expense category"),
    amount: numberValue(payload.amount),
    quantity: optionalNumber(payload.quantity),
    unit: optionalText(payload.unit),
    paymentMethod: optionalText(payload.paymentMethod),
    note: optionalText(payload.note),
    sourceType: oneOf(payload.sourceType, sourceTypes, "manual"),
  };
}

export function normalizeTask(id: string, payload: Partial<RoutineTask>): RoutineTask {
  return {
    id,
    title: requiredText(payload.title, "Task title"),
    category: requiredText(payload.category, "Task category"),
    priority: oneOf(payload.priority, priorities, "medium"),
    plannedStart: requiredText(payload.plannedStart, "Task start time"),
    plannedEnd: requiredText(payload.plannedEnd, "Task end time"),
    order: optionalNumber(payload.order),
    actualMinutes: optionalNumber(payload.actualMinutes),
    status: oneOf(payload.status, taskStatuses, "pending"),
    repeatRule: oneOf(payload.repeatRule, repeatRules, "daily"),
    alertEnabled: typeof payload.alertEnabled === "boolean" ? payload.alertEnabled : undefined,
    alertOffsetMinutes: optionalNumber(payload.alertOffsetMinutes),
    reminderAt: optionalText(payload.reminderAt),
    completedAt: optionalText(payload.completedAt),
    note: optionalText(payload.note),
  };
}

export function normalizeTimerSession(id: string, payload: Partial<TimerSession>): TimerSession {
  return {
    id,
    taskId: optionalText(payload.taskId),
    title: requiredText(payload.title, "Timer title"),
    category: requiredText(payload.category, "Timer category"),
    durationSeconds: Math.round(numberValue(payload.durationSeconds)),
    mode: oneOf(payload.mode, timerModes, "stopwatch"),
    createdAt: optionalText(payload.createdAt) ?? new Date().toISOString(),
  };
}

export function normalizeNote(id: string, payload: Partial<LifeNote>): LifeNote {
  const timestamp = new Date().toISOString();
  return {
    id,
    title: requiredText(payload.title, "Note title"),
    body: textValue(payload.body),
    tags: normalizeTags(payload.tags),
    createdAt: optionalText(payload.createdAt) ?? timestamp,
    updatedAt: optionalText(payload.updatedAt) ?? timestamp,
  };
}

export function normalizeSettings(payload: Partial<LifeSettings>): LifeSettings {
  return {
    ...defaultState.settings,
    ...payload,
    profileName: textValue(payload.profileName, defaultState.settings.profileName),
    profileEmail: textValue(payload.profileEmail, defaultState.settings.profileEmail),
    profilePhone: textValue(payload.profilePhone, defaultState.settings.profilePhone),
    profileLocation: textValue(payload.profileLocation, defaultState.settings.profileLocation),
    profileRole: textValue(payload.profileRole, defaultState.settings.profileRole),
    profileBio: textValue(payload.profileBio, defaultState.settings.profileBio),
    profileImage: textValue(payload.profileImage, defaultState.settings.profileImage),
    currency: textValue(payload.currency, defaultState.settings.currency) || defaultState.settings.currency,
    notificationEnabled: booleanValue(payload.notificationEnabled),
    quietHoursStart: textValue(payload.quietHoursStart, defaultState.settings.quietHoursStart),
    quietHoursEnd: textValue(payload.quietHoursEnd, defaultState.settings.quietHoursEnd),
    aiProvider: oneOf(payload.aiProvider, aiProviders, "off"),
  };
}

export function normalizeState(payload: Partial<LifeOsState>): LifeOsState {
  return {
    categories: (payload.categories ?? defaultState.categories).map((category) =>
      normalizeCategory(category.id || createId("cat"), category),
    ),
    expenses: (payload.expenses ?? defaultState.expenses).map((expense) =>
      normalizeExpense(expense.id || createId("expense"), expense),
    ),
    tasks: (payload.tasks ?? defaultState.tasks).map((task) => normalizeTask(task.id || createId("task"), task)),
    timerSessions: (payload.timerSessions ?? defaultState.timerSessions).map((session) =>
      normalizeTimerSession(session.id || createId("timer"), session),
    ),
    notes: (payload.notes ?? defaultState.notes).map((note) => normalizeNote(note.id || createId("note"), note)),
    settings: normalizeSettings(payload.settings ?? defaultState.settings),
  };
}
