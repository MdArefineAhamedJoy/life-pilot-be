import { Body, Controller, Get, Patch } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import type { LifeSettings } from "./settings.types";

@Controller("life-os/settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  find() {
    return this.settingsService.find();
  }

  @Patch()
  update(@Body() payload: Partial<LifeSettings>) {
    return this.settingsService.update(payload);
  }
}
