import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { CurrentUser } from "./auth-user.decorator";
import { Public } from "./public.decorator";
import { AuthService } from "./auth.service";
import type { AuthUserResponse, LoginPayload, RegisterPayload } from "./auth.types";

function bearerToken(authorization?: string) {
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() payload: RegisterPayload) {
    return this.authService.register(payload);
  }

  @Public()
  @Post("login")
  login(@Body() payload: LoginPayload) {
    return this.authService.login(payload);
  }

  @Get("me")
  me(@CurrentUser() user: AuthUserResponse) {
    return user;
  }

  @Post("logout")
  logout(@Headers("authorization") authorization?: string) {
    return this.authService.logout(bearerToken(authorization));
  }
}
