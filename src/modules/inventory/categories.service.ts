import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.productCategory.findMany({
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { children: true, products: { take: 10 } },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(data: { name: string; parentId?: string }) {
    if (data.parentId) {
      const parent = await this.prisma.productCategory.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new NotFoundException(`Parent category ${data.parentId} not found`);
    }
    return this.prisma.productCategory.create({ data, include: { parent: true } });
  }

  async update(id: string, data: Partial<{ name: string; parentId: string }>) {
    await this.findOne(id);
    return this.prisma.productCategory.update({ where: { id }, data });
  }
}
