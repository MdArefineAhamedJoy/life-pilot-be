import { Inject, Injectable } from "@nestjs/common";
import { asc, desc, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { budgetCategories } from "../categories/categories.schema";
import { expenses } from "../expenses/expenses.schema";
import { lifeNotes } from "../notes/notes.schema";
import { lifeSettings } from "../settings/settings.schema";
import { routineTasks } from "../tasks/tasks.schema";
import { timerSessions } from "../timer-sessions/timer-sessions.schema";
import { defaultState } from "../shared/life-os.defaults";
import {
  categoryFromRow,
  expenseFromRow,
  noteFromRow,
  settingsFromRow,
  taskFromRow,
  timerFromRow,
  toCategoryValues,
  toExpenseValues,
  toNoteValues,
  toSettingsValues,
  toTaskValues,
  toTimerValues,
} from "../shared/life-os.mapper";
import type { LifeOsState } from "./life-os-state.types";
import { normalizeState } from "../shared/life-os.validation";
import { withAccountProfile } from "../shared/profile-settings";

@Injectable()
export class LifeOsStateService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getState(userId: string): Promise<LifeOsState> {
    await this.ensureState(userId);

    const [categoryRows, expenseRows, taskRows, timerRows, noteRows, settingsRow] =
      await Promise.all([
        this.db
          .select()
          .from(budgetCategories)
          .where(eq(budgetCategories.userId, userId))
          .orderBy(asc(budgetCategories.createdAt)),
        this.db
          .select()
          .from(expenses)
          .where(eq(expenses.userId, userId))
          .orderBy(desc(expenses.date), desc(expenses.createdAt)),
        this.db
          .select()
          .from(routineTasks)
          .where(eq(routineTasks.userId, userId))
          .orderBy(asc(routineTasks.sortOrder), asc(routineTasks.createdAt)),
        this.db
          .select()
          .from(timerSessions)
          .where(eq(timerSessions.userId, userId))
          .orderBy(desc(timerSessions.createdAt)),
        this.db
          .select()
          .from(lifeNotes)
          .where(eq(lifeNotes.userId, userId))
          .orderBy(desc(lifeNotes.updatedAt)),
        this.db.query.lifeSettings.findFirst({ where: eq(lifeSettings.id, userId) }),
      ]);

    return {
      categories: categoryRows.map(categoryFromRow),
      expenses: expenseRows.map(expenseFromRow),
      tasks: taskRows.map(taskFromRow),
      timerSessions: timerRows.map(timerFromRow),
      notes: noteRows.map(noteFromRow),
      settings: await withAccountProfile(
        this.db,
        userId,
        settingsRow ? settingsFromRow(settingsRow) : defaultState.settings
      ),
    };
  }

  async replaceState(userId: string, payload: Partial<LifeOsState>): Promise<LifeOsState> {
    const state = normalizeState(payload);

    await this.db.transaction(async (tx) => {
      await tx.delete(expenses).where(eq(expenses.userId, userId));
      await tx.delete(budgetCategories).where(eq(budgetCategories.userId, userId));
      await tx.delete(routineTasks).where(eq(routineTasks.userId, userId));
      await tx.delete(timerSessions).where(eq(timerSessions.userId, userId));
      await tx.delete(lifeNotes).where(eq(lifeNotes.userId, userId));
      await tx.delete(lifeSettings).where(eq(lifeSettings.id, userId));

      if (state.categories.length) {
        await tx
          .insert(budgetCategories)
          .values(state.categories.map((category) => ({ ...toCategoryValues(category), userId })));
      }

      if (state.expenses.length) {
        await tx
          .insert(expenses)
          .values(state.expenses.map((expense) => ({ ...toExpenseValues(expense), userId })));
      }

      if (state.tasks.length) {
        await tx
          .insert(routineTasks)
          .values(state.tasks.map((task) => ({ ...toTaskValues(task), userId })));
      }

      if (state.timerSessions.length) {
        await tx
          .insert(timerSessions)
          .values(state.timerSessions.map((timer) => ({ ...toTimerValues(timer), userId })));
      }

      if (state.notes.length) {
        await tx
          .insert(lifeNotes)
          .values(state.notes.map((note) => ({ ...toNoteValues(note), userId })));
      }

      await tx.insert(lifeSettings).values({ ...toSettingsValues(state.settings), id: userId });
    });

    return this.getState(userId);
  }

  resetState(userId: string) {
    return this.replaceState(userId, this.defaultStateForUser(userId));
  }

  private async ensureState(userId: string) {
    // Empty workspaces need only a settings row. Concurrent reads never replace data.
    await this.db
      .insert(lifeSettings)
      .values({ ...toSettingsValues(defaultState.settings), id: userId })
      .onConflictDoNothing({ target: lifeSettings.id });
  }

  private defaultStateForUser(userId: string): LifeOsState {
    const scopedId = (id: string) => `${userId}:${id}`;
    return {
      categories: defaultState.categories.map((category) => ({
        ...category,
        id: scopedId(category.id),
      })),
      expenses: defaultState.expenses.map((expense) => ({ ...expense, id: scopedId(expense.id) })),
      tasks: defaultState.tasks.map((task) => ({ ...task, id: scopedId(task.id) })),
      timerSessions: defaultState.timerSessions.map((timer) => ({
        ...timer,
        id: scopedId(timer.id),
      })),
      notes: defaultState.notes.map((note) => ({ ...note, id: scopedId(note.id) })),
      settings: { ...defaultState.settings },
    };
  }
}
