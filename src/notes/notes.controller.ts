import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { NotesService } from "./notes.service";
import type { LifeNote } from "./notes.types";

@Controller("life-os/notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll() {
    return this.notesService.findAll();
  }

  @Post()
  create(@Body() payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }) {
    return this.notesService.create(payload);
  }

  @Put(":noteId")
  update(@Param("noteId") noteId: string, @Body() payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }) {
    return this.notesService.update(noteId, payload);
  }

  @Delete(":noteId")
  remove(@Param("noteId") noteId: string) {
    return this.notesService.remove(noteId);
  }
}
