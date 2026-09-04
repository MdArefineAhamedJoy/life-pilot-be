import { Body, Controller, Get, Post } from "@nestjs/common";
import { TimerSessionsService } from "./timer-sessions.service";
import type { TimerSession } from "./timer-sessions.types";

@Controller("life-os/timer-sessions")
export class TimerSessionsController {
  constructor(private readonly timerSessionsService: TimerSessionsService) {}

  @Get()
  findAll() {
    return this.timerSessionsService.findAll();
  }

  @Post()
  create(@Body() payload: Omit<TimerSession, "id" | "createdAt">) {
    return this.timerSessionsService.create(payload);
  }
}
