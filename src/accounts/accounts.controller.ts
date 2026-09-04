import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/auth-user.decorator";
import { Public } from "../auth/public.decorator";
import type { AuthUserResponse } from "../auth/auth.types";
import { AccountsService } from "./accounts.service";
import type { ProfilePayload, RecoveryPayload } from "./accounts.types";

@Controller("account")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get("profile")
  getProfile(@CurrentUser() user: AuthUserResponse) {
    return this.accountsService.getProfile(user.email);
  }

  @Post("profile")
  saveProfile(@CurrentUser() user: AuthUserResponse, @Body() payload: ProfilePayload) {
    return this.accountsService.saveProfile(user.email, payload);
  }

  @Public()
  @Post("password-recovery")
  requestPasswordRecovery(@Body() payload: RecoveryPayload) {
    return this.accountsService.requestPasswordRecovery(payload);
  }
}
