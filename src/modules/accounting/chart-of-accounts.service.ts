import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class ChartOfAccountsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, isActive?: boolean) {
    const where: Record<string, unknown> = { organizationId };
    if (isActive !== undefined) where['isActive'] = isActive;

    const [accounts, balanceRows] = await Promise.all([
      this.prisma.account.findMany({
        where,
        include: { children: true },
        orderBy: { code: 'asc' },
      }),
      this.prisma.journalLine.groupBy({
        by: ['accountId'],
        where: {
          account: { organizationId },
          journalEntry: { status: 'posted' },
        },
        _sum: { debit: true, credit: true },
      }),
    ]);

    const balanceMap = new Map<string, number>();
    for (const row of balanceRows) {
      const debit = Number(row._sum.debit ?? 0);
      const credit = Number(row._sum.credit ?? 0);
      balanceMap.set(row.accountId, debit - credit);
    }

    const data = accounts.map((a) => ({
      ...a,
      balance: balanceMap.get(a.id) ?? 0,
    }));

    return { data, total: data.length };
  }

  async findOne(id: string, organizationId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, organizationId },
      include: { parent: true, children: true },
    });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async create(
    organizationId: string,
    data: {
      code: string;
      name: string;
      type: string;
      subtype?: string;
      description?: string;
      parentId?: string;
      isSystemAccount?: boolean;
    },
    userRole: string,
  ) {
    if (data.isSystemAccount && !['owner', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Only Super Admin can create system accounts');
    }
    return this.prisma.account.create({
      data: { ...data, organizationId },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      description: string;
      isActive: boolean;
      subtype: string;
    }>,
  ) {
    await this.findOne(id, organizationId);
    return this.prisma.account.update({ where: { id }, data });
  }

  async deactivate(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.account.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Category CoA Mappings ───────────────────────────────────────────────

  async findCategoryMappings(organizationId: string, documentType?: string) {
    const where: Record<string, unknown> = { organizationId };
    if (documentType) where['documentType'] = documentType;
    const data = await this.prisma.categoryCoAMapping.findMany({
      where,
      include: { account: true },
    });
    return { data, total: data.length };
  }

  async setCategoryMapping(
    organizationId: string,
    data: { category: string; documentType: string; accountId: string; isDefault?: boolean },
  ) {
    return this.prisma.categoryCoAMapping.upsert({
      where: {
        organizationId_category_documentType: {
          organizationId,
          category: data.category,
          documentType: data.documentType,
        },
      },
      update: { accountId: data.accountId, isDefault: data.isDefault ?? false },
      create: {
        organizationId,
        category: data.category,
        documentType: data.documentType,
        accountId: data.accountId,
        isDefault: data.isDefault ?? false,
      },
      include: { account: true },
    });
  }

  // ─── System Account Configs ──────────────────────────────────────────────

  async getSystemAccounts(organizationId: string) {
    const data = await this.prisma.systemAccountConfig.findMany({
      where: { organizationId },
      include: { account: true },
    });
    return { data };
  }

  async updateSystemAccount(
    organizationId: string,
    accountType: string,
    accountId: string,
    userRole: string,
  ) {
    if (!['owner', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Only Super Admin can update system accounts');
    }
    // Verify account exists for org
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, organizationId },
    });
    if (!account) throw new NotFoundException(`Account ${accountId} not found`);

    return this.prisma.systemAccountConfig.upsert({
      where: { organizationId_accountType: { organizationId, accountType } },
      update: { accountId },
      create: { organizationId, accountType, accountId },
      include: { account: true },
    });
  }

  async getTrialBalance(organizationId: string, asOf: Date) {
    const lines = await this.prisma.journalLine.findMany({
      where: {
        account: { organizationId },
        journalEntry: { status: 'posted', date: { lte: asOf } },
      },
      include: { account: true },
    });

    const balances = new Map<
      string,
      {
        account: { id: string; code: string; name: string; type: string };
        debit: number;
        credit: number;
      }
    >();
    for (const line of lines) {
      const existing = balances.get(line.accountId) ?? {
        account: {
          id: line.account.id,
          code: line.account.code,
          name: line.account.name,
          type: line.account.type,
        },
        debit: 0,
        credit: 0,
      };
      existing.debit += Number(line.debit);
      existing.credit += Number(line.credit);
      balances.set(line.accountId, existing);
    }

    return Array.from(balances.values()).sort((a, b) =>
      a.account.code.localeCompare(b.account.code),
    );
  }
}
