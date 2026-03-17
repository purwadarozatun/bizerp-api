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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
const shared_1 = require("@bis/shared");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async payInvoice(invoiceId, organizationId, dto) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: invoiceId, organizationId },
        });
        if (!invoice)
            throw new common_1.NotFoundException(`Invoice ${invoiceId} not found`);
        if (invoice.status === 'voided')
            throw new common_1.BadRequestException('Cannot pay a voided invoice');
        if (invoice.status === 'paid')
            throw new common_1.BadRequestException('Invoice is already fully paid');
        const remaining = (0, shared_1.roundMoney)(Number(invoice.total) - Number(invoice.amountPaid));
        if (dto.amount > remaining + 0.01) {
            throw new common_1.BadRequestException(`Payment amount ${dto.amount} exceeds remaining balance ${remaining}`);
        }
        const payment = await this.prisma.payment.create({
            data: { invoiceId, ...dto },
        });
        const newAmountPaid = (0, shared_1.roundMoney)(Number(invoice.amountPaid) + dto.amount);
        const newStatus = newAmountPaid >= Number(invoice.total) - 0.001 ? 'paid' : 'partial';
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { amountPaid: newAmountPaid, status: newStatus },
        });
        return payment;
    }
    async payBill(billId, organizationId, dto) {
        const bill = await this.prisma.bill.findFirst({
            where: { id: billId, organizationId },
        });
        if (!bill)
            throw new common_1.NotFoundException(`Bill ${billId} not found`);
        if (bill.status === 'voided')
            throw new common_1.BadRequestException('Cannot pay a voided bill');
        if (bill.status === 'paid')
            throw new common_1.BadRequestException('Bill is already fully paid');
        const remaining = (0, shared_1.roundMoney)(Number(bill.total) - Number(bill.amountPaid));
        if (dto.amount > remaining + 0.01) {
            throw new common_1.BadRequestException(`Payment amount ${dto.amount} exceeds remaining balance ${remaining}`);
        }
        const payment = await this.prisma.payment.create({
            data: { billId, ...dto },
        });
        const newAmountPaid = (0, shared_1.roundMoney)(Number(bill.amountPaid) + dto.amount);
        const newStatus = newAmountPaid >= Number(bill.total) - 0.001 ? 'paid' : 'partial';
        await this.prisma.bill.update({
            where: { id: billId },
            data: { amountPaid: newAmountPaid, status: newStatus },
        });
        return payment;
    }
    async getInvoicePayments(invoiceId, organizationId) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, organizationId } });
        if (!invoice)
            throw new common_1.NotFoundException(`Invoice ${invoiceId} not found`);
        return this.prisma.payment.findMany({ where: { invoiceId }, orderBy: { date: 'desc' } });
    }
    async getBillPayments(billId, organizationId) {
        const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
        if (!bill)
            throw new common_1.NotFoundException(`Bill ${billId} not found`);
        return this.prisma.payment.findMany({ where: { billId }, orderBy: { date: 'desc' } });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map