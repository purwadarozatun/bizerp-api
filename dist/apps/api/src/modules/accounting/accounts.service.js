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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let AccountsService = class AccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId) {
        const [accounts, balanceRows] = await Promise.all([
            this.prisma.account.findMany({
                where: { organizationId, isActive: true },
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
    async create(organizationId, data) {
        return this.prisma.account.create({
            data: { ...data, organizationId },
        });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        return this.prisma.account.update({ where: { id }, data });
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
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map