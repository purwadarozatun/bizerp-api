import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

interface CreateJournalDto {
  date: Date;
  description: string;
  reference?: string;
  currency?: string;
  lines: Array<{ accountId: string; description?: string; debit?: number; credit?: number }>;
}

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, page = 1, pageSize = 25) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: { organizationId },
        include: { lines: { include: { account: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: ps,
      }),
      this.prisma.journalEntry.count({ where: { organizationId } }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async create(organizationId: string, dto: CreateJournalDto) {
    // Validate double-entry
    const totalDebit = dto.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = dto.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException('Journal entry is not balanced: debits must equal credits');
    }

    const count = await this.prisma.journalEntry.count({ where: { organizationId } });
    const number = `JE-${String(count + 1).padStart(6, '0')}`;

    return this.prisma.journalEntry.create({
      data: {
        organizationId,
        number,
        date: dto.date,
        description: dto.description,
        reference: dto.reference,
        currency: dto.currency || 'USD',
        status: 'draft',
        lines: { create: dto.lines.map(l => ({ accountId: l.accountId, description: l.description, debit: l.debit || 0, credit: l.credit || 0 })) },
      },
      include: { lines: { include: { account: true } } },
    });
  }

  async post(id: string, organizationId: string) {
    const entry = await this.prisma.journalEntry.findFirst({ where: { id, organizationId } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    if (entry.status !== 'draft') throw new BadRequestException('Only draft entries can be posted');
    return this.prisma.journalEntry.update({ where: { id }, data: { status: 'posted' } });
  }

  async void(id: string, organizationId: string) {
    const entry = await this.prisma.journalEntry.findFirst({ where: { id, organizationId } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    if (entry.status === 'voided') throw new BadRequestException('Entry is already voided');
    return this.prisma.journalEntry.update({ where: { id }, data: { status: 'voided' } });
  }
}
