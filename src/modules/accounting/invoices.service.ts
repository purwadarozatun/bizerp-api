import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaClient) {}

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
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
      include: { contact: true, lines: { include: { account: true, product: true } }, payments: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async create(organizationId: string, data: {
    contactId: string;
    date: Date;
    dueDate: Date;
    currency?: string;
    notes?: string;
    lines: Array<{ accountId?: string; productId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }>;
  }) {
    const count = await this.prisma.invoice.count({ where: { organizationId } });
    const number = `INV-${String(count + 1).padStart(6, '0')}`;

    const lines = data.lines.map(l => ({
      ...l,
      taxRate: l.taxRate || 0,
      total: l.quantity * l.unitPrice * (1 + (l.taxRate || 0)),
    }));
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    const taxAmount = lines.reduce((s, l) => s + l.quantity * l.unitPrice * l.taxRate, 0);
    const total = subtotal + taxAmount;

    return this.prisma.invoice.create({
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
  }

  async updateStatus(id: string, organizationId: string, status: string) {
    await this.findOne(id, organizationId);
    return this.prisma.invoice.update({ where: { id }, data: { status } });
  }
}
