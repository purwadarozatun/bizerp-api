import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Invoice, InvoiceLine } from '@bis/database';
import { Decimal } from '@prisma/client/runtime/library';
import { AutoJournalService } from './auto-journal.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly autoJournal: AutoJournalService,
  ) {}

  /**
   * Valid invoice status transitions (state machine)
   */
  private readonly VALID_TRANSITIONS: Record<string, string[]> = {
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
  private isValidTransition(fromStatus: string, toStatus: string): boolean {
    const allowedTransitions = this.VALID_TRANSITIONS[fromStatus];
    if (!allowedTransitions) return false;
    return allowedTransitions.includes(toStatus);
  }

  /**
   * Transform Invoice data to ensure proper serialization of dates and amounts
   */
  private transformInvoice(invoice: any): any {
    return {
      ...invoice,
      date: invoice.date ? invoice.date.toISOString() : null,
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      subtotal: invoice.subtotal ? Number(invoice.subtotal) : 0,
      taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : 0,
      total: invoice.total ? Number(invoice.total) : 0,
      amountPaid: invoice.amountPaid ? Number(invoice.amountPaid) : 0,
      exchangeRate: invoice.exchangeRate ? Number(invoice.exchangeRate) : 1,
      lines: invoice.lines?.map((line: any) => ({
        ...line,
        quantity: line.quantity ? Number(line.quantity) : 0,
        unitPrice: line.unitPrice ? Number(line.unitPrice) : 0,
        taxRate: line.taxRate ? Number(line.taxRate) : 0,
        total: line.total ? Number(line.total) : 0,
      })),
      payments: invoice.payments?.map((payment: any) => ({
        ...payment,
        date: payment.date ? payment.date.toISOString() : null,
        amount: payment.amount ? Number(payment.amount) : 0,
      })),
    };
  }

  async findAll(organizationId: string, status?: string, page = 1, pageSize = 25) {
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

  async findOne(id: string, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        contact: true,
        lines: { include: { account: true, product: true } },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return this.transformInvoice(invoice);
  }

  async create(
    organizationId: string,
    data: {
      contactId: string;
      date: Date;
      dueDate: Date;
      currency?: string;
      notes?: string;
      lines: Array<{
        accountId?: string;
        productId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
      }>;
    },
  ) {
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

  async updateStatus(id: string, organizationId: string, status: string, userId?: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
    });

    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);

    // Validate status transition
    if (invoice.status !== status && !this.isValidTransition(invoice.status, status)) {
      throw new BadRequestException(
        `Invalid status transition: cannot change from "${invoice.status}" to "${status}"`,
      );
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
}
