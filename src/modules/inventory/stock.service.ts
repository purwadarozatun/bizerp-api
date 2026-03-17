import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStockLevels(organizationId: string) {
    return this.prisma.stockLevel.findMany({
      where: { product: { organizationId } },
      include: { product: true, warehouse: true },
    });
  }

  async getLowStock(organizationId: string) {
    const levels = await this.prisma.stockLevel.findMany({
      where: { product: { organizationId, trackInventory: true } },
      include: { product: true, warehouse: true },
    });
    return levels.filter(l => Number(l.quantity) <= l.product.reorderPoint);
  }

  async adjustStock(data: { productId: string; warehouseId: string; quantity: number; type: string; reference?: string; notes?: string; unitCost?: number }) {
    await this.prisma.stockMovement.create({ data });

    const current = await this.prisma.stockLevel.upsert({
      where: { productId_warehouseId: { productId: data.productId, warehouseId: data.warehouseId } },
      update: { quantity: { increment: data.quantity } },
      create: { productId: data.productId, warehouseId: data.warehouseId, quantity: data.quantity },
    });

    return current;
  }

  async getMovements(productId: string, page = 1, pageSize = 50) {
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 50;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({ where: { productId }, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
      this.prisma.stockMovement.count({ where: { productId } }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }
}
