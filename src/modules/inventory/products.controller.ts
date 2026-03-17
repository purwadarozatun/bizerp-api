import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ConflictException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';

@ApiTags('inventory/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('search') search?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.products.findAll(user.organizationId, search, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.products.findOne(id, user.organizationId);
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() body: { sku: string; name: string; description?: string; unit?: string; unitOfMeasure?: string; costPrice?: number; salePrice?: number; sellingPrice?: number; reorderPoint?: number }) {
    const { unit, sellingPrice, ...rest } = body;
    const mapped = {
      ...rest,
      ...(unit !== undefined ? { unitOfMeasure: unit } : {}),
      ...(sellingPrice !== undefined && rest.salePrice === undefined ? { salePrice: sellingPrice } : {}),
    };
    try {
      return await this.products.create(user.organizationId, mapped);
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ConflictException(`A product with SKU '${body.sku}' already exists`);
      throw err;
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { name?: string; description?: string; costPrice?: number; salePrice?: number; reorderPoint?: number; isActive?: boolean }) {
    return this.products.update(id, user.organizationId, body);
  }
}
