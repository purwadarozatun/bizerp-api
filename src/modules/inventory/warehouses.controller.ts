import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { WarehousesService } from './warehouses.service';

@ApiTags('inventory/warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/warehouses')
export class WarehousesController {
  constructor(private readonly warehouses: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'List warehouses' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.warehouses.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.warehouses.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a warehouse' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { name: string; code: string; address?: Prisma.InputJsonValue },
  ) {
    return this.warehouses.create(user.organizationId, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { name?: string; address?: Prisma.InputJsonValue; isActive?: boolean },
  ) {
    return this.warehouses.update(id, user.organizationId, body);
  }
}
