import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, status?: string, page = 1, pageSize = 25) {
    const where = {
      contact: { organizationId },
      ...(status ? { status } : {}),
    };
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: { contact: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: ps,
      }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { contact: true },
    });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async create(data: { contactId: string; title: string; source?: string; value?: number; notes?: string }) {
    return this.prisma.lead.create({
      data,
      include: { contact: true },
    });
  }

  async update(id: string, data: Partial<{ title: string; status: string; source: string; value: number; notes: string }>) {
    await this.findOne(id);
    return this.prisma.lead.update({ where: { id }, data, include: { contact: true } });
  }

  async convertToOpportunity(id: string) {
    const lead = await this.findOne(id);

    const opp = await this.prisma.opportunity.create({
      data: {
        contactId: lead.contactId,
        title: lead.title,
        value: lead.value,
        notes: lead.notes ?? undefined,
      },
      include: { contact: true },
    });

    await this.prisma.lead.update({ where: { id }, data: { status: 'qualified' } });

    return opp;
  }
}
