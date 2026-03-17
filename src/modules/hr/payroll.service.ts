import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, page = 1, pageSize = 25) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.payroll.findMany({ where: { organizationId }, include: { lines: { include: { employee: true } } }, skip, take: ps, orderBy: { createdAt: 'desc' } }),
      this.prisma.payroll.count({ where: { organizationId } }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async create(organizationId: string, data: { period: string; startDate: Date; endDate: Date; payDate: Date; currency?: string }) {
    // Auto-include all active employees
    const employees = await this.prisma.employee.findMany({
      where: { organizationId, status: 'active', baseSalary: { not: null } },
    });

    if (employees.length === 0) throw new BadRequestException('No active employees with salary configured');

    const lines = employees.map(emp => {
      const gross = Number(emp.baseSalary || 0);
      const tax = gross * 0.2; // Simplified 20% tax — configurable in prod
      const net = gross - tax;
      return { employeeId: emp.id, grossPay: gross, deductions: { tax, health: 0, retirement: 0 }, netPay: net };
    });

    const totalGross = lines.reduce((s, l) => s + l.grossPay, 0);
    const totalTax = lines.reduce((s, l) => s + (l.deductions.tax as number), 0);
    const totalNet = lines.reduce((s, l) => s + l.netPay, 0);

    return this.prisma.payroll.create({
      data: {
        organizationId,
        ...data,
        currency: data.currency || 'USD',
        status: 'draft',
        totalGross,
        totalNet,
        totalTax,
        lines: { create: lines },
      },
      include: { lines: { include: { employee: true } } },
    });
  }

  async process(id: string, organizationId: string) {
    const payroll = await this.prisma.payroll.findFirst({ where: { id, organizationId } });
    if (!payroll) throw new BadRequestException('Payroll not found');
    if (payroll.status !== 'draft') throw new BadRequestException('Only draft payrolls can be processed');
    return this.prisma.payroll.update({ where: { id }, data: { status: 'completed' } });
  }
}
