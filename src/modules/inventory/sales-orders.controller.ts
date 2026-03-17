import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { SalesOrdersService } from './sales-orders.service';

@ApiTags('inventory/sales-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/sales-orders')
export class SalesOrdersController {
  constructor(private readonly sos: SalesOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List sales orders' })
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.sos.findAll(user.organizationId, status, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.sos.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a sales order' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { contactId: string; date: string; currency?: string; notes?: string; lines: Array<{ productId: string; description?: string; quantity: number; unitPrice: number }> },
  ) {
    return this.sos.create(user.organizationId, { ...body, date: new Date(body.date) });
  }

  @Post(':id/fulfill')
  @ApiOperation({ summary: 'Fulfill a sales order (ship goods from warehouse)' })
  fulfill(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { warehouseId: string; fulfillments: Array<{ lineId: string; quantity: number }> },
  ) {
    return this.sos.fulfill(id, user.organizationId, body.warehouseId, body.fulfillments);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update sales order status' })
  updateStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { status: string }) {
    return this.sos.updateStatus(id, user.organizationId, body.status);
  }
}
