import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { InventoryReportsService, ValuationMethod } from './inventory-reports.service';

@ApiTags('inventory/reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/reports')
export class InventoryReportsController {
  constructor(private readonly reports: InventoryReportsService) {}

  @Get('stock')
  @ApiOperation({ summary: 'Stock levels report by product and warehouse' })
  getStockReport(@CurrentUser() user: JwtPayload) {
    return this.reports.getStockReport(user.organizationId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Products below reorder point' })
  getLowStockReport(@CurrentUser() user: JwtPayload) {
    return this.reports.getLowStockReport(user.organizationId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Stock movement history' })
  getMovementHistory(
    @CurrentUser() user: JwtPayload,
    @Query('productId') productId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.reports.getMovementHistory(
      user.organizationId,
      productId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      pageSize,
    );
  }

  @Get('valuation')
  @ApiOperation({ summary: 'Inventory valuation report (FIFO, LIFO, or average cost)' })
  getValuation(@CurrentUser() user: JwtPayload, @Query('method') method?: ValuationMethod) {
    return this.reports.getValuation(user.organizationId, method || 'average');
  }
}
