import { Body, Controller, Get, Patch } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { CurrentUser } from "../auth/auth-user.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import type { LifeSettings } from "./settings.types";

@Controller("life-os/settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  find(@CurrentUser() user: AuthUserResponse) {
    return this.settingsService.find(user.id);
  }

  @Patch()
  update(@CurrentUser() user: AuthUserResponse, @Body() payload: Partial<LifeSettings>) {
    return this.settingsService.update(user.id, payload);
  }
}
