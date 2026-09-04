import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import type { LifeOsState } from "../shared/life-os.types";
import { LifeOsStateService } from "./life-os-state.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";

@Controller("life-os")
export class LifeOsStateController {
  constructor(private readonly lifeOsStateService: LifeOsStateService) {}

  @Get("state")
  getState(@CurrentUser() user: AuthUserResponse) {
    return this.lifeOsStateService.getState(user.id);
  }

  @Put("state")
  replaceState(@CurrentUser() user: AuthUserResponse, @Body() payload: Partial<LifeOsState>) {
    return this.lifeOsStateService.replaceState(user.id, payload);
  }

  @Post("reset")
  resetState(@CurrentUser() user: AuthUserResponse) {
    return this.lifeOsStateService.resetState(user.id);
  }
}
