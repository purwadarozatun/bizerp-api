/**
 * Integration audit: Payroll-to-Employee Data reference integrity
 *
 * Verifies that:
 * 1. Payroll service reads employee reference data (name, position, department, bank account)
 *    via FK join — never via duplication
 * 2. Salary calculations reference the live Employee.baseSalary field
 * 3. PayrollLine never stores employee PII beyond the employeeId FK
 * 4. Paystub HTML renders employee reference data correctly
 * 5. listByEmployee scopes by organizationId to prevent cross-org leaks
 * 6. Payslip history remains accessible after module separation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PayrollService } from '../payroll.service';
import { PaystubService } from '../paystub.service';

// ── PayrollService: employee reference integrity ──────────────────────────────

function makePayrollPrisma() {
  return {
    payroll: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
    },
    payrollLine: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
  };
}

describe('PayrollService — Payroll-to-Employee reference integrity', () => {
  let payrollSvc: PayrollService;
  let prisma: ReturnType<typeof makePayrollPrisma>;

  const org = 'org-1';
  const emp1 = {
    id: 'emp-1',
    organizationId: org,
    firstName: 'Alice',
    lastName: 'Smith',
    employeeNumber: 'E001',
    jobTitle: 'Engineer',
    department: 'Engineering',
    baseSalary: '5000',
    bankDetails: { accountNumber: '****1234', bankName: 'First Bank' },
    status: 'active',
  };
  const emp2 = {
    id: 'emp-2',
    organizationId: org,
    firstName: 'Bob',
    lastName: 'Jones',
    employeeNumber: 'E002',
    jobTitle: 'Designer',
    department: 'Design',
    baseSalary: '4000',
    bankDetails: { accountNumber: '****5678', bankName: 'Second Bank' },
    status: 'active',
  };

  beforeEach(() => {
    prisma = makePayrollPrisma();
    payrollSvc = new PayrollService(prisma as never);
  });

  it('creates payroll lines with employeeId FK only — no PII duplication', async () => {
    prisma.employee.findMany.mockResolvedValue([emp1, emp2]);
    prisma.payroll.create.mockImplementation(async ({ data }) => ({
      id: 'payroll-1',
      ...data,
      lines: data.lines.create.map(
        (l: { employeeId: string; grossPay: number; netPay: number; deductions: unknown }) => ({
          id: `line-${l.employeeId}`,
          ...l,
          employee: l.employeeId === 'emp-1' ? emp1 : emp2,
        }),
      ),
    }));

    const result = await payrollSvc.create(org, {
      period: '2026-03',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
      payDate: new Date('2026-03-31'),
    });

    // Verify the create call only stored employeeId, not name/position/bankDetails
    const createCall = prisma.payroll.create.mock.calls[0][0];
    const lines = createCall.data.lines.create as Array<Record<string, unknown>>;
    for (const line of lines) {
      expect(line).toHaveProperty('employeeId');
      expect(line).not.toHaveProperty('firstName');
      expect(line).not.toHaveProperty('lastName');
      expect(line).not.toHaveProperty('bankDetails');
      expect(line).not.toHaveProperty('jobTitle');
      expect(line).not.toHaveProperty('department');
    }
  });

  it('salary calculation reads Employee.baseSalary — no duplicated salary field on PayrollLine', async () => {
    prisma.employee.findMany.mockResolvedValue([emp1, emp2]);
    prisma.payroll.create.mockImplementation(async ({ data }) => ({
      id: 'payroll-1',
      ...data,
    }));

    await payrollSvc.create(org, {
      period: '2026-03',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
      payDate: new Date('2026-03-31'),
    });

    const createCall = prisma.payroll.create.mock.calls[0][0];
    const lines = createCall.data.lines.create as Array<{
      employeeId: string;
      grossPay: number;
      netPay: number;
    }>;

    // Employee 1: baseSalary=5000, 20% tax => net=4000
    const line1 = lines.find((l) => l.employeeId === 'emp-1')!;
    expect(line1.grossPay).toBe(5000);
    expect(line1.netPay).toBeCloseTo(4000);

    // Employee 2: baseSalary=4000, 20% tax => net=3200
    const line2 = lines.find((l) => l.employeeId === 'emp-2')!;
    expect(line2.grossPay).toBe(4000);
    expect(line2.netPay).toBeCloseTo(3200);
  });

  it('payroll summary totals are derived from employee records — not from a cached copy', async () => {
    prisma.employee.findMany.mockResolvedValue([emp1, emp2]);
    prisma.payroll.create.mockImplementation(async ({ data }) => ({ id: 'p1', ...data }));

    await payrollSvc.create(org, {
      period: '2026-03',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
      payDate: new Date('2026-03-31'),
    });

    const createCall = prisma.payroll.create.mock.calls[0][0];
    // 5000 + 4000 = 9000 gross
    expect(Number(createCall.data.totalGross)).toBeCloseTo(9000);
    // 20% tax on each => 1000 + 800 = 1800 total tax
    expect(Number(createCall.data.totalTax)).toBeCloseTo(1800);
    // 4000 + 3200 = 7200 net
    expect(Number(createCall.data.totalNet)).toBeCloseTo(7200);
  });

  it('scopes payroll creation to the correct organization — prevents cross-org leaks', async () => {
    prisma.employee.findMany.mockResolvedValue([emp1]);
    prisma.payroll.create.mockImplementation(async ({ data }) => ({ id: 'p1', ...data }));

    await payrollSvc.create(org, {
      period: '2026-03',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-31'),
      payDate: new Date('2026-03-31'),
    });

    // Employee query must be scoped to org
    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ organizationId: org }) }),
    );

    // Payroll record must include the org
    const createCall = prisma.payroll.create.mock.calls[0][0];
    expect(createCall.data.organizationId).toBe(org);
  });

  it('throws when no active employees exist in org', async () => {
    prisma.employee.findMany.mockResolvedValue([]);
    await expect(
      payrollSvc.create(org, {
        period: '2026-03',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-31'),
        payDate: new Date('2026-03-31'),
      }),
    ).rejects.toThrow(/No active employees/);
  });
});

// ── PaystubService: live employee data reads ──────────────────────────────────

describe('PaystubService — Live employee reference data reads', () => {
  let paystubSvc: PaystubService;
  let prisma: ReturnType<typeof makePayrollPrisma>;

  const org = 'org-1';
  const payrollRecord = {
    id: 'payroll-1',
    organizationId: org,
    period: '2026-03',
    payDate: new Date('2026-03-31'),
    currency: 'USD',
    status: 'completed',
  };
  const employeeRecord = {
    id: 'emp-1',
    organizationId: org,
    firstName: 'Carol',
    lastName: 'White',
    employeeNumber: 'E003',
    jobTitle: 'Senior Engineer',
    department: 'Platform',
    bankDetails: { accountNumber: '****9012', bankName: 'National Bank' },
  };
  const payrollLine = {
    id: 'line-1',
    payrollId: 'payroll-1',
    employeeId: 'emp-1',
    grossPay: '6000',
    netPay: '4800',
    deductions: { tax: 1200, health: 0, retirement: 0 },
    employee: employeeRecord,
    payroll: payrollRecord,
  };

  beforeEach(() => {
    prisma = makePayrollPrisma();
    paystubSvc = new PaystubService(prisma as never);
  });

  it('reads employee name from Employee table — not from a cached copy on PayrollLine', async () => {
    prisma.payroll.findFirst.mockResolvedValue(payrollRecord);
    prisma.payrollLine.findFirst.mockResolvedValue(payrollLine);
    prisma.organization.findUnique.mockResolvedValue({ name: 'Test Corp' });

    const result = await paystubSvc.getPaystub('payroll-1', 'emp-1', org);

    // employee data is resolved through the FK join
    expect(result.employee.firstName).toBe('Carol');
    expect(result.employee.lastName).toBe('White');
    expect(result.employee.jobTitle).toBe('Senior Engineer');
    expect(result.employee.department).toBe('Platform');
  });

  it('reads employee bank details from Employee table for paystub reference', async () => {
    prisma.payroll.findFirst.mockResolvedValue(payrollRecord);
    prisma.payrollLine.findFirst.mockResolvedValue(payrollLine);
    prisma.organization.findUnique.mockResolvedValue({ name: 'Test Corp' });

    const result = await paystubSvc.getPaystub('payroll-1', 'emp-1', org);

    // bankDetails is available through the employee reference (not duplicated on line)
    const bankDetails = result.employee.bankDetails as { accountNumber: string; bankName: string };
    expect(bankDetails).toEqual({
      accountNumber: '****9012',
      bankName: 'National Bank',
    });
  });

  it('payroll line query includes employee relation — data is always live from Employee table', async () => {
    prisma.payroll.findFirst.mockResolvedValue(payrollRecord);
    prisma.payrollLine.findFirst.mockResolvedValue(payrollLine);
    prisma.organization.findUnique.mockResolvedValue({ name: 'Test Corp' });

    await paystubSvc.getPaystub('payroll-1', 'emp-1', org);

    // Verify the query includes the employee relation (live join)
    expect(prisma.payrollLine.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.objectContaining({ employee: true }) }),
    );
  });

  it('throws NotFoundException if payroll not found — does not expose cross-org data', async () => {
    prisma.payroll.findFirst.mockResolvedValue(null);
    await expect(paystubSvc.getPaystub('bad-id', 'emp-1', org)).rejects.toThrow(NotFoundException);
  });

  it('paystub HTML includes employee reference data (name, job title, department)', async () => {
    prisma.payroll.findFirst.mockResolvedValue(payrollRecord);
    prisma.payrollLine.findFirst.mockResolvedValue(payrollLine);
    prisma.organization.findUnique.mockResolvedValue({ name: 'Test Corp' });

    const html = await paystubSvc.generateHtml('payroll-1', 'emp-1', org);

    // Verify live employee data appears in the rendered paystub
    expect(html).toContain('Carol White');
    expect(html).toContain('Senior Engineer');
    expect(html).toContain('Platform');
    expect(html).toContain('E003');
    expect(html).toContain('2026-03');
    expect(html).not.toContain('accountNumber'); // bank details not directly rendered in HTML (security)
  });

  it('payslip history lists past completed payrolls for an employee — history is intact', async () => {
    const historyLines = [
      {
        payrollId: 'p-jan',
        payroll: {
          period: '2026-01',
          payDate: new Date('2026-01-31'),
          status: 'completed',
          currency: 'USD',
        },
        grossPay: '6000',
        netPay: '4800',
      },
      {
        payrollId: 'p-feb',
        payroll: {
          period: '2026-02',
          payDate: new Date('2026-02-28'),
          status: 'completed',
          currency: 'USD',
        },
        grossPay: '6000',
        netPay: '4800',
      },
    ];
    prisma.payrollLine.findMany.mockResolvedValue(historyLines);

    const history = await paystubSvc.listByEmployee('emp-1', org);

    expect(history).toHaveLength(2);
    expect(history[0].period).toBe('2026-01');
    expect(history[1].period).toBe('2026-02');
    expect(history[0].grossPay).toBe(6000);
    expect(history[0].netPay).toBe(4800);
  });

  it('listByEmployee scopes query to organizationId to prevent cross-org access', async () => {
    prisma.payrollLine.findMany.mockResolvedValue([]);

    await paystubSvc.listByEmployee('emp-1', org);

    expect(prisma.payrollLine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          payroll: expect.objectContaining({ organizationId: org }),
        }),
      }),
    );
  });
});
