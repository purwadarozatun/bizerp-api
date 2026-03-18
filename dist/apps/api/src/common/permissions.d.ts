/**
 * Permission keys for BIS ERP modules.
 *
 * Each key represents a distinct module. Roles are mapped to permissions
 * via ROLE_PERMISSIONS below.
 */
export declare const PERMISSIONS: {
    readonly EMPLOYEE_DATA: "employee_data";
    readonly PAYROLL: "payroll";
    readonly ACCOUNTING: "accounting";
    readonly INVENTORY: "inventory";
    readonly CRM: "crm";
};
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
/**
 * Access levels per permission.
 */
export type AccessLevel = 'none' | 'read' | 'full';
export interface PermissionAccess {
    employee_data: AccessLevel;
    payroll: AccessLevel;
    accounting: AccessLevel;
    inventory: AccessLevel;
    crm: AccessLevel;
}
/**
 * Role-to-permission mapping.
 *
 * Roles (stored as string on User.role):
 *   owner     — Organization owner, full access to everything
 *   admin     — Super Admin, full access to everything
 *   accountant — Finance/Payroll Admin: full payroll, read-only employee_data
 *   hr        — HR Admin: full employee_data, no payroll access
 *   sales     — CRM access
 *   warehouse — Inventory access
 *   manager   — Read-only on both employee_data and payroll
 *   user      — Baseline, no module access by default
 */
export declare const ROLE_PERMISSIONS: Record<string, PermissionAccess>;
/**
 * Check whether a role has at least `required` access to a permission key.
 */
export declare function hasAccess(role: string, permission: Permission, required: AccessLevel): boolean;
//# sourceMappingURL=permissions.d.ts.map