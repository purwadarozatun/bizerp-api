import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PurchaseOrdersService } from './purchase-orders.service';

@ApiTags('inventory/purchase-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly pos: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.pos.findAll(user.organizationId, status, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.pos.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a purchase order' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { contactId: string; date: string; expectedDate?: string; currency?: string; notes?: string; lines: Array<{ productId: string; description?: string; quantity: number; unitCost: number }> },
  ) {
    return this.pos.create(user.organizationId, {
      ...body,
      date: new Date(body.date),
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : undefined,
    });
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive goods against a purchase order' })
  receive(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { warehouseId: string; receipts: Array<{ lineId: string; quantity: number }> },
  ) {
    return this.pos.receive(id, user.organizationId, body.warehouseId, body.receipts);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  updateStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { status: string }) {
    return this.pos.updateStatus(id, user.organizationId, body.status);
  }
}
