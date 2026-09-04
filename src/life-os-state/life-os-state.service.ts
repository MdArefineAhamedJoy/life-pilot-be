import { Inject, Injectable } from "@nestjs/common";
import { asc, desc, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import {
  budgetCategories,
  expenses,
  lifeNotes,
  lifeSettings,
  routineTasks,
  timerSessions,
} from "../db/schema";
import { defaultState, settingsId } from "../shared/life-os.defaults";
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
import type { LifeOsState } from "../shared/life-os.types";
import { normalizeState } from "../shared/life-os.validation";

@Injectable()
export class LifeOsStateService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getState(): Promise<LifeOsState> {
    await this.ensureState();

    const [categoryRows, expenseRows, taskRows, timerRows, noteRows, settingsRow] = await Promise.all([
      this.db.select().from(budgetCategories).orderBy(asc(budgetCategories.createdAt)),
      this.db.select().from(expenses).orderBy(desc(expenses.date), desc(expenses.createdAt)),
      this.db.select().from(routineTasks).orderBy(asc(routineTasks.sortOrder), asc(routineTasks.createdAt)),
      this.db.select().from(timerSessions).orderBy(desc(timerSessions.createdAt)),
      this.db.select().from(lifeNotes).orderBy(desc(lifeNotes.updatedAt)),
      this.db.query.lifeSettings.findFirst({ where: eq(lifeSettings.id, settingsId) }),
    ]);

    return {
      categories: categoryRows.map(categoryFromRow),
      expenses: expenseRows.map(expenseFromRow),
      tasks: taskRows.map(taskFromRow),
      timerSessions: timerRows.map(timerFromRow),
      notes: noteRows.map(noteFromRow),
      settings: settingsRow ? settingsFromRow(settingsRow) : defaultState.settings,
    };
  }

  async replaceState(payload: Partial<LifeOsState>): Promise<LifeOsState> {
    const state = normalizeState(payload);

    await this.db.transaction(async (tx) => {
      await tx.delete(expenses);
      await tx.delete(budgetCategories);
      await tx.delete(routineTasks);
      await tx.delete(timerSessions);
      await tx.delete(lifeNotes);
      await tx.delete(lifeSettings);

      if (state.categories.length) {
        await tx.insert(budgetCategories).values(state.categories.map(toCategoryValues));
      }

      if (state.expenses.length) {
        await tx.insert(expenses).values(state.expenses.map(toExpenseValues));
      }

      if (state.tasks.length) {
        await tx.insert(routineTasks).values(state.tasks.map(toTaskValues));
      }

      if (state.timerSessions.length) {
        await tx.insert(timerSessions).values(state.timerSessions.map(toTimerValues));
      }

      if (state.notes.length) {
        await tx.insert(lifeNotes).values(state.notes.map(toNoteValues));
      }

      await tx.insert(lifeSettings).values(toSettingsValues(state.settings));
    });

    return this.getState();
  }

  resetState() {
    return this.replaceState(defaultState);
  }

  private async ensureState() {
    const settings = await this.db.query.lifeSettings.findFirst({ where: eq(lifeSettings.id, settingsId) });
    if (settings) {
      return;
    }

    const [category, expense, task, timer, note] = await Promise.all([
      this.db.query.budgetCategories.findFirst(),
      this.db.query.expenses.findFirst(),
      this.db.query.routineTasks.findFirst(),
      this.db.query.timerSessions.findFirst(),
      this.db.query.lifeNotes.findFirst(),
    ]);

    if (!category && !expense && !task && !timer && !note) {
      await this.replaceState(defaultState);
      return;
    }

    await this.db.insert(lifeSettings).values(toSettingsValues(defaultState.settings));
  }
}
