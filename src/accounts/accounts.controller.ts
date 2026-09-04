import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import type { ProfilePayload, RecoveryPayload } from "./accounts.types";

@Controller("account")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get("profile")
  getProfile(@Query("email") email?: string) {
    return this.accountsService.getProfile(email);
  }

  @Post("profile")
  saveProfile(@Body() payload: ProfilePayload) {
    return this.accountsService.saveProfile(payload);
  }

  @Post("password-recovery")
  requestPasswordRecovery(@Body() payload: RecoveryPayload) {
    return this.accountsService.requestPasswordRecovery(payload);
  }
}
