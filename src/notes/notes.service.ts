import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DRIZZLE, type Database } from "../db/database.module";
import { lifeNotes } from "../db/schema";
import { noteFromRow, toNoteValues } from "../shared/life-os.mapper";
import { createId, isoDate, normalizeNote } from "../shared/life-os.validation";
import type { LifeNote } from "./notes.types";

@Injectable()
export class NotesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findAll(userId: string) {
    const rows = await this.db.select().from(lifeNotes).where(eq(lifeNotes.userId, userId)).orderBy(desc(lifeNotes.updatedAt));
    return rows.map(noteFromRow);
  }

  async create(userId: string, payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }) {
    const note = normalizeNote(createId("note"), payload);
    const [row] = await this.db.insert(lifeNotes).values({ ...toNoteValues(note), userId }).returning();
    return noteFromRow(row);
  }

  async update(userId: string, noteId: string, payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }) {
    const current = await this.db.query.lifeNotes.findFirst({ where: and(eq(lifeNotes.id, noteId), eq(lifeNotes.userId, userId)) });
    if (!current) {
      throw new NotFoundException("Life note was not found.");
    }

    const note = normalizeNote(noteId, {
      title: payload.title,
      body: payload.body,
      tags: payload.tags,
      createdAt: isoDate(current.createdAt),
      updatedAt: new Date().toISOString(),
    });
    const [row] = await this.db.update(lifeNotes).set(toNoteValues(note)).where(and(eq(lifeNotes.id, noteId), eq(lifeNotes.userId, userId))).returning();
    return noteFromRow(row);
  }

  async remove(userId: string, noteId: string) {
    await this.db.delete(lifeNotes).where(and(eq(lifeNotes.id, noteId), eq(lifeNotes.userId, userId)));
    return { id: noteId };
  }
}
