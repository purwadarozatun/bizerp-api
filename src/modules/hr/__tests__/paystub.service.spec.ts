import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PaystubService } from '../paystub.service';

function makePrismaMock() {
  return {
    payroll: {
      findFirst: vi.fn(),
    },
    payrollLine: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    organization: {
      findUnique: vi.fn().mockResolvedValue({ name: 'Test Corp' }),
    },
  };
}

describe('PaystubService', () => {
  let service: PaystubService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new PaystubService(prisma as never);
  });

  describe('getPaystub', () => {
    it('throws when payroll not found', async () => {
      prisma.payroll.findFirst.mockResolvedValue(null);
      await expect(service.getPaystub('bad-payroll', 'emp-1', 'org-1')).rejects.toThrow(NotFoundException);
    });

    it('throws when payroll line not found', async () => {
      prisma.payroll.findFirst.mockResolvedValue({ id: 'payroll-1' });
      prisma.payrollLine.findFirst.mockResolvedValue(null);
      await expect(service.getPaystub('payroll-1', 'emp-missing', 'org-1')).rejects.toThrow(NotFoundException);
    });

    it('returns pay stub data', async () => {
      const mockLine = {
        id: 'line-1',
        payrollId: 'payroll-1',
        employeeId: 'emp-1',
        grossPay: '3000',
        netPay: '2400',
        deductions: { tax: 600 },
        employee: { firstName: 'John', lastName: 'Doe', employeeNumber: 'E001', jobTitle: 'Engineer' },
        payroll: { id: 'payroll-1', period: '2026-03', payDate: new Date('2026-03-31'), currency: 'USD' },
      };
      prisma.payroll.findFirst.mockResolvedValue(mockLine.payroll);
      prisma.payrollLine.findFirst.mockResolvedValue(mockLine);

      const result = await service.getPaystub('payroll-1', 'emp-1', 'org-1');
      expect(result.line.grossPay).toBe('3000');
      expect(result.employee.firstName).toBe('John');
    });
  });

  describe('generateHtml', () => {
    it('returns valid HTML string', async () => {
      const mockLine = {
        id: 'line-1',
        payrollId: 'payroll-1',
        employeeId: 'emp-1',
        grossPay: '3000',
        netPay: '2400',
        deductions: { tax: 600 },
        employee: { firstName: 'Jane', lastName: 'Smith', employeeNumber: 'E002', jobTitle: 'Manager', department: 'Engineering' },
        payroll: { id: 'payroll-1', period: '2026-03', payDate: new Date('2026-03-31'), currency: 'USD' },
      };
      prisma.payroll.findFirst.mockResolvedValue(mockLine.payroll);
      prisma.payrollLine.findFirst.mockResolvedValue(mockLine);

      const html = await service.generateHtml('payroll-1', 'emp-1', 'org-1');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Jane Smith');
      expect(html).toContain('2026-03');
    });
  });
});
