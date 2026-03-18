import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@bis/database';

interface CreateJournalLineDto {
  accountId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
}

interface CreateJournalDto {
  date: Date;
  description: string;
  reference?: string;
  currency?: string;
  referenceId?: string;
  referenceType?: 'INVOICE' | 'BILL';
  source?: 'SYSTEM' | 'MANUAL';
  createdByUserId?: string;
  lines: CreateJournalLineDto[];
}

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(
    organizationId: string,
    referenceId?: string,
    referenceType?: string,
    page = 1,
    pageSize = 25,
  ) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const where: Record<string, unknown> = { organizationId };
    if (referenceId) where['referenceId'] = referenceId;
    if (referenceType) where['referenceType'] = referenceType;

    const [entries, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: { lines: { include: { account: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: ps,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    // Compute totalDebit and totalCredit for each entry
    const data = entries.map((entry) => {
      const lines = entry.lines as Array<{ debit: unknown; credit: unknown }>;
      const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit), 0);
      return {
        ...entry,
        entryNumber: entry.number,
        totalDebit,
        totalCredit,
      };
    });

    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, organizationId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, organizationId },
      include: { lines: { include: { account: true } } },
    });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    return entry;
  }

  async create(organizationId: string, dto: CreateJournalDto) {
    // Validate double-entry balance
    const totalDebit = dto.lines
      .filter((l) => l.type === 'DEBIT')
      .reduce((sum, l) => sum + l.amount, 0);
    const totalCredit = dto.lines
      .filter((l) => l.type === 'CREDIT')
      .reduce((sum, l) => sum + l.amount, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException('Journal entry is not balanced: debits must equal credits');
    }
    if (dto.lines.length < 2) {
      throw new BadRequestException('Journal entry must have at least 2 lines');
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
        source: dto.source || 'MANUAL',
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
        createdByUserId: dto.createdByUserId,
        lines: {
          create: dto.lines.map((l) => ({
            accountId: l.accountId,
            type: l.type,
            amount: l.amount,
            description: l.description,
            debit: l.type === 'DEBIT' ? l.amount : 0,
            credit: l.type === 'CREDIT' ? l.amount : 0,
          })),
        },
      },
      include: { lines: { include: { account: true } } },
    });
  }

  async update(id: string, organizationId: string, dto: Partial<CreateJournalDto>) {
    const entry = await this.findOne(id, organizationId);
    if (entry.status !== 'draft') {
      throw new BadRequestException('Only draft journal entries can be edited');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.date) updateData['date'] = dto.date;
    if (dto.description) updateData['description'] = dto.description;
    if (dto.reference !== undefined) updateData['reference'] = dto.reference;
    if (dto.currency) updateData['currency'] = dto.currency;

    if (dto.lines) {
      const totalDebit = dto.lines
        .filter((l) => l.type === 'DEBIT')
        .reduce((sum, l) => sum + l.amount, 0);
      const totalCredit = dto.lines
        .filter((l) => l.type === 'CREDIT')
        .reduce((sum, l) => sum + l.amount, 0);
      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        throw new BadRequestException('Journal entry is not balanced: debits must equal credits');
      }
      updateData['lines'] = {
        deleteMany: {},
        create: dto.lines.map((l) => ({
          accountId: l.accountId,
          type: l.type,
          amount: l.amount,
          description: l.description,
          debit: l.type === 'DEBIT' ? l.amount : 0,
          credit: l.type === 'CREDIT' ? l.amount : 0,
        })),
      };
    }

    return this.prisma.journalEntry.update({
      where: { id },
      data: updateData as Parameters<typeof this.prisma.journalEntry.update>[0]['data'],
      include: { lines: { include: { account: true } } },
    });
  }

  async post(id: string, organizationId: string) {
    const entry = await this.findOne(id, organizationId);
    if (entry.status !== 'draft') {
      throw new BadRequestException('Only draft entries can be posted');
    }
    return this.prisma.journalEntry.update({
      where: { id },
      data: { status: 'posted' },
      include: { lines: { include: { account: true } } },
    });
  }

  async void(id: string, organizationId: string, reason: string) {
    const entry = await this.findOne(id, organizationId);
    if (entry.status === 'voided') {
      throw new BadRequestException('Entry is already voided');
    }
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Void reason is required');
    }
    return this.prisma.journalEntry.update({
      where: { id },
      data: { status: 'voided', voidReason: reason },
      include: { lines: { include: { account: true } } },
    });
  }

  async delete(id: string, organizationId: string) {
    const entry = await this.findOne(id, organizationId);
    if (entry.status !== 'draft') {
      throw new ForbiddenException('Only draft journal entries can be deleted');
    }
    if (entry.source === 'SYSTEM') {
      throw new ForbiddenException(
        'System-generated journal entries cannot be deleted. Use void instead.',
      );
    }
    return this.prisma.journalEntry.delete({ where: { id } });
  }

  /**
   * Internal: create a journal entry from the auto-journal service (source=SYSTEM)
   */
  async createSystemEntry(
    organizationId: string,
    dto: CreateJournalDto & { referenceId: string; referenceType: 'INVOICE' | 'BILL' },
  ) {
    return this.create(organizationId, { ...dto, source: 'SYSTEM' });
  }

  /**
   * Create a reversal entry for a posted journal entry
   */
  async createReversal(id: string, organizationId: string, createdByUserId?: string) {
    const entry = await this.findOne(id, organizationId);
    if (entry.status !== 'posted') {
      throw new BadRequestException('Only posted entries can be reversed');
    }

    const lines = entry.lines as Array<{
      accountId: string;
      type: string;
      amount: unknown;
      description?: string | null;
    }>;

    const reversalLines: CreateJournalLineDto[] = lines.map((l) => ({
      accountId: l.accountId,
      type: l.type === 'DEBIT' ? 'CREDIT' : 'DEBIT',
      amount: Number(l.amount),
      description: l.description || undefined,
    }));

    const count = await this.prisma.journalEntry.count({ where: { organizationId } });
    const number = `JE-${String(count + 1).padStart(6, '0')}`;

    return this.prisma.journalEntry.create({
      data: {
        organizationId,
        number,
        date: new Date(),
        description: `Reversal of ${entry.number}`,
        status: 'draft',
        source: entry.source,
        referenceId: entry.referenceId || undefined,
        referenceType: (entry.referenceType as 'INVOICE' | 'BILL') || undefined,
        reversalOfId: entry.id,
        createdByUserId,
        lines: {
          create: reversalLines.map((l) => ({
            accountId: l.accountId,
            type: l.type,
            amount: l.amount,
            description: l.description,
            debit: l.type === 'DEBIT' ? l.amount : 0,
            credit: l.type === 'CREDIT' ? l.amount : 0,
          })),
        },
      },
      include: { lines: { include: { account: true } } },
    });
  }
}
