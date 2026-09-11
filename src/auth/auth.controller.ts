import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "./auth-user.decorator";
import { Public } from "./public.decorator";
import { AuthService } from "./auth.service";
import type { AuthUserResponse, LoginPayload, RegisterPayload } from "./auth.types";

function bearerToken(authorization?: string) {
  const [scheme, token] = authorization?.split(" ") ?? [];
  return scheme?.toLowerCase() === "bearer" ? (token?.trim() ?? "") : "";
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60_000, blockDuration: 300_000 } })
  register(@Body() payload: RegisterPayload) {
    return this.authService.register(payload);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000, blockDuration: 300_000 } })
  login(@Body() payload: LoginPayload) {
    return this.authService.login(payload);
  }

  @Get("me")
  me(@CurrentUser() user: AuthUserResponse) {
    return user;
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000, blockDuration: 300_000 } })
  refresh(@Headers("authorization") authorization?: string) {
    return this.authService.refresh(bearerToken(authorization));
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(
    @Headers("authorization") authorization?: string,
    @Headers("x-refresh-token") refreshToken?: string
  ) {
    return this.authService.logout(bearerToken(authorization), refreshToken?.trim() ?? "");
  }
}
