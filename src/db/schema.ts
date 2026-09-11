// Drizzle's single schema entry point. Table declarations remain colocated with
// the feature that owns them, so feature code does not grow a shared mega-schema.
export * from "../accounts/accounts.schema";
export * from "../auth/auth.schema";
export * from "../budgets/budgets.schema";
export * from "../categories/categories.schema";
export * from "../expenses/expenses.schema";
export * from "../notes/notes.schema";
export * from "../settings/settings.schema";
export * from "../tasks/tasks.schema";
export * from "../timer-sessions/timer-sessions.schema";
