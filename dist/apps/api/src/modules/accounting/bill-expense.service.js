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
exports.BillExpenseService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
/**
 * BillExpenseService
 *
 * Manages the accounting expense entry lifecycle that mirrors a Bill's status:
 *   approved  → creates a pending expense entry
 *   paid      → marks expense as completed
 *   rejected  → voids the expense entry (if one exists)
 *   deleted   → voids the expense entry (if one exists)
 */
let BillExpenseService = class BillExpenseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Called when a bill is approved.
     * Creates a pending expense entry linked to the bill.
     */
    async onApproved(billId) {
        const bill = await this.prisma.bill.findUnique({
            where: { id: billId },
        });
        if (!bill)
            return;
        // Idempotent: don't create a second entry if one already exists
        const existing = await this.prisma.billExpense.findUnique({ where: { billId } });
        if (existing)
            return existing;
        return this.prisma.billExpense.create({
            data: {
                billId,
                organizationId: bill.organizationId,
                category: bill.expenseCategory,
                amount: bill.total,
                status: 'pending',
                description: `Bill ${bill.number}${bill.notes ? ` — ${bill.notes}` : ''}`,
                referenceNo: bill.referenceNo ?? bill.number,
                expenseDate: bill.date,
            },
        });
    }
    /**
     * Called when a bill is marked as paid.
     * Updates the linked expense entry to completed.
     */
    async onPaid(billId, completedAt) {
        const expense = await this.prisma.billExpense.findUnique({ where: { billId } });
        if (!expense || expense.status === 'voided')
            return;
        return this.prisma.billExpense.update({
            where: { billId },
            data: { status: 'completed', completedAt },
        });
    }
    /**
     * Called when a bill is rejected or deleted.
     * Voids the linked expense entry if one exists.
     */
    async onVoided(billId, reason) {
        const expense = await this.prisma.billExpense.findUnique({ where: { billId } });
        if (!expense || expense.status === 'voided')
            return;
        return this.prisma.billExpense.update({
            where: { billId },
            data: { status: 'voided', voidedAt: new Date(), voidReason: reason },
        });
    }
    /**
     * Returns all bill-sourced expense entries for the organization.
     * Supports optional status filter.
     */
    async findAll(organizationId, status) {
        const where = { organizationId };
        if (status) {
            const statuses = status.split(',').map((s) => s.trim());
            where['status'] = { in: statuses };
        }
        return this.prisma.billExpense.findMany({
            where,
            include: { bill: { include: { contact: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.BillExpenseService = BillExpenseService;
exports.BillExpenseService = BillExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], BillExpenseService);
//# sourceMappingURL=bill-expense.service.js.map