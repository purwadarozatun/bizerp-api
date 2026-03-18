/**
 * Permission keys for BIS ERP modules.
 *
 * Each key represents a distinct module. Roles are mapped to permissions
 * via ROLE_PERMISSIONS below.
 */

export const PERMISSIONS = {
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
} as const;

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
export const ROLE_PERMISSIONS: Record<string, PermissionAccess> = {
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
export function hasAccess(role: string, permission: Permission, required: AccessLevel): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;

  const actual = rolePerms[permission as keyof PermissionAccess];
  if (required === 'none') return true;
  if (required === 'read') return actual === 'read' || actual === 'full';
  if (required === 'full') return actual === 'full';
  return false;
}
