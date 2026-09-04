import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { LifeNote } from "./notes.types";

@Controller("life-os/notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUserResponse) {
    return this.notesService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUserResponse, @Body() payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }) {
    return this.notesService.create(user.id, payload);
  }

  @Put(":noteId")
  update(@CurrentUser() user: AuthUserResponse, @Param("noteId") noteId: string, @Body() payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }) {
    return this.notesService.update(user.id, noteId, payload);
  }

  @Delete(":noteId")
  remove(@CurrentUser() user: AuthUserResponse, @Param("noteId") noteId: string) {
    return this.notesService.remove(user.id, noteId);
  }
}
