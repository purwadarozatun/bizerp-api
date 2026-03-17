import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get executive KPI dashboard data' })
  getKpis(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getKpis(user.organizationId);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get revenue/expense trends (last N months)' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  getTrends(@CurrentUser() user: JwtPayload, @Query('months') months?: string) {
    return this.dashboard.getTrends(user.organizationId, months ? parseInt(months, 10) : 6);
  }

  @Get('reports/income-statement')
  @ApiOperation({ summary: 'Income statement (P&L) for a date range' })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  getIncomeStatement(
    @CurrentUser() user: JwtPayload,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const now = new Date();
    const startDate = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = end ? new Date(end) : now;
    return this.dashboard.getIncomeStatement(user.organizationId, startDate, endDate);
  }

  @Get('reports/inventory')
  @ApiOperation({ summary: 'Inventory summary report' })
  getInventorySummary(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getInventorySummary(user.organizationId);
  }

  @Get('reports/hr')
  @ApiOperation({ summary: 'HR summary report' })
  getHrSummary(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getHrSummary(user.organizationId);
  }

  @Get('reports/crm-pipeline')
  @ApiOperation({ summary: 'CRM pipeline by stage' })
  getCrmPipeline(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getCrmPipeline(user.organizationId);
  }

  @Get('export/:report')
  @ApiOperation({ summary: 'Export report as CSV' })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Param('report') report: string,
    @Res() res: Response,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const now = new Date();
    const startDate = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = end ? new Date(end) : now;
    const csv = await this.dashboard.exportCsv(user.organizationId, report, startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report}.csv"`);
    res.send(csv);
  }
}
