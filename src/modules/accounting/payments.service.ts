import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';
import { roundMoney } from '@bis/shared';

interface RecordPaymentDto {
  date: Date;
  amount: number;
  currency: string;
  method: string;
  reference?: string;
  notes?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaClient) {}

  async payInvoice(invoiceId: string, organizationId: string, dto: RecordPaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    if (invoice.status === 'voided') throw new BadRequestException('Cannot pay a voided invoice');
    if (invoice.status === 'paid') throw new BadRequestException('Invoice is already fully paid');

    const remaining = roundMoney(Number(invoice.total) - Number(invoice.amountPaid));
    if (dto.amount > remaining + 0.01) {
      throw new BadRequestException(`Payment amount ${dto.amount} exceeds remaining balance ${remaining}`);
    }

    const payment = await this.prisma.payment.create({
      data: { invoiceId, ...dto },
    });

    const newAmountPaid = roundMoney(Number(invoice.amountPaid) + dto.amount);
    const newStatus = newAmountPaid >= Number(invoice.total) - 0.001 ? 'paid' : 'partial';

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { amountPaid: newAmountPaid, status: newStatus },
    });

    return payment;
  }

  async payBill(billId: string, organizationId: string, dto: RecordPaymentDto) {
    const bill = await this.prisma.bill.findFirst({
      where: { id: billId, organizationId },
    });
    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);
    if (bill.status === 'voided') throw new BadRequestException('Cannot pay a voided bill');
    if (bill.status === 'paid') throw new BadRequestException('Bill is already fully paid');

    const remaining = roundMoney(Number(bill.total) - Number(bill.amountPaid));
    if (dto.amount > remaining + 0.01) {
      throw new BadRequestException(`Payment amount ${dto.amount} exceeds remaining balance ${remaining}`);
    }

    const payment = await this.prisma.payment.create({
      data: { billId, ...dto },
    });

    const newAmountPaid = roundMoney(Number(bill.amountPaid) + dto.amount);
    const newStatus = newAmountPaid >= Number(bill.total) - 0.001 ? 'paid' : 'partial';

    await this.prisma.bill.update({
      where: { id: billId },
      data: { amountPaid: newAmountPaid, status: newStatus },
    });

    return payment;
  }

  async getInvoicePayments(invoiceId: string, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, organizationId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    return this.prisma.payment.findMany({ where: { invoiceId }, orderBy: { date: 'desc' } });
  }

  async getBillPayments(billId: string, organizationId: string) {
    const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);
    return this.prisma.payment.findMany({ where: { billId }, orderBy: { date: 'desc' } });
  }
}
