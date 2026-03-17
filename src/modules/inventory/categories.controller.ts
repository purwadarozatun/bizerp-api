import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';

@ApiTags('inventory/categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List product categories (top-level with children)' })
  findAll() {
    return this.categories.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categories.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product category' })
  create(@Body() body: { name: string; parentId?: string }) {
    return this.categories.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; parentId?: string }) {
    return this.categories.update(id, body);
  }
}
