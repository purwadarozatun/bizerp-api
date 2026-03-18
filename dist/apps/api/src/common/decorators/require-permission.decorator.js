"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.PERMISSION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSION_KEY = 'required_permission';
/**
 * Decorator to declare the required permission and access level for a route.
 *
 * Example:
 *   @RequirePermission(PERMISSIONS.EMPLOYEE_DATA, 'full')
 *   @Post()
 *   create(...) { ... }
 */
const RequirePermission = (permission, level = 'read') => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, {
    permission,
    level,
});
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=require-permission.decorator.js.map