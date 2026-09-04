import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { LoginPayload, RegisterPayload } from "./auth.types";

function bearerToken(authorization?: string) {
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() payload: RegisterPayload) {
    return this.authService.register(payload);
  }

  @Post("login")
  login(@Body() payload: LoginPayload) {
    return this.authService.login(payload);
  }

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    return this.authService.getCurrentUser(bearerToken(authorization));
  }

  @Post("logout")
  logout(@Headers("authorization") authorization?: string) {
    return this.authService.logout(bearerToken(authorization));
  }
}
