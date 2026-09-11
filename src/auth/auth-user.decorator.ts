import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthUserResponse } from "./auth.types";

type RequestWithUser = { user: AuthUserResponse };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUserResponse =>
    context.switchToHttp().getRequest<RequestWithUser>().user
);
