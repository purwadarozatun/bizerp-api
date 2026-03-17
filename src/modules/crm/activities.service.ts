import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, type?: string, contactId?: string, page = 1, pageSize = 25) {
    const where = {
      contact: { organizationId },
      ...(type ? { type } : {}),
      ...(contactId ? { contactId } : {}),
    };
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: { contact: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: ps,
      }),
      this.prisma.activity.count({ where }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { contact: true },
    });
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
  }

  async create(data: { contactId: string; type: string; subject: string; description?: string; dueDate?: Date }) {
    return this.prisma.activity.create({ data, include: { contact: true } });
  }

  async complete(id: string) {
    await this.findOne(id);
    return this.prisma.activity.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }

  async update(id: string, data: Partial<{ type: string; subject: string; description: string; dueDate: Date }>) {
    await this.findOne(id);
    return this.prisma.activity.update({ where: { id }, data });
  }

  async getTimeline(contactId: string) {
    const [activities, leads, opportunities] = await Promise.all([
      this.prisma.activity.findMany({ where: { contactId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.lead.findMany({ where: { contactId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.opportunity.findMany({ where: { contactId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const timeline = [
      ...activities.map(a => ({ type: 'activity', date: a.createdAt, data: a })),
      ...leads.map(l => ({ type: 'lead', date: l.createdAt, data: l })),
      ...opportunities.map(o => ({ type: 'opportunity', date: o.createdAt, data: o })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeline;
  }
}
