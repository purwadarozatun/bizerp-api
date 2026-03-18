"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOfAccountsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let ChartOfAccountsService = class ChartOfAccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, isActive) {
        const where = { organizationId };
        if (isActive !== undefined)
            where['isActive'] = isActive;
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
        const balanceMap = new Map();
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
    async findOne(id, organizationId) {
        const account = await this.prisma.account.findFirst({
            where: { id, organizationId },
            include: { parent: true, children: true },
        });
        if (!account)
            throw new common_1.NotFoundException(`Account ${id} not found`);
        return account;
    }
    async create(organizationId, data, userRole) {
        if (data.isSystemAccount && !['owner', 'admin'].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Super Admin can create system accounts');
        }
        return this.prisma.account.create({
            data: { ...data, organizationId },
        });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        return this.prisma.account.update({ where: { id }, data });
    }
    async deactivate(id, organizationId) {
        await this.findOne(id, organizationId);
        return this.prisma.account.update({ where: { id }, data: { isActive: false } });
    }
    // ─── Category CoA Mappings ───────────────────────────────────────────────
    async findCategoryMappings(organizationId, documentType) {
        const where = { organizationId };
        if (documentType)
            where['documentType'] = documentType;
        const data = await this.prisma.categoryCoAMapping.findMany({
            where,
            include: { account: true },
        });
        return { data, total: data.length };
    }
    async setCategoryMapping(organizationId, data) {
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
    async getSystemAccounts(organizationId) {
        const data = await this.prisma.systemAccountConfig.findMany({
            where: { organizationId },
            include: { account: true },
        });
        return { data };
    }
    async updateSystemAccount(organizationId, accountType, accountId, userRole) {
        if (!['owner', 'admin'].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Super Admin can update system accounts');
        }
        // Verify account exists for org
        const account = await this.prisma.account.findFirst({
            where: { id: accountId, organizationId },
        });
        if (!account)
            throw new common_1.NotFoundException(`Account ${accountId} not found`);
        return this.prisma.systemAccountConfig.upsert({
            where: { organizationId_accountType: { organizationId, accountType } },
            update: { accountId },
            create: { organizationId, accountType, accountId },
            include: { account: true },
        });
    }
    async getTrialBalance(organizationId, asOf) {
        const lines = await this.prisma.journalLine.findMany({
            where: {
                account: { organizationId },
                journalEntry: { status: 'posted', date: { lte: asOf } },
            },
            include: { account: true },
        });
        const balances = new Map();
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
        return Array.from(balances.values()).sort((a, b) => a.account.code.localeCompare(b.account.code));
    }
};
exports.ChartOfAccountsService = ChartOfAccountsService;
exports.ChartOfAccountsService = ChartOfAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], ChartOfAccountsService);
//# sourceMappingURL=chart-of-accounts.service.js.map