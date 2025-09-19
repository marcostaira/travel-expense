import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { CurrentUserData } from "../decorators/current-user.decorator";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Skip tenant validation for public routes
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;

    // If no user, let JWT guard handle it
    if (!user) {
      return true;
    }

    // Ensure user has a tenant
    if (!user.tenantId) {
      throw new ForbiddenException("User does not belong to any tenant");
    }

    // Add tenant information to request for easy access
    request.tenant = {
      id: user.tenantId,
      name: user.tenantName,
    };

    return true;
  }
}
