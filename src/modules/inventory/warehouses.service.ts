import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(organizationId: string) {
    return this.prisma.warehouse.findMany({
      where: { organizationId, isActive: true },
      include: {
        _count: { select: { stockLevels: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, organizationId },
      include: {
        stockLevels: {
          include: { product: true },
          where: { quantity: { gt: 0 } },
        },
      },
    });
    if (!warehouse) throw new NotFoundException(`Warehouse ${id} not found`);
    return warehouse;
  }

  async create(
    organizationId: string,
    data: { name: string; code: string; address?: Prisma.InputJsonValue },
  ) {
    return this.prisma.warehouse.create({
      data: { ...data, organizationId },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{ name: string; address: Prisma.InputJsonValue; isActive: boolean }>,
  ) {
    await this.findOne(id, organizationId);
    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }
}
