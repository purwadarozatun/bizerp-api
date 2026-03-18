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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
const auto_journal_service_1 = require("./auto-journal.service");
let InvoicesService = class InvoicesService {
    prisma;
    autoJournal;
    constructor(prisma, autoJournal) {
        this.prisma = prisma;
        this.autoJournal = autoJournal;
    }
    /**
     * Valid invoice status transitions (state machine)
     */
    VALID_TRANSITIONS = {
        draft: ['created', 'sent', 'voided'],
        created: ['sent', 'voided'],
        sent: ['partial', 'paid', 'overdue', 'voided'],
        partial: ['paid', 'overdue', 'voided'],
        overdue: ['partial', 'paid', 'voided'],
        paid: ['voided'],
        voided: [],
    };
    /**
     * Validate if a status transition is allowed
     */
    isValidTransition(fromStatus, toStatus) {
        const allowedTransitions = this.VALID_TRANSITIONS[fromStatus];
        if (!allowedTransitions)
            return false;
        return allowedTransitions.includes(toStatus);
    }
    /**
     * Transform Invoice data to ensure proper serialization of dates and amounts
     */
    transformInvoice(invoice) {
        return {
            ...invoice,
            date: invoice.date ? invoice.date.toISOString() : null,
            dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
            subtotal: invoice.subtotal ? Number(invoice.subtotal) : 0,
            taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : 0,
            total: invoice.total ? Number(invoice.total) : 0,
            amountPaid: invoice.amountPaid ? Number(invoice.amountPaid) : 0,
            exchangeRate: invoice.exchangeRate ? Number(invoice.exchangeRate) : 1,
            lines: invoice.lines?.map((line) => ({
                ...line,
                quantity: line.quantity ? Number(line.quantity) : 0,
                unitPrice: line.unitPrice ? Number(line.unitPrice) : 0,
                taxRate: line.taxRate ? Number(line.taxRate) : 0,
                total: line.total ? Number(line.total) : 0,
            })),
            payments: invoice.payments?.map((payment) => ({
                ...payment,
                date: payment.date ? payment.date.toISOString() : null,
                amount: payment.amount ? Number(payment.amount) : 0,
            })),
        };
    }
    async findAll(organizationId, status, page = 1, pageSize = 25) {
        const where = { organizationId, ...(status ? { status } : {}) };
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: { contact: true, lines: true },
                orderBy: { date: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return {
            data: data.map((invoice) => this.transformInvoice(invoice)),
            total,
            page: p,
            pageSize: ps,
            totalPages: Math.ceil(total / ps),
        };
    }
    async findOne(id, organizationId) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, organizationId },
            include: {
                contact: true,
                lines: { include: { account: true, product: true } },
                payments: true,
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        return this.transformInvoice(invoice);
    }
    async create(organizationId, data) {
        const count = await this.prisma.invoice.count({ where: { organizationId } });
        const number = `INV-${String(count + 1).padStart(6, '0')}`;
        const lines = data.lines.map((l) => ({
            ...l,
            taxRate: l.taxRate || 0,
            total: l.quantity * l.unitPrice * (1 + (l.taxRate || 0)),
        }));
        const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
        const taxAmount = lines.reduce((s, l) => s + l.quantity * l.unitPrice * l.taxRate, 0);
        const total = subtotal + taxAmount;
        const invoice = await this.prisma.invoice.create({
            data: {
                organizationId,
                number,
                contactId: data.contactId,
                date: data.date,
                dueDate: data.dueDate,
                currency: data.currency || 'USD',
                notes: data.notes,
                subtotal,
                taxAmount,
                total,
                lines: { create: lines },
            },
            include: { contact: true, lines: true },
        });
        return this.transformInvoice(invoice);
    }
    async updateStatus(id, organizationId, status, userId) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, organizationId },
        });
        if (!invoice)
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        // Validate status transition
        if (invoice.status !== status && !this.isValidTransition(invoice.status, status)) {
            throw new common_1.BadRequestException(`Invalid status transition: cannot change from "${invoice.status}" to "${status}"`);
        }
        // Update invoice status and log the change in a transaction
        const [updatedInvoice] = await this.prisma.$transaction([
            this.prisma.invoice.update({
                where: { id },
                data: { status },
                include: { contact: true, lines: true },
            }),
            this.prisma.invoiceAuditLog.create({
                data: {
                    invoiceId: id,
                    fromStatus: invoice.status,
                    toStatus: status,
                    changedByUserId: userId,
                },
            }),
        ]);
        // Trigger auto-journal for the status transition (fire-and-forget; errors are non-fatal)
        this.autoJournal
            .onInvoiceStatusChange(id, organizationId, invoice.status, status, userId)
            .catch(() => {
            // Auto-journal failures are logged but do not roll back the status update
        });
        return this.transformInvoice(updatedInvoice);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient,
        auto_journal_service_1.AutoJournalService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map