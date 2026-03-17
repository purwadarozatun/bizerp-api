import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { StockService } from './stock.service';

@ApiTags('inventory/stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Get()
  getStockLevels(@CurrentUser() user: JwtPayload) {
    return this.stock.getStockLevels(user.organizationId);
  }

  @Get('low-stock')
  getLowStock(@CurrentUser() user: JwtPayload) {
    return this.stock.getLowStock(user.organizationId);
  }

  @Post('adjust')
  adjustStock(@Body() body: { productId: string; warehouseId: string; quantity: number; type: string; reference?: string; notes?: string; unitCost?: number }) {
    return this.stock.adjustStock(body);
  }

  @Get('movements/:productId')
  getMovements(@Param('productId') productId: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.stock.getMovements(productId, page, pageSize);
  }
}
