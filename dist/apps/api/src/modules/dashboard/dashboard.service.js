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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKpis(organizationId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalRevenue, totalExpenses, lastMonthRevenue, lastMonthExpenses, openInvoices, overdueInvoices, activeEmployees, lowStockCount, openOpportunities, cashBalance,] = await Promise.all([
            this.prisma.journalLine.aggregate({
                where: {
                    account: { organizationId, type: 'revenue' },
                    journalEntry: { status: 'posted', date: { gte: startOfMonth } },
                },
                _sum: { credit: true },
            }),
            this.prisma.journalLine.aggregate({
                where: {
                    account: { organizationId, type: 'expense' },
                    journalEntry: { status: 'posted', date: { gte: startOfMonth } },
                },
                _sum: { debit: true },
            }),
            this.prisma.journalLine.aggregate({
                where: {
                    account: { organizationId, type: 'revenue' },
                    journalEntry: { status: 'posted', date: { gte: startOfLastMonth, lte: endOfLastMonth } },
                },
                _sum: { credit: true },
            }),
            this.prisma.journalLine.aggregate({
                where: {
                    account: { organizationId, type: 'expense' },
                    journalEntry: { status: 'posted', date: { gte: startOfLastMonth, lte: endOfLastMonth } },
                },
                _sum: { debit: true },
            }),
            this.prisma.invoice.count({ where: { organizationId, status: { in: ['sent', 'partial'] } } }),
            this.prisma.invoice.count({ where: { organizationId, status: 'overdue' } }),
            this.prisma.employee.count({ where: { organizationId, status: 'active' } }),
            this.prisma.stockLevel.count({
                where: { product: { organizationId, trackInventory: true } },
            }),
            this.prisma.opportunity.count({
                where: { contact: { organizationId }, stage: { notIn: ['closed_won', 'closed_lost'] } },
            }),
            this.prisma.journalLine.aggregate({
                where: {
                    account: { organizationId, type: 'asset', subtype: 'bank' },
                    journalEntry: { status: 'posted' },
                },
                _sum: { debit: true, credit: true },
            }),
        ]);
        const rev = Number(totalRevenue._sum.credit || 0);
        const exp = Number(totalExpenses._sum.debit || 0);
        const lastRev = Number(lastMonthRevenue._sum.credit || 0);
        const lastExp = Number(lastMonthExpenses._sum.debit || 0);
        const cash = Number(cashBalance._sum.debit || 0) - Number(cashBalance._sum.credit || 0);
        return {
            revenue: {
                thisMonth: rev,
                lastMonth: lastRev,
                change: lastRev > 0 ? ((rev - lastRev) / lastRev) * 100 : null,
            },
            expenses: {
                thisMonth: exp,
                lastMonth: lastExp,
                change: lastExp > 0 ? ((exp - lastExp) / lastExp) * 100 : null,
            },
            netIncome: { thisMonth: rev - exp, lastMonth: lastRev - lastExp },
            cash: { balance: cash },
            invoices: { open: openInvoices, overdue: overdueInvoices },
            employees: { active: activeEmployees },
            inventory: { stockRecords: lowStockCount },
            crm: { openOpportunities },
        };
    }
    async getTrends(organizationId, months = 6) {
        const now = new Date();
        const result = [];
        for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const [rev, exp] = await Promise.all([
                this.prisma.journalLine.aggregate({
                    where: {
                        account: { organizationId, type: 'revenue' },
                        journalEntry: { status: 'posted', date: { gte: start, lte: end } },
                    },
                    _sum: { credit: true },
                }),
                this.prisma.journalLine.aggregate({
                    where: {
                        account: { organizationId, type: 'expense' },
                        journalEntry: { status: 'posted', date: { gte: start, lte: end } },
                    },
                    _sum: { debit: true },
                }),
            ]);
            const revenue = Number(rev._sum.credit || 0);
            const expenses = Number(exp._sum.debit || 0);
            result.push({
                month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
                revenue,
                expenses,
                netIncome: revenue - expenses,
            });
        }
        return result;
    }
    async getIncomeStatement(organizationId, startDate, endDate) {
        const [revenues, expenses] = await Promise.all([
            this.prisma.journalLine.findMany({
                where: {
                    account: { organizationId, type: 'revenue' },
                    journalEntry: { status: 'posted', date: { gte: startDate, lte: endDate } },
                },
                include: { account: { select: { name: true, code: true } } },
            }),
            this.prisma.journalLine.findMany({
                where: {
                    account: { organizationId, type: 'expense' },
                    journalEntry: { status: 'posted', date: { gte: startDate, lte: endDate } },
                },
                include: { account: { select: { name: true, code: true } } },
            }),
        ]);
        const revenueByAccount = this.groupByAccount(revenues, 'credit');
        const expenseByAccount = this.groupByAccount(expenses, 'debit');
        const totalRevenue = revenueByAccount.reduce((sum, a) => sum + a.amount, 0);
        const totalExpenses = expenseByAccount.reduce((sum, a) => sum + a.amount, 0);
        return {
            period: { start: startDate, end: endDate },
            revenue: { accounts: revenueByAccount, total: totalRevenue },
            expenses: { accounts: expenseByAccount, total: totalExpenses },
            netIncome: totalRevenue - totalExpenses,
        };
    }
    async getInventorySummary(organizationId) {
        const [totalProducts, stockLevels, lowStock] = await Promise.all([
            this.prisma.product.count({ where: { organizationId, isActive: true } }),
            this.prisma.stockLevel.aggregate({
                where: { product: { organizationId } },
                _sum: { quantity: true },
            }),
            this.prisma.stockLevel.count({
                where: { product: { organizationId, trackInventory: true }, quantity: { lte: 10 } },
            }),
        ]);
        return {
            totalProducts,
            totalStock: Number(stockLevels._sum.quantity || 0),
            lowStockItems: lowStock,
        };
    }
    async getHrSummary(organizationId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [total, active, onLeave, lastPayroll] = await Promise.all([
            this.prisma.employee.count({ where: { organizationId } }),
            this.prisma.employee.count({ where: { organizationId, status: 'active' } }),
            this.prisma.leaveRequest.count({
                where: {
                    employee: { organizationId },
                    status: 'approved',
                    startDate: { lte: now },
                    endDate: { gte: now },
                },
            }),
            this.prisma.payroll.aggregate({
                where: { organizationId, startDate: { gte: startOfMonth } },
                _sum: { totalNet: true },
            }),
        ]);
        return {
            totalEmployees: total,
            activeEmployees: active,
            onLeave,
            monthlyPayroll: Number(lastPayroll._sum?.totalNet || 0),
        };
    }
    async getCrmPipeline(organizationId) {
        const opportunities = await this.prisma.opportunity.groupBy({
            by: ['stage'],
            where: { contact: { organizationId } },
            _count: { id: true },
            _sum: { value: true },
        });
        return opportunities.map((o) => ({
            stage: o.stage,
            count: o._count.id,
            value: Number(o._sum.value || 0),
        }));
    }
    async exportCsv(organizationId, report, startDate, endDate) {
        switch (report) {
            case 'income-statement': {
                const data = await this.getIncomeStatement(organizationId, startDate, endDate);
                const rows = ['Type,Account,Amount'];
                data.revenue.accounts.forEach((a) => rows.push(`Revenue,"${a.name}",${a.amount}`));
                rows.push(`Revenue Total,,${data.revenue.total}`);
                data.expenses.accounts.forEach((a) => rows.push(`Expense,"${a.name}",${a.amount}`));
                rows.push(`Expense Total,,${data.expenses.total}`);
                rows.push(`Net Income,,${data.netIncome}`);
                return rows.join('\n');
            }
            case 'inventory': {
                const products = await this.prisma.stockLevel.findMany({
                    where: { product: { organizationId } },
                    include: {
                        product: { select: { name: true, sku: true, costPrice: true } },
                        warehouse: { select: { name: true } },
                    },
                });
                const rows = ['SKU,Product,Warehouse,Quantity,Unit Cost,Total Value'];
                products.forEach((sl) => {
                    const product = sl.product;
                    const total = Number(sl.quantity) * Number(product.costPrice || 0);
                    rows.push(`"${product.sku}","${sl.product.name}","${sl.warehouse.name}",${sl.quantity},${product.costPrice || 0},${total}`);
                });
                return rows.join('\n');
            }
            case 'crm-pipeline': {
                const pipeline = await this.getCrmPipeline(organizationId);
                const rows = ['Stage,Count,Total Value'];
                pipeline.forEach((p) => rows.push(`"${p.stage}",${p.count},${p.value}`));
                return rows.join('\n');
            }
            default:
                throw new Error(`Unknown report type: ${report}`);
        }
    }
    groupByAccount(lines, field) {
        const map = new Map();
        for (const line of lines) {
            const key = line.account.code;
            const existing = map.get(key) || {
                name: line.account.name,
                code: line.account.code,
                amount: 0,
            };
            existing.amount += Number(line[field] || 0);
            map.set(key, existing);
        }
        return Array.from(map.values());
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map