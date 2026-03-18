import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=permissions.guard.d.ts.map