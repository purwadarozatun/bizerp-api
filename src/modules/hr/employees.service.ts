import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, search?: string, page = 1, pageSize = 25) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const where = {
      organizationId,
      ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }, { employeeNumber: { contains: search, mode: 'insensitive' as const } }] } : {}),
    };
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({ where, skip, take: ps, orderBy: { lastName: 'asc' } }),
      this.prisma.employee.count({ where }),
    ]);
    const mapped = data.map((e) => ({ ...e, position: e.jobTitle, salary: e.baseSalary ? Number(e.baseSalary) : 0 }));
    return { data: mapped, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, organizationId: string) {
    const emp = await this.prisma.employee.findFirst({ where: { id, organizationId }, include: { manager: true, reports: true } });
    if (!emp) throw new NotFoundException(`Employee ${id} not found`);
    return { ...emp, position: emp.jobTitle, salary: emp.baseSalary ? Number(emp.baseSalary) : 0 };
  }

  async create(organizationId: string, data: { employeeNumber: string; firstName: string; lastName: string; email: string; hireDate: Date; jobTitle: string; department?: string; employmentType: string; baseSalary?: number; payPeriod?: string; currency?: string }) {
    return this.prisma.employee.create({ data: { ...data, organizationId } });
  }

  async update(id: string, organizationId: string, data: Partial<{ firstName: string; lastName: string; email: string; jobTitle: string; department: string; baseSalary: number; status: string }>) {
    await this.findOne(id, organizationId);
    return this.prisma.employee.update({ where: { id }, data });
  }

  async getOrgChart(organizationId: string) {
    return this.prisma.employee.findMany({
      where: { organizationId, status: 'active' },
      include: { manager: { select: { id: true, firstName: true, lastName: true } }, reports: { select: { id: true, firstName: true, lastName: true, jobTitle: true } } },
      orderBy: { lastName: 'asc' },
    });
  }
}
