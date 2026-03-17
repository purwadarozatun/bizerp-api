import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaClient) {}

  async getPipeline(organizationId: string) {
    const opps = await this.prisma.opportunity.findMany({
      where: { contact: { organizationId } },
      include: { contact: true },
      orderBy: { createdAt: 'desc' },
    });
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const pipeline = stages.map(stage => ({
      stage,
      opportunities: opps.filter(o => o.stage === stage),
      totalValue: opps.filter(o => o.stage === stage).reduce((s, o) => s + Number(o.value || 0), 0),
    }));
    return pipeline;
  }

  async create(data: { contactId: string; title: string; stage?: string; value?: number; probability?: number; closeDate?: Date; notes?: string }) {
    return this.prisma.opportunity.create({ data: { ...data }, include: { contact: true } });
  }

  async update(id: string, data: Partial<{ title: string; stage: string; value: number; probability: number; closeDate: Date; notes: string }>) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException(`Opportunity ${id} not found`);
    return this.prisma.opportunity.update({ where: { id }, data });
  }
}
