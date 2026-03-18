"use strict";
/**
 * Permission keys for BIS ERP modules.
 *
 * Each key represents a distinct module. Roles are mapped to permissions
 * via ROLE_PERMISSIONS below.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = void 0;
exports.hasAccess = hasAccess;
exports.PERMISSIONS = {
    // Employee Data module — manage employee profiles, contracts, documents
    EMPLOYEE_DATA: 'employee_data',
    // Payroll module — process salaries, deductions, payslips
    PAYROLL: 'payroll',
    // Accounting module
    ACCOUNTING: 'accounting',
    // Inventory module
    INVENTORY: 'inventory',
    // CRM module
    CRM: 'crm',
};
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
exports.ROLE_PERMISSIONS = {
    owner: {
        employee_data: 'full',
        payroll: 'full',
        accounting: 'full',
        inventory: 'full',
        crm: 'full',
    },
    admin: {
        employee_data: 'full',
        payroll: 'full',
        accounting: 'full',
        inventory: 'full',
        crm: 'full',
    },
    accountant: {
        // Finance/Payroll Admin: full payroll, read-only employee_data
        employee_data: 'read',
        payroll: 'full',
        accounting: 'full',
        inventory: 'none',
        crm: 'none',
    },
    hr: {
        // HR Admin: full employee_data, no payroll
        employee_data: 'full',
        payroll: 'none',
        accounting: 'none',
        inventory: 'none',
        crm: 'none',
    },
    manager: {
        // Read-only on both employee_data and payroll
        employee_data: 'read',
        payroll: 'read',
        accounting: 'none',
        inventory: 'none',
        crm: 'none',
    },
    sales: {
        employee_data: 'none',
        payroll: 'none',
        accounting: 'none',
        inventory: 'none',
        crm: 'full',
    },
    warehouse: {
        employee_data: 'none',
        payroll: 'none',
        accounting: 'none',
        inventory: 'full',
        crm: 'none',
    },
    user: {
        employee_data: 'none',
        payroll: 'none',
        accounting: 'none',
        inventory: 'none',
        crm: 'none',
    },
};
/**
 * Check whether a role has at least `required` access to a permission key.
 */
function hasAccess(role, permission, required) {
    const rolePerms = exports.ROLE_PERMISSIONS[role];
    if (!rolePerms)
        return false;
    const actual = rolePerms[permission];
    if (required === 'none')
        return true;
    if (required === 'read')
        return actual === 'read' || actual === 'full';
    if (required === 'full')
        return actual === 'full';
    return false;
}
//# sourceMappingURL=permissions.js.map