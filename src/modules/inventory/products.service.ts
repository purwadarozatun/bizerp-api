import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string, search?: string, page = 1, pageSize = 25) {
    const where = {
      organizationId,
      isActive: true,
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { sku: { contains: search, mode: 'insensitive' as const } }] } : {}),
    };
    const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
    const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
    const skip = (p - 1) * ps;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ where, include: { stockLevels: { include: { warehouse: true } } }, skip, take: ps, orderBy: { name: 'asc' } }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, organizationId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId },
      include: { stockLevels: { include: { warehouse: true } }, category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async create(organizationId: string, data: { sku: string; name: string; description?: string; categoryId?: string; unitOfMeasure?: string; costPrice?: number; salePrice?: number; reorderPoint?: number; trackInventory?: boolean }) {
    return this.prisma.product.create({ data: { ...data, organizationId }, include: { category: true } });
  }

  async update(id: string, organizationId: string, data: Partial<{ name: string; description: string; costPrice: number; salePrice: number; reorderPoint: number; isActive: boolean }>) {
    await this.findOne(id, organizationId);
    return this.prisma.product.update({ where: { id }, data });
  }
}
