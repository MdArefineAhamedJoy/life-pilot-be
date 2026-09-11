import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { TimerSessionsService } from "./timer-sessions.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { TimerSession } from "./timer-sessions.types";
import { getPagination, paginate } from "../shared/api-response";

@Controller("life-os/timer-sessions")
export class TimerSessionsController {
  constructor(private readonly timerSessionsService: TimerSessionsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUserResponse,
    @Query("page") pageQuery?: string,
    @Query("limit") limitQuery?: string
  ) {
    const sessions = await this.timerSessionsService.findAll(user.id);
    return paginate(sessions, getPagination(pageQuery, limitQuery));
  }

  @Post()
  create(
    @CurrentUser() user: AuthUserResponse,
    @Body() payload: Omit<TimerSession, "id" | "createdAt">
  ) {
    return this.timerSessionsService.create(user.id, payload);
  }
}
