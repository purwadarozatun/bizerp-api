import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasAccess,
  AccessLevel,
  Permission,
} from '../../../common/permissions';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { PERMISSION_KEY } from '../../../common/decorators/require-permission.decorator';
import { EmployeesController } from '../employees.controller';
import { PayrollController } from '../payroll.controller';
import { PaystubController } from '../paystub.controller';

// ── hasAccess helper unit tests ──────────────────────────────────────────────

describe('hasAccess()', () => {
  describe('employee_data permission', () => {
    it('hr role has full access', () => {
      expect(hasAccess('hr', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(true);
      expect(hasAccess('hr', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(true);
    });

    it('accountant role has read-only access', () => {
      expect(hasAccess('accountant', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(true);
      expect(hasAccess('accountant', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(false);
    });

    it('manager role has read-only access', () => {
      expect(hasAccess('manager', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(true);
      expect(hasAccess('manager', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(false);
    });

    it('admin/owner have full access', () => {
      expect(hasAccess('admin', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(true);
      expect(hasAccess('owner', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(true);
    });

    it('user role has no access', () => {
      expect(hasAccess('user', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(false);
      expect(hasAccess('user', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(false);
    });

    it('sales role has no access to employee_data', () => {
      expect(hasAccess('sales', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(false);
    });

    it('warehouse role has no access to employee_data', () => {
      expect(hasAccess('warehouse', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(false);
    });
  });

  describe('payroll permission', () => {
    it('accountant (Finance/Payroll Admin) has full access', () => {
      expect(hasAccess('accountant', PERMISSIONS.PAYROLL, 'full')).toBe(true);
      expect(hasAccess('accountant', PERMISSIONS.PAYROLL, 'read')).toBe(true);
    });

    it('hr role has NO access to payroll', () => {
      expect(hasAccess('hr', PERMISSIONS.PAYROLL, 'read')).toBe(false);
      expect(hasAccess('hr', PERMISSIONS.PAYROLL, 'full')).toBe(false);
    });

    it('manager role has read-only access to payroll', () => {
      expect(hasAccess('manager', PERMISSIONS.PAYROLL, 'read')).toBe(true);
      expect(hasAccess('manager', PERMISSIONS.PAYROLL, 'full')).toBe(false);
    });

    it('admin/owner have full payroll access', () => {
      expect(hasAccess('admin', PERMISSIONS.PAYROLL, 'full')).toBe(true);
      expect(hasAccess('owner', PERMISSIONS.PAYROLL, 'full')).toBe(true);
    });

    it('user role has no payroll access', () => {
      expect(hasAccess('user', PERMISSIONS.PAYROLL, 'read')).toBe(false);
    });

    it('sales role has no payroll access', () => {
      expect(hasAccess('sales', PERMISSIONS.PAYROLL, 'read')).toBe(false);
    });
  });

  describe('unknown role', () => {
    it('unknown role has no access', () => {
      expect(hasAccess('unknown_role', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(false);
      expect(hasAccess('unknown_role', PERMISSIONS.PAYROLL, 'read')).toBe(false);
    });
  });

  describe('permission independence', () => {
    it('hr has employee_data but NOT payroll — permissions are independent', () => {
      expect(hasAccess('hr', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(true);
      expect(hasAccess('hr', PERMISSIONS.PAYROLL, 'read')).toBe(false);
    });

    it('accountant has payroll but only read on employee_data — permissions are independent', () => {
      expect(hasAccess('accountant', PERMISSIONS.PAYROLL, 'full')).toBe(true);
      expect(hasAccess('accountant', PERMISSIONS.EMPLOYEE_DATA, 'read')).toBe(true);
      expect(hasAccess('accountant', PERMISSIONS.EMPLOYEE_DATA, 'full')).toBe(false);
    });
  });
});

// ── ROLE_PERMISSIONS completeness ─────────────────────────────────────────────

describe('ROLE_PERMISSIONS', () => {
  const expectedRoles = [
    'owner',
    'admin',
    'accountant',
    'hr',
    'sales',
    'warehouse',
    'manager',
    'user',
  ];

  it('all expected roles are defined', () => {
    for (const role of expectedRoles) {
      expect(ROLE_PERMISSIONS).toHaveProperty(role);
    }
  });

  it('each role has both employee_data and payroll keys', () => {
    for (const role of expectedRoles) {
      expect(ROLE_PERMISSIONS[role]).toHaveProperty('employee_data');
      expect(ROLE_PERMISSIONS[role]).toHaveProperty('payroll');
    }
  });

  it('employee_data and payroll keys are independent — changing one does not affect the other', () => {
    // HR Admin: full employee_data, none payroll
    expect(ROLE_PERMISSIONS['hr'].employee_data).toBe('full');
    expect(ROLE_PERMISSIONS['hr'].payroll).toBe('none');

    // Finance Admin: full payroll, read employee_data
    expect(ROLE_PERMISSIONS['accountant'].payroll).toBe('full');
    expect(ROLE_PERMISSIONS['accountant'].employee_data).toBe('read');
  });
});

// ── PermissionsGuard unit tests ───────────────────────────────────────────────

function makeContext(user: { role: string } | undefined, metadata: unknown) {
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(metadata),
  } as unknown as Reflector;

  const request = { user };
  const context = {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: vi.fn().mockReturnValue({
      getRequest: vi.fn().mockReturnValue(request),
    }),
  } as unknown as ExecutionContext;

  return { reflector, context };
}

describe('PermissionsGuard', () => {
  it('allows access when no permission metadata is set', () => {
    const { reflector, context } = makeContext({ role: 'user' }, undefined);
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when role has required permission', () => {
    const { reflector, context } = makeContext(
      { role: 'hr' },
      { permission: PERMISSIONS.EMPLOYEE_DATA, level: 'full' },
    );
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when role lacks required permission', () => {
    const { reflector, context } = makeContext(
      { role: 'hr' },
      { permission: PERMISSIONS.PAYROLL, level: 'read' },
    );
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies access when role only has read but full is required', () => {
    const { reflector, context } = makeContext(
      { role: 'accountant' },
      { permission: PERMISSIONS.EMPLOYEE_DATA, level: 'full' },
    );
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows read access for manager on employee_data', () => {
    const { reflector, context } = makeContext(
      { role: 'manager' },
      { permission: PERMISSIONS.EMPLOYEE_DATA, level: 'read' },
    );
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies full access for manager on employee_data', () => {
    const { reflector, context } = makeContext(
      { role: 'manager' },
      { permission: PERMISSIONS.EMPLOYEE_DATA, level: 'full' },
    );
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows admin full access to payroll', () => {
    const { reflector, context } = makeContext(
      { role: 'admin' },
      { permission: PERMISSIONS.PAYROLL, level: 'full' },
    );
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException with descriptive message when denied', () => {
    const { reflector, context } = makeContext(
      { role: 'user' },
      { permission: PERMISSIONS.PAYROLL, level: 'read' },
    );
    const guard = new PermissionsGuard(reflector);
    try {
      guard.canActivate(context);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect((e as ForbiddenException).message).toContain('payroll');
    }
  });

  it('throws ForbiddenException when user is undefined', () => {
    const { reflector, context } = makeContext(undefined, {
      permission: PERMISSIONS.EMPLOYEE_DATA,
      level: 'read',
    });
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

// ── Controller RBAC metadata verification ─────────────────────────────────────
// These tests verify that controllers have the correct permission decorators applied,
// ensuring the RBAC enforcement is wired at the controller level (not just tested in isolation).

describe('EmployeesController RBAC metadata', () => {
  it('controller class requires at least read access to employee_data', () => {
    const metadata = Reflect.getMetadata(PERMISSION_KEY, EmployeesController);
    expect(metadata).toBeDefined();
    expect(metadata.permission).toBe(PERMISSIONS.EMPLOYEE_DATA);
    expect(metadata.level).toBe('read');
  });

  it('create method requires full access to employee_data', () => {
    const prototype = EmployeesController.prototype;
    const metadata = Reflect.getMetadata(PERMISSION_KEY, prototype.create);
    expect(metadata).toBeDefined();
    expect(metadata.permission).toBe(PERMISSIONS.EMPLOYEE_DATA);
    expect(metadata.level).toBe('full');
  });

  it('update method requires full access to employee_data', () => {
    const prototype = EmployeesController.prototype;
    const metadata = Reflect.getMetadata(PERMISSION_KEY, prototype.update);
    expect(metadata).toBeDefined();
    expect(metadata.permission).toBe(PERMISSIONS.EMPLOYEE_DATA);
    expect(metadata.level).toBe('full');
  });

  it('hr role can read employees (full access to employee_data)', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, EmployeesController);
    expect(hasAccess('hr', meta.permission, meta.level)).toBe(true);
  });

  it('accountant role can read employees (read access to employee_data)', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, EmployeesController);
    expect(hasAccess('accountant', meta.permission, meta.level)).toBe(true);
  });

  it('user role cannot access employees — denied at class-level read check', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, EmployeesController);
    expect(hasAccess('user', meta.permission, meta.level)).toBe(false);
  });

  it('accountant role cannot write employees — denied at method-level full check', () => {
    const createMeta = Reflect.getMetadata(PERMISSION_KEY, EmployeesController.prototype.create);
    expect(hasAccess('accountant', createMeta.permission, createMeta.level)).toBe(false);
  });
});

describe('PayrollController RBAC metadata', () => {
  it('controller class requires at least read access to payroll', () => {
    const metadata = Reflect.getMetadata(PERMISSION_KEY, PayrollController);
    expect(metadata).toBeDefined();
    expect(metadata.permission).toBe(PERMISSIONS.PAYROLL);
    expect(metadata.level).toBe('read');
  });

  it('create method requires full access to payroll', () => {
    const prototype = PayrollController.prototype;
    const metadata = Reflect.getMetadata(PERMISSION_KEY, prototype.create);
    expect(metadata).toBeDefined();
    expect(metadata.permission).toBe(PERMISSIONS.PAYROLL);
    expect(metadata.level).toBe('full');
  });

  it('process method requires full access to payroll', () => {
    const prototype = PayrollController.prototype;
    const metadata = Reflect.getMetadata(PERMISSION_KEY, prototype.process);
    expect(metadata).toBeDefined();
    expect(metadata.permission).toBe(PERMISSIONS.PAYROLL);
    expect(metadata.level).toBe('full');
  });

  it('hr role cannot read payroll — denied at class-level read check', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, PayrollController);
    expect(hasAccess('hr', meta.permission, meta.level)).toBe(false);
  });

  it('accountant role can read payroll (full access)', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, PayrollController);
    expect(hasAccess('accountant', meta.permission, meta.level)).toBe(true);
  });

  it('manager role can read payroll (read-only)', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, PayrollController);
    expect(hasAccess('manager', meta.permission, meta.level)).toBe(true);
  });

  it('manager role cannot create/process payroll — denied at method-level full check', () => {
    const createMeta = Reflect.getMetadata(PERMISSION_KEY, PayrollController.prototype.create);
    expect(hasAccess('manager', createMeta.permission, createMeta.level)).toBe(false);
  });

  it('user role cannot access payroll — denied at class-level read check', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, PayrollController);
    expect(hasAccess('user', meta.permission, meta.level)).toBe(false);
  });
});

describe('PaystubController RBAC metadata', () => {
  it('controller class requires at least read access to payroll', () => {
    const metadata = Reflect.getMetadata(PERMISSION_KEY, PaystubController);
    expect(metadata).toBeDefined();
    expect(metadata.permission).toBe(PERMISSIONS.PAYROLL);
    expect(metadata.level).toBe('read');
  });

  it('hr role cannot access paystubs — no payroll read access', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, PaystubController);
    expect(hasAccess('hr', meta.permission, meta.level)).toBe(false);
  });

  it('accountant role can access paystubs (payroll full access)', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, PaystubController);
    expect(hasAccess('accountant', meta.permission, meta.level)).toBe(true);
  });

  it('manager role can access paystubs (payroll read-only)', () => {
    const meta = Reflect.getMetadata(PERMISSION_KEY, PaystubController);
    expect(hasAccess('manager', meta.permission, meta.level)).toBe(true);
  });
});
