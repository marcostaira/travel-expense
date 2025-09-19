import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface CurrentUserData {
  userId: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantName?: string;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): CurrentUserData | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new Error(
        "User not found in request. Make sure JWT auth guard is applied."
      );
    }

    return data ? user[data] : user;
  }
);
