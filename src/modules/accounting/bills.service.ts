import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@bis/database';
import { BillExpenseService } from './bill-expense.service';
import { AutoJournalService } from './auto-journal.service';

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_approval'],
  pending_approval: ['approved', 'rejected'],
  approved: ['paid'],
  rejected: ['pending_approval'], // can be re-submitted
  paid: [], // locked
};

const VALID_STATUSES = ['draft', 'pending_approval', 'approved', 'paid', 'rejected'];

@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly billExpense: BillExpenseService,
    private readonly autoJournal: AutoJournalService,
  ) {}

  async findAll(
    organizationId: string,
    status?: string,
    vendor?: string,
    dateFrom?: string,
    dateTo?: string,
    page = 1,
    pageSize = 25,
    sortBy?: string,
    sortDir?: string,
  ) {
    const where: Record<string, unknown> = { organizationId };
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
      if (dateFrom) (where['date'] as Record<string, unknown>)['gte'] = new Date(dateFrom);
      if (dateTo) (where['date'] as Record<string, unknown>)['lte'] = new Date(dateTo);
    }

    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;

    // Build orderBy
    const allowedSortKeys = ['number', 'date', 'dueDate', 'total', 'createdAt'];
    const key = allowedSortKeys.includes(sortBy ?? '') ? sortBy : 'date';
    const dir = sortDir === 'asc' ? 'asc' : 'desc';
    const orderBy = [{ [key as string]: dir }];

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

  async findOne(id: string, organizationId: string) {
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
    if (!bill) throw new NotFoundException(`Bill ${id} not found`);
    return bill;
  }

  async create(
    organizationId: string,
    data: {
      contactId: string;
      date: Date;
      dueDate: Date;
      currency?: string;
      expenseCategory?: string;
      referenceNo?: string;
      notes?: string;
      lines: Array<{
        accountId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
      }>;
    },
  ) {
    if (!data.lines || data.lines.length === 0) {
      throw new BadRequestException('At least one line item is required');
    }

    const count = await this.prisma.bill.count({ where: { organizationId } });
    const number = `BILL-${String(count + 1).padStart(6, '0')}`;

    const lines = data.lines.map((l) => ({
      ...l,
      taxRate: l.taxRate || 0,
      total: l.quantity * l.unitPrice * (1 + (l.taxRate || 0) / 100),
    }));
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    const taxAmount = lines.reduce(
      (s, l) => s + l.quantity * l.unitPrice * ((l.taxRate || 0) / 100),
      0,
    );
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

  async update(
    id: string,
    organizationId: string,
    data: {
      contactId?: string;
      date?: Date;
      dueDate?: Date;
      currency?: string;
      expenseCategory?: string;
      referenceNo?: string;
      notes?: string;
      lines?: Array<{
        accountId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
      }>;
    },
  ) {
    const bill = await this.findOne(id, organizationId);
    if (bill.status !== 'draft' && bill.status !== 'rejected') {
      throw new ForbiddenException('Only draft or rejected bills can be edited');
    }

    const updateData: Record<string, unknown> = {};
    if (data.contactId) updateData['contactId'] = data.contactId;
    if (data.date) updateData['date'] = data.date;
    if (data.dueDate) updateData['dueDate'] = data.dueDate;
    if (data.currency) updateData['currency'] = data.currency;
    if (data.expenseCategory !== undefined) updateData['expenseCategory'] = data.expenseCategory;
    if (data.referenceNo !== undefined) updateData['referenceNo'] = data.referenceNo;
    if (data.notes !== undefined) updateData['notes'] = data.notes;

    if (data.lines) {
      const lines = data.lines.map((l) => ({
        ...l,
        taxRate: l.taxRate || 0,
        total: l.quantity * l.unitPrice * (1 + (l.taxRate || 0) / 100),
      }));
      const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
      const taxAmount = lines.reduce(
        (s, l) => s + l.quantity * l.unitPrice * ((l.taxRate || 0) / 100),
        0,
      );
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
      data: updateData as Parameters<typeof this.prisma.bill.update>[0]['data'],
      include: { contact: true, lines: true },
    });
  }

  async submitForApproval(id: string, organizationId: string, actorId?: string) {
    const bill = await this.findOne(id, organizationId);
    this.validateTransition(bill.status, 'pending_approval');

    if (!bill.lines || bill.lines.length === 0) {
      throw new BadRequestException('Bill must have at least one line item before submitting');
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

  async approve(id: string, organizationId: string, actorId?: string) {
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
      .catch(() => {});

    return updated;
  }

  async reject(id: string, organizationId: string, reason: string, actorId?: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
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
      .catch(() => {});

    return updated;
  }

  async markAsPaid(
    id: string,
    organizationId: string,
    payment: {
      paymentDate: Date;
      paymentMethod: string;
      reference?: string;
      notes?: string;
    },
    actorId?: string,
  ) {
    const bill = await this.findOne(id, organizationId);
    this.validateTransition(bill.status, 'paid');

    const validMethods = ['bank_transfer', 'cash', 'cheque', 'other'];
    if (!validMethods.includes(payment.paymentMethod)) {
      throw new BadRequestException(
        `Invalid payment method. Must be one of: ${validMethods.join(', ')}`,
      );
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
      .catch(() => {});

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const bill = await this.findOne(id, organizationId);
    if (bill.status !== 'draft') {
      throw new ForbiddenException('Only draft bills can be deleted');
    }
    // BIS-82: void expense entry if one exists (shouldn't for draft, but safe)
    await this.billExpense.onVoided(id, 'Bill deleted');
    return this.prisma.bill.delete({ where: { id } });
  }

  async updateStatus(id: string, organizationId: string, status: string) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const bill = await this.findOne(id, organizationId);
    this.validateTransition(bill.status, status);
    return this.prisma.bill.update({ where: { id }, data: { status } });
  }

  private validateTransition(from: string, to: string) {
    const allowed = STATUS_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Cannot transition bill from '${from}' to '${to}'. Allowed transitions from '${from}': ${allowed.join(', ') || 'none'}`,
      );
    }
  }
}
