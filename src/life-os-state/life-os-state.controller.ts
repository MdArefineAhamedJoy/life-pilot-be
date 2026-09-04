import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import type { LifeOsState } from "../shared/life-os.types";
import { LifeOsStateService } from "./life-os-state.service";

@Controller("life-os")
export class LifeOsStateController {
  constructor(private readonly lifeOsStateService: LifeOsStateService) {}

  @Get("state")
  getState() {
    return this.lifeOsStateService.getState();
  }

  @Put("state")
  replaceState(@Body() payload: Partial<LifeOsState>) {
    return this.lifeOsStateService.replaceState(payload);
  }

  @Post("reset")
  resetState() {
    return this.lifeOsStateService.resetState();
  }
}
