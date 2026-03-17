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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
const shared_1 = require("@bis/shared");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfitAndLoss(organizationId, from, to) {
        const lines = await this.prisma.journalLine.findMany({
            where: {
                account: { organizationId, type: { in: ['revenue', 'expense'] } },
                journalEntry: { status: 'posted', date: { gte: from, lte: to } },
            },
            include: { account: true },
        });
        const revenue = {};
        const expenses = {};
        for (const line of lines) {
            const net = Number(line.credit) - Number(line.debit);
            if (line.account.type === 'revenue') {
                if (!revenue[line.accountId])
                    revenue[line.accountId] = { name: line.account.name, code: line.account.code, amount: 0 };
                revenue[line.accountId].amount += net;
            }
            else {
                if (!expenses[line.accountId])
                    expenses[line.accountId] = { name: line.account.name, code: line.account.code, amount: 0 };
                expenses[line.accountId].amount += -net;
            }
        }
        const totalRevenue = (0, shared_1.roundMoney)(Object.values(revenue).reduce((s, v) => s + v.amount, 0));
        const totalExpenses = (0, shared_1.roundMoney)(Object.values(expenses).reduce((s, v) => s + v.amount, 0));
        return {
            period: { from, to },
            revenue: Object.values(revenue).sort((a, b) => a.code.localeCompare(b.code)),
            totalRevenue,
            expenses: Object.values(expenses).sort((a, b) => a.code.localeCompare(b.code)),
            totalExpenses,
            netIncome: (0, shared_1.roundMoney)(totalRevenue - totalExpenses),
        };
    }
    async getBalanceSheet(organizationId, asOf) {
        const lines = await this.prisma.journalLine.findMany({
            where: {
                account: { organizationId, type: { in: ['asset', 'liability', 'equity'] } },
                journalEntry: { status: 'posted', date: { lte: asOf } },
            },
            include: { account: true },
        });
        const assets = {};
        const liabilities = {};
        const equity = {};
        for (const line of lines) {
            const net = Number(line.debit) - Number(line.credit);
            const bucket = line.account.type === 'asset' ? assets : line.account.type === 'liability' ? liabilities : equity;
            if (!bucket[line.accountId]) {
                bucket[line.accountId] = { name: line.account.name, code: line.account.code, subtype: line.account.subtype, amount: 0 };
            }
            bucket[line.accountId].amount += net;
        }
        const totalAssets = (0, shared_1.roundMoney)(Object.values(assets).reduce((s, v) => s + v.amount, 0));
        const totalLiabilities = (0, shared_1.roundMoney)(Object.values(liabilities).reduce((s, v) => s + v.amount, 0));
        const totalEquity = (0, shared_1.roundMoney)(Object.values(equity).reduce((s, v) => s + v.amount, 0));
        return {
            asOf,
            assets: Object.values(assets).sort((a, b) => a.code.localeCompare(b.code)),
            totalAssets,
            liabilities: Object.values(liabilities).sort((a, b) => a.code.localeCompare(b.code)),
            totalLiabilities,
            equity: Object.values(equity).sort((a, b) => a.code.localeCompare(b.code)),
            totalEquity,
            liabilitiesAndEquity: (0, shared_1.roundMoney)(totalLiabilities + totalEquity),
        };
    }
    async getCashFlow(organizationId, from, to) {
        // Indirect method: Net Income + adjustments
        const pl = await this.getProfitAndLoss(organizationId, from, to);
        // Operating activities: changes in AR, AP, inventory
        const [arChange, apChange] = await Promise.all([
            // AR: decrease in AR = cash inflow
            this.prisma.journalLine.aggregate({
                where: { account: { organizationId, subtype: 'current_asset', name: { contains: 'Receivable' } }, journalEntry: { status: 'posted', date: { gte: from, lte: to } } },
                _sum: { debit: true, credit: true },
            }),
            // AP: increase in AP = cash inflow
            this.prisma.journalLine.aggregate({
                where: { account: { organizationId, subtype: 'current_liability', name: { contains: 'Payable' } }, journalEntry: { status: 'posted', date: { gte: from, lte: to } } },
                _sum: { debit: true, credit: true },
            }),
        ]);
        const arMovement = (0, shared_1.roundMoney)(Number(arChange._sum.credit || 0) - Number(arChange._sum.debit || 0));
        const apMovement = (0, shared_1.roundMoney)(Number(apChange._sum.credit || 0) - Number(apChange._sum.debit || 0));
        const operatingCashFlow = (0, shared_1.roundMoney)(pl.netIncome + arMovement + apMovement);
        return {
            period: { from, to },
            operating: {
                netIncome: pl.netIncome,
                adjustments: [
                    { label: 'Change in Accounts Receivable', amount: arMovement },
                    { label: 'Change in Accounts Payable', amount: apMovement },
                ],
                total: operatingCashFlow,
            },
            investing: {
                items: [],
                total: 0,
            },
            financing: {
                items: [],
                total: 0,
            },
            netCashChange: (0, shared_1.roundMoney)(operatingCashFlow),
        };
    }
    async getArAging(organizationId, asOf) {
        const ref = asOf ?? new Date();
        const invoices = await this.prisma.invoice.findMany({
            where: { organizationId, status: { in: ['sent', 'partial', 'overdue'] } },
            include: { contact: true },
        });
        const rows = invoices.map((inv) => {
            const daysOverdue = Math.max(0, Math.floor((ref.getTime() - new Date(inv.dueDate).getTime()) / 86400000));
            const outstanding = (0, shared_1.roundMoney)(Number(inv.total) - Number(inv.amountPaid));
            const bucket = this.agingBucket(daysOverdue, outstanding);
            return { id: inv.id, number: inv.number, contact: inv.contact.firstName || inv.contact.company || '', dueDate: inv.dueDate, daysOverdue, outstanding, ...bucket };
        });
        const empty = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0, total: 0 };
        const totals = rows.reduce((acc, r) => ({
            current: (0, shared_1.roundMoney)(acc.current + r.current),
            days1_30: (0, shared_1.roundMoney)(acc.days1_30 + r.days1_30),
            days31_60: (0, shared_1.roundMoney)(acc.days31_60 + r.days31_60),
            days61_90: (0, shared_1.roundMoney)(acc.days61_90 + r.days61_90),
            over90: (0, shared_1.roundMoney)(acc.over90 + r.over90),
            total: (0, shared_1.roundMoney)(acc.total + r.total),
        }), empty);
        return { asOf: ref, rows, totals };
    }
    async getApAging(organizationId, asOf) {
        const ref = asOf ?? new Date();
        const bills = await this.prisma.bill.findMany({
            where: { organizationId, status: { in: ['received', 'partial', 'overdue'] } },
            include: { contact: true },
        });
        const rows = bills.map((bill) => {
            const daysOverdue = Math.max(0, Math.floor((ref.getTime() - new Date(bill.dueDate).getTime()) / 86400000));
            const outstanding = (0, shared_1.roundMoney)(Number(bill.total) - Number(bill.amountPaid));
            const bucket = this.agingBucket(daysOverdue, outstanding);
            return { id: bill.id, number: bill.number, contact: bill.contact.firstName || bill.contact.company || '', dueDate: bill.dueDate, daysOverdue, outstanding, ...bucket };
        });
        const empty2 = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0, total: 0 };
        const totals = rows.reduce((acc, r) => ({
            current: (0, shared_1.roundMoney)(acc.current + r.current),
            days1_30: (0, shared_1.roundMoney)(acc.days1_30 + r.days1_30),
            days31_60: (0, shared_1.roundMoney)(acc.days31_60 + r.days31_60),
            days61_90: (0, shared_1.roundMoney)(acc.days61_90 + r.days61_90),
            over90: (0, shared_1.roundMoney)(acc.over90 + r.over90),
            total: (0, shared_1.roundMoney)(acc.total + r.total),
        }), empty2);
        return { asOf: ref, rows, totals };
    }
    agingBucket(daysOverdue, amount) {
        if (daysOverdue === 0)
            return { current: amount, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0, total: amount };
        if (daysOverdue <= 30)
            return { current: 0, days1_30: amount, days31_60: 0, days61_90: 0, over90: 0, total: amount };
        if (daysOverdue <= 60)
            return { current: 0, days1_30: 0, days31_60: amount, days61_90: 0, over90: 0, total: amount };
        if (daysOverdue <= 90)
            return { current: 0, days1_30: 0, days31_60: 0, days61_90: amount, over90: 0, total: amount };
        return { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: amount, total: amount };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], ReportsService);
//# sourceMappingURL=reports.service.js.map