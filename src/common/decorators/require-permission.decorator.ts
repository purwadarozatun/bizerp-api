import { SetMetadata } from '@nestjs/common';
import { AccessLevel, Permission } from '../permissions';

export const PERMISSION_KEY = 'required_permission';

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
export const RequirePermission = (permission: Permission, level: AccessLevel = 'read') =>
  SetMetadata<string, RequiredPermission>(PERMISSION_KEY, {
    permission,
    level,
  });
