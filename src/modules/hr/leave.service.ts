import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, status?: string, page = 1, pageSize = 25) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const where = { employee: { organizationId }, ...(status ? { status } : {}) };
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({ where, include: { employee: true }, skip, take: ps, orderBy: { createdAt: 'desc' } }),
      this.prisma.leaveRequest.count({ where }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async create(data: { employeeId: string; type: string; startDate: Date; endDate: Date; days: number; reason?: string }) {
    return this.prisma.leaveRequest.create({ data: { ...data, status: 'pending' }, include: { employee: true } });
  }

  async updateStatus(id: string, status: 'approved' | 'rejected' | 'cancelled', notes?: string) {
    const req = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException(`Leave request ${id} not found`);
    return this.prisma.leaveRequest.update({ where: { id }, data: { status, notes } });
  }
}
