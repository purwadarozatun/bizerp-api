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
exports.BillsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
const bill_expense_service_1 = require("./bill-expense.service");
const auto_journal_service_1 = require("./auto-journal.service");
// Valid status transitions
const STATUS_TRANSITIONS = {
    draft: ['pending_approval'],
    pending_approval: ['approved', 'rejected'],
    approved: ['paid'],
    rejected: ['pending_approval'], // can be re-submitted
    paid: [], // locked
};
const VALID_STATUSES = ['draft', 'pending_approval', 'approved', 'paid', 'rejected'];
let BillsService = class BillsService {
    prisma;
    billExpense;
    autoJournal;
    constructor(prisma, billExpense, autoJournal) {
        this.prisma = prisma;
        this.billExpense = billExpense;
        this.autoJournal = autoJournal;
    }
    async findAll(organizationId, status, vendor, dateFrom, dateTo, page = 1, pageSize = 25, sortBy, sortDir) {
        const where = { organizationId };
        if (status) {
            const statuses = status.split(',').map((s) => s.trim());
            where['status'] = { in: statuses };
        }
        if (vendor) {
            where['contact'] = {
                OR: [
                    { company: { contains: vendor, mode: 'insensitive' } },
                    { firstName: { contains: vendor, mode: 'insensitive' } },
                    { lastName: { contains: vendor, mode: 'insensitive' } },
                ],
            };
        }
        if (dateFrom || dateTo) {
            where['date'] = {};
            if (dateFrom)
                where['date']['gte'] = new Date(dateFrom);
            if (dateTo)
                where['date']['lte'] = new Date(dateTo);
        }
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        // Build orderBy
        const allowedSortKeys = ['number', 'date', 'dueDate', 'total', 'createdAt'];
        const key = allowedSortKeys.includes(sortBy ?? '') ? sortBy : 'date';
        const dir = sortDir === 'asc' ? 'asc' : 'desc';
        const orderBy = [{ [key]: dir }];
        const [data, total] = await Promise.all([
            this.prisma.bill.findMany({
                where,
                include: {
                    contact: true,
                    lines: true,
                    _count: { select: { attachments: true } },
                },
                orderBy,
                skip,
                take: ps,
            }),
            this.prisma.bill.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id, organizationId) {
        const bill = await this.prisma.bill.findFirst({
            where: { id, organizationId },
            include: {
                contact: true,
                lines: true,
                payments: true,
                attachments: true,
                statusLogs: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!bill)
            throw new common_1.NotFoundException(`Bill ${id} not found`);
        return bill;
    }
    async create(organizationId, data) {
        if (!data.lines || data.lines.length === 0) {
            throw new common_1.BadRequestException('At least one line item is required');
        }
        const count = await this.prisma.bill.count({ where: { organizationId } });
        const number = `BILL-${String(count + 1).padStart(6, '0')}`;
        const lines = data.lines.map((l) => ({
            ...l,
            taxRate: l.taxRate || 0,
            total: l.quantity * l.unitPrice * (1 + (l.taxRate || 0) / 100),
        }));
        const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
        const taxAmount = lines.reduce((s, l) => s + l.quantity * l.unitPrice * ((l.taxRate || 0) / 100), 0);
        const total = subtotal + taxAmount;
        const bill = await this.prisma.bill.create({
            data: {
                organizationId,
                number,
                contactId: data.contactId,
                date: data.date,
                dueDate: data.dueDate,
                currency: data.currency || 'USD',
                expenseCategory: data.expenseCategory,
                referenceNo: data.referenceNo,
                notes: data.notes,
                subtotal,
                taxAmount,
                total,
                lines: {
                    create: lines.map((l) => ({
                        accountId: l.accountId,
                        description: l.description,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                        taxRate: l.taxRate || 0,
                        total: l.total,
                    })),
                },
            },
            include: { contact: true, lines: true },
        });
        // Log creation
        await this.prisma.billStatusLog.create({
            data: {
                billId: bill.id,
                fromStatus: null,
                toStatus: 'draft',
                actorType: 'system',
                note: 'Bill created',
            },
        });
        return bill;
    }
    async update(id, organizationId, data) {
        const bill = await this.findOne(id, organizationId);
        if (bill.status !== 'draft' && bill.status !== 'rejected') {
            throw new common_1.ForbiddenException('Only draft or rejected bills can be edited');
        }
        const updateData = {};
        if (data.contactId)
            updateData['contactId'] = data.contactId;
        if (data.date)
            updateData['date'] = data.date;
        if (data.dueDate)
            updateData['dueDate'] = data.dueDate;
        if (data.currency)
            updateData['currency'] = data.currency;
        if (data.expenseCategory !== undefined)
            updateData['expenseCategory'] = data.expenseCategory;
        if (data.referenceNo !== undefined)
            updateData['referenceNo'] = data.referenceNo;
        if (data.notes !== undefined)
            updateData['notes'] = data.notes;
        if (data.lines) {
            const lines = data.lines.map((l) => ({
                ...l,
                taxRate: l.taxRate || 0,
                total: l.quantity * l.unitPrice * (1 + (l.taxRate || 0) / 100),
            }));
            const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
            const taxAmount = lines.reduce((s, l) => s + l.quantity * l.unitPrice * ((l.taxRate || 0) / 100), 0);
            updateData['subtotal'] = subtotal;
            updateData['taxAmount'] = taxAmount;
            updateData['total'] = subtotal + taxAmount;
            updateData['lines'] = {
                deleteMany: {},
                create: lines.map((l) => ({
                    accountId: l.accountId,
                    description: l.description,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    taxRate: l.taxRate || 0,
                    total: l.total,
                })),
            };
        }
        return this.prisma.bill.update({
            where: { id },
            data: updateData,
            include: { contact: true, lines: true },
        });
    }
    async submitForApproval(id, organizationId, actorId) {
        const bill = await this.findOne(id, organizationId);
        this.validateTransition(bill.status, 'pending_approval');
        if (!bill.lines || bill.lines.length === 0) {
            throw new common_1.BadRequestException('Bill must have at least one line item before submitting');
        }
        const updated = await this.prisma.bill.update({
            where: { id },
            data: { status: 'pending_approval', submittedAt: new Date() },
        });
        await this.prisma.billStatusLog.create({
            data: {
                billId: id,
                fromStatus: bill.status,
                toStatus: 'pending_approval',
                actorId,
                actorType: 'user',
                note: 'Submitted for approval',
            },
        });
        return updated;
    }
    async approve(id, organizationId, actorId) {
        const bill = await this.findOne(id, organizationId);
        this.validateTransition(bill.status, 'approved');
        const updated = await this.prisma.bill.update({
            where: { id },
            data: { status: 'approved', approvedAt: new Date(), approvedById: actorId },
        });
        await this.prisma.billStatusLog.create({
            data: {
                billId: id,
                fromStatus: bill.status,
                toStatus: 'approved',
                actorId,
                actorType: 'user',
                note: 'Bill approved',
            },
        });
        // BIS-82: create pending expense entry
        await this.billExpense.onApproved(id);
        // Trigger auto-journal for approved transition (fire-and-forget; errors are non-fatal)
        this.autoJournal
            .onBillStatusChange(id, organizationId, bill.status, 'approved', actorId)
            .catch(() => { });
        return updated;
    }
    async reject(id, organizationId, reason, actorId) {
        if (!reason || reason.trim().length === 0) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        const bill = await this.findOne(id, organizationId);
        this.validateTransition(bill.status, 'rejected');
        const updated = await this.prisma.bill.update({
            where: { id },
            data: { status: 'rejected', rejectionReason: reason },
        });
        await this.prisma.billStatusLog.create({
            data: {
                billId: id,
                fromStatus: bill.status,
                toStatus: 'rejected',
                actorId,
                actorType: 'user',
                note: `Rejected: ${reason}`,
            },
        });
        // BIS-82: void expense entry if one exists
        await this.billExpense.onVoided(id, `Rejected: ${reason}`);
        // Trigger auto-journal void reversal (fire-and-forget; errors are non-fatal)
        this.autoJournal
            .onBillStatusChange(id, organizationId, bill.status, 'rejected', actorId)
            .catch(() => { });
        return updated;
    }
    async markAsPaid(id, organizationId, payment, actorId) {
        const bill = await this.findOne(id, organizationId);
        this.validateTransition(bill.status, 'paid');
        const validMethods = ['bank_transfer', 'cash', 'cheque', 'other'];
        if (!validMethods.includes(payment.paymentMethod)) {
            throw new common_1.BadRequestException(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
        }
        const updated = await this.prisma.bill.update({
            where: { id },
            data: {
                status: 'paid',
                paidAt: payment.paymentDate,
                paidMethod: payment.paymentMethod,
                paidReference: payment.reference,
                paidNotes: payment.notes,
                amountPaid: bill.total,
            },
        });
        await this.prisma.billStatusLog.create({
            data: {
                billId: id,
                fromStatus: bill.status,
                toStatus: 'paid',
                actorId,
                actorType: 'user',
                note: `Marked as paid via ${payment.paymentMethod}${payment.reference ? ` (ref: ${payment.reference})` : ''}`,
            },
        });
        // BIS-82: mark expense entry as completed
        await this.billExpense.onPaid(id, payment.paymentDate);
        // Trigger auto-journal for paid transition (fire-and-forget; errors are non-fatal)
        this.autoJournal
            .onBillStatusChange(id, organizationId, bill.status, 'paid', actorId)
            .catch(() => { });
        return updated;
    }
    async delete(id, organizationId) {
        const bill = await this.findOne(id, organizationId);
        if (bill.status !== 'draft') {
            throw new common_1.ForbiddenException('Only draft bills can be deleted');
        }
        // BIS-82: void expense entry if one exists (shouldn't for draft, but safe)
        await this.billExpense.onVoided(id, 'Bill deleted');
        return this.prisma.bill.delete({ where: { id } });
    }
    async updateStatus(id, organizationId, status) {
        if (!VALID_STATUSES.includes(status)) {
            throw new common_1.BadRequestException(`Invalid status: ${status}`);
        }
        const bill = await this.findOne(id, organizationId);
        this.validateTransition(bill.status, status);
        return this.prisma.bill.update({ where: { id }, data: { status } });
    }
    validateTransition(from, to) {
        const allowed = STATUS_TRANSITIONS[from] ?? [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Cannot transition bill from '${from}' to '${to}'. Allowed transitions from '${from}': ${allowed.join(', ') || 'none'}`);
        }
    }
};
exports.BillsService = BillsService;
exports.BillsService = BillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient,
        bill_expense_service_1.BillExpenseService,
        auto_journal_service_1.AutoJournalService])
], BillsService);
//# sourceMappingURL=bills.service.js.map