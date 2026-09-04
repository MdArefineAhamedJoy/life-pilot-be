import { Inject, Injectable } from "@nestjs/common";
import { desc } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { timerSessions } from "../db/schema";
import { timerFromRow, toTimerValues } from "../shared/life-os.mapper";
import { createId, normalizeTimerSession } from "../shared/life-os.validation";
import type { TimerSession } from "./timer-sessions.types";

@Injectable()
export class TimerSessionsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll() {
    const rows = await this.db.select().from(timerSessions).orderBy(desc(timerSessions.createdAt));
    return rows.map(timerFromRow);
  }

  async create(payload: Omit<TimerSession, "id" | "createdAt">) {
    const session = normalizeTimerSession(createId("timer"), payload);
    const [row] = await this.db.insert(timerSessions).values(toTimerValues(session)).returning();
    return timerFromRow(row);
  }
}
