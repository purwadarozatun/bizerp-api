import { AccessLevel, Permission } from '../permissions';
export declare const PERMISSION_KEY = "required_permission";
export interface RequiredPermission {
    permission: Permission;
    level: AccessLevel;
}
/**
 * Decorator to declare the required permission and access level for a route.
 *
 * Example:
 *   @RequirePermission(PERMISSIONS.EMPLOYEE_DATA, 'full')
 *   @Post()
 *   create(...) { ... }
 */
export declare const RequirePermission: (permission: Permission, level?: AccessLevel) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=require-permission.decorator.d.ts.map