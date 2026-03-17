import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, search?: string, page = 1, pageSize = 25) {
    const where = {
      organizationId,
      ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }, { company: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {}),
    };
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({ where, skip, take: ps, orderBy: { createdAt: 'desc' } }),
      this.prisma.contact.count({ where }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, organizationId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, organizationId },
      include: { leads: true, opportunities: true, activities: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!contact) throw new NotFoundException(`Contact ${id} not found`);
    return contact;
  }

  async create(organizationId: string, data: { type?: string; firstName?: string; lastName?: string; company?: string; email?: string; phone?: string; website?: string; isCustomer?: boolean; isVendor?: boolean; notes?: string }) {
    return this.prisma.contact.create({ data: { ...data, organizationId } });
  }

  async update(id: string, organizationId: string, data: Partial<{ firstName: string; lastName: string; company: string; email: string; phone: string; notes: string; isCustomer: boolean; isVendor: boolean }>) {
    await this.findOne(id, organizationId);
    return this.prisma.contact.update({ where: { id }, data });
  }

  async logActivity(contactId: string, data: { type: string; subject: string; description?: string; dueDate?: Date }) {
    return this.prisma.activity.create({ data: { ...data, contactId } });
  }
}
