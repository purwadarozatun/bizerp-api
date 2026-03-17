import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

interface PurchaseOrderLine {
  productId: string;
  description?: string;
  quantity: number;
  unitCost: number;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, status?: string, page = 1, pageSize = 25) {
    const where = { organizationId, ...(status ? { status } : {}) };
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: { contact: true, lines: { include: { product: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: ps,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, organizationId: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId },
      include: { contact: true, lines: { include: { product: true } } },
    });
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);
    return po;
  }

  async create(organizationId: string, data: { contactId: string; date: Date; expectedDate?: Date; currency?: string; notes?: string; lines: PurchaseOrderLine[] }) {
    const count = await this.prisma.purchaseOrder.count({ where: { organizationId } });
    const number = `PO-${String(count + 1).padStart(6, '0')}`;
    const total = data.lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);

    return this.prisma.purchaseOrder.create({
      data: {
        organizationId,
        number,
        contactId: data.contactId,
        date: data.date,
        expectedDate: data.expectedDate,
        currency: data.currency || 'USD',
        notes: data.notes,
        total,
        lines: {
          create: data.lines.map(l => ({
            productId: l.productId,
            description: l.description,
            quantity: l.quantity,
            unitCost: l.unitCost,
            total: l.quantity * l.unitCost,
          })),
        },
      },
      include: { contact: true, lines: { include: { product: true } } },
    });
  }

  async receive(id: string, organizationId: string, warehouseId: string, receipts: Array<{ lineId: string; quantity: number }>) {
    const po = await this.findOne(id, organizationId);
    if (po.status === 'received') throw new BadRequestException('Purchase order already fully received');

    await this.prisma.$transaction(async (tx) => {
      for (const receipt of receipts) {
        const line = po.lines.find(l => l.id === receipt.lineId);
        if (!line) throw new NotFoundException(`Line ${receipt.lineId} not found`);

        const newReceived = Number(line.received) + receipt.quantity;
        if (newReceived > Number(line.quantity)) {
          throw new BadRequestException(`Cannot receive more than ordered for line ${receipt.lineId}`);
        }

        await tx.purchaseOrderLine.update({
          where: { id: receipt.lineId },
          data: { received: newReceived },
        });

        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            warehouseId,
            type: 'purchase',
            quantity: receipt.quantity,
            unitCost: line.unitCost,
            reference: po.number,
          },
        });

        await tx.stockLevel.upsert({
          where: { productId_warehouseId: { productId: line.productId, warehouseId } },
          update: { quantity: { increment: receipt.quantity } },
          create: { productId: line.productId, warehouseId, quantity: receipt.quantity },
        });
      }

      const updatedLines = await tx.purchaseOrderLine.findMany({ where: { purchaseOrderId: id } });
      const fullyReceived = updatedLines.every(l => Number(l.received) >= Number(l.quantity));
      const partiallyReceived = updatedLines.some(l => Number(l.received) > 0);

      await tx.purchaseOrder.update({
        where: { id },
        data: { status: fullyReceived ? 'received' : partiallyReceived ? 'partial' : po.status },
      });
    });

    return this.findOne(id, organizationId);
  }

  async updateStatus(id: string, organizationId: string, status: string) {
    await this.findOne(id, organizationId);
    const allowed = ['draft', 'submitted', 'approved', 'cancelled'];
    if (!allowed.includes(status)) throw new BadRequestException(`Status ${status} is not valid`);
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status } });
  }
}
