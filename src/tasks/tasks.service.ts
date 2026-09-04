import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { routineTasks } from "./tasks.schema";
import { taskFromRow, toTaskValues } from "../shared/life-os.mapper";
import { createId, normalizeTask } from "../shared/life-os.validation";
import type { RoutineStatus, RoutineTask } from "./tasks.types";

@Injectable()
export class TasksService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string) {
    const rows = await this.db.select().from(routineTasks).where(eq(routineTasks.userId, userId)).orderBy(asc(routineTasks.sortOrder), asc(routineTasks.createdAt));
    return rows.map(taskFromRow);
  }

  async create(userId: string, payload: Omit<RoutineTask, "id">) {
    const task = normalizeTask(createId("task"), payload);
    const [row] = await this.db.insert(routineTasks).values({ ...toTaskValues(task), userId }).returning();
    return taskFromRow(row);
  }

  async update(userId: string, taskId: string, payload: Partial<RoutineTask>) {
    const current = await this.db.query.routineTasks.findFirst({ where: and(eq(routineTasks.id, taskId), eq(routineTasks.userId, userId)) });
    if (!current) {
      throw new NotFoundException("Routine task was not found.");
    }

    const task = normalizeTask(taskId, {
      id: current.id,
      title: current.title,
      category: current.category,
      priority: current.priority,
      plannedStart: current.plannedStart,
      plannedEnd: current.plannedEnd,
      order: current.sortOrder ?? undefined,
      actualMinutes: current.actualMinutes ?? undefined,
      status: current.status,
      repeatRule: current.repeatRule,
      alertEnabled: current.alertEnabled ?? undefined,
      alertOffsetMinutes: current.alertOffsetMinutes ?? undefined,
      reminderAt: current.reminderAt ?? undefined,
      completedAt: current.completedAt ?? undefined,
      note: current.note ?? undefined,
      ...payload,
    });

    const [row] = await this.db.update(routineTasks).set(toTaskValues(task)).where(and(eq(routineTasks.id, taskId), eq(routineTasks.userId, userId))).returning();
    return taskFromRow(row);
  }

  updateStatus(userId: string, taskId: string, status: RoutineStatus) {
    return this.update(userId, taskId, {
      status,
      completedAt: status === "completed" ? new Date().toISOString() : undefined,
    });
  }

  async reorder(userId: string, orderedTaskIds: string[]) {
    await this.db.transaction(async (tx) => {
      for (const [index, taskId] of orderedTaskIds.entries()) {
        await tx
          .update(routineTasks)
          .set({ sortOrder: index + 1, updatedAt: new Date() })
          .where(and(eq(routineTasks.id, taskId), eq(routineTasks.userId, userId)));
      }
    });

    return this.findAll(userId);
  }

  async remove(userId: string, taskId: string) {
    await this.db.delete(routineTasks).where(and(eq(routineTasks.id, taskId), eq(routineTasks.userId, userId)));
    return { id: taskId };
  }
}
