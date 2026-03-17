import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';
import { Prisma } from '@prisma/client';

@Injectable()
export class SelfServiceService {
  constructor(private readonly prisma: PrismaClient) {}

  async getMyProfile(employeeId: string, organizationId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
      },
      // Exclude sensitive fields by selecting specific ones
    });
    if (!employee) throw new NotFoundException(`Employee ${employeeId} not found`);

    // Strip bank details from self-service view for security
    const { bankDetails: _bank, ...safeEmployee } = employee as typeof employee & {
      bankDetails: unknown;
    };
    return safeEmployee;
  }

  async getMyLeaveRequests(employeeId: string, page = 1, pageSize = 25) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where: { employeeId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: ps,
      }),
      this.prisma.leaveRequest.count({ where: { employeeId } }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async getLeaveBalance(employeeId: string) {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    const approved = await this.prisma.leaveRequest.findMany({
      where: { employeeId, status: 'approved', startDate: { gte: yearStart } },
    });

    const used: Record<string, number> = {};
    for (const req of approved) {
      used[req.type] = (used[req.type] || 0) + Number(req.days);
    }

    // Default allocations — in a full system these would come from policy config
    const allocations: Record<string, number> = {
      annual: 20,
      sick: 10,
      maternity: 90,
      paternity: 10,
      unpaid: 0,
    };

    return Object.entries(allocations).map(([type, alloc]) => ({
      type,
      allocated: alloc,
      used: used[type] || 0,
      remaining: Math.max(0, alloc - (used[type] || 0)),
    }));
  }

  async getMyTimeEntries(employeeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const entries = await this.prisma.timeEntry.findMany({
      where: { employeeId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });

    const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);
    return { year, month, totalHours, entries };
  }

  async updateMyProfile(
    employeeId: string,
    organizationId: string,
    data: Partial<{ phone: string; address: Prisma.InputJsonValue }>,
  ) {
    const emp = await this.prisma.employee.findFirst({ where: { id: employeeId, organizationId } });
    if (!emp) throw new NotFoundException(`Employee ${employeeId} not found`);

    // Build update data with proper Prisma types
    const updateData: Prisma.EmployeeUpdateInput = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;

    return this.prisma.employee.update({ where: { id: employeeId }, data: updateData });
  }
}
