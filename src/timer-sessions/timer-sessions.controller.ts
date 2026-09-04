import { Body, Controller, Get, Post } from "@nestjs/common";
import { TimerSessionsService } from "./timer-sessions.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { TimerSession } from "./timer-sessions.types";

@Controller("life-os/timer-sessions")
export class TimerSessionsController {
  constructor(private readonly timerSessionsService: TimerSessionsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUserResponse) {
    return this.timerSessionsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUserResponse, @Body() payload: Omit<TimerSession, "id" | "createdAt">) {
    return this.timerSessionsService.create(user.id, payload);
  }
}
