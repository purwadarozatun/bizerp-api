import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@ApiTags('accounting/reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('profit-and-loss')
  @ApiOperation({ summary: 'Profit & Loss statement' })
  @ApiQuery({ name: 'from', example: '2026-01-01' })
  @ApiQuery({ name: 'to', example: '2026-12-31' })
  profitAndLoss(
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reports.getProfitAndLoss(user.organizationId, new Date(from), new Date(to));
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Balance Sheet as of a date' })
  @ApiQuery({ name: 'asOf', required: false, example: '2026-12-31' })
  balanceSheet(@CurrentUser() user: JwtPayload, @Query('asOf') asOf?: string) {
    return this.reports.getBalanceSheet(user.organizationId, asOf ? new Date(asOf) : new Date());
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Cash Flow statement (indirect method)' })
  @ApiQuery({ name: 'from', example: '2026-01-01' })
  @ApiQuery({ name: 'to', example: '2026-12-31' })
  cashFlow(
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reports.getCashFlow(user.organizationId, new Date(from), new Date(to));
  }

  @Get('ar-aging')
  @ApiOperation({ summary: 'Accounts Receivable aging report' })
  @ApiQuery({ name: 'asOf', required: false })
  arAging(@CurrentUser() user: JwtPayload, @Query('asOf') asOf?: string) {
    return this.reports.getArAging(user.organizationId, asOf ? new Date(asOf) : undefined);
  }

  @Get('ap-aging')
  @ApiOperation({ summary: 'Accounts Payable aging report' })
  @ApiQuery({ name: 'asOf', required: false })
  apAging(@CurrentUser() user: JwtPayload, @Query('asOf') asOf?: string) {
    return this.reports.getApAging(user.organizationId, asOf ? new Date(asOf) : undefined);
  }
}
