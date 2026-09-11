import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { LifeNote } from "./notes.types";
import { getPagination, paginate } from "../shared/api-response";

@Controller("life-os/notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string
  ) {
    const notes = await this.notesService.findAll(user.id);
    return paginate(notes, getPagination(pageQuery, limitQuery));
  }

  @Post()
  create(
    @CurrentUser() user: AuthUserResponse,
    @Body() payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }
  ) {
    return this.notesService.create(user.id, payload);
  }

  @Put(":noteId")
  update(
    @CurrentUser() user: AuthUserResponse,
    @Param("noteId") noteId: string,
    @Body() payload: Pick<LifeNote, "title" | "body"> & { tags?: string[] }
  ) {
    return this.notesService.update(user.id, noteId, payload);
  }

  @Delete(":noteId")
  remove(@CurrentUser() user: AuthUserResponse, @Param("noteId") noteId: string) {
    return this.notesService.remove(user.id, noteId);
  }
}
