import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/require-permission.decorator';
import { hasAccess } from '../permissions';
import { JwtPayload } from '../decorators/current-user.decorator';

/**
 * Guard that enforces module-level permissions on top of authentication.
 *
 * Must be used AFTER JwtAuthGuard so that `request.user` (JwtPayload) is populated.
 *
 * Usage:
 *   Apply @RequirePermission(PERMISSIONS.PAYROLL, 'full') on a route or controller,
 *   then add @UseGuards(JwtAuthGuard, PermissionsGuard).
 *
 * If no @RequirePermission metadata is present, the guard passes (access is allowed).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permission requirement declared — allow access
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const allowed = hasAccess(user.role, required.permission, required.level);

    if (!allowed) {
      throw new ForbiddenException(
        `Access denied: requires "${required.level}" access to "${required.permission}"`,
      );
    }

    return true;
  }
}
