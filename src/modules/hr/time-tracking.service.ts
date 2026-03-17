import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class TimeTrackingService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, employeeId?: string, startDate?: Date, endDate?: Date, page = 1, pageSize = 50) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 50;
    const where = {
      employee: { organizationId },
      ...(employeeId ? { employeeId } : {}),
      ...(startDate || endDate
        ? { date: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } }
        : {}),
    };
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where,
        include: { employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: ps,
      }),
      this.prisma.timeEntry.count({ where }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async create(data: { employeeId: string; date: Date; hours: number; description?: string }) {
    return this.prisma.timeEntry.create({
      data,
      include: { employee: true },
    });
  }

  async update(id: string, data: Partial<{ hours: number; description: string; date: Date }>) {
    const entry = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Time entry ${id} not found`);
    return this.prisma.timeEntry.update({ where: { id }, data });
  }

  async getSummary(organizationId: string, employeeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const entries = await this.prisma.timeEntry.findMany({
      where: { employeeId, employee: { organizationId }, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });

    const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);
    return { employeeId, year, month, totalHours, entries };
  }
}
