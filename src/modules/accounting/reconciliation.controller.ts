import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ReconciliationService } from './reconciliation.service';

@ApiTags('accounting/reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get()
  @ApiOperation({ summary: 'List reconciliation records with filters and pagination' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('documentType') documentType?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('amountMin') amountMin?: string,
    @Query('amountMax') amountMax?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<unknown> {
    return this.reconciliationService.findAll(user.organizationId, {
      documentType,
      status,
      dateFrom,
      dateTo,
      amountMin: amountMin !== undefined ? Number(amountMin) : undefined,
      amountMax: amountMax !== undefined ? Number(amountMax) : undefined,
      page: page !== undefined ? Number(page) : undefined,
      pageSize: pageSize !== undefined ? Number(pageSize) : undefined,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get reconciliation summary totals' })
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.reconciliationService.getSummary(user.organizationId);
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get reconciliation status for a specific document' })
  getDocumentStatus(
    @Param('documentId') documentId: string,
    @CurrentUser() user: JwtPayload,
    @Query('documentType') documentType: 'INVOICE' | 'BILL',
  ) {
    return this.reconciliationService.getDocumentReconciliationStatus(
      documentId,
      documentType,
      user.organizationId,
    );
  }

  @Post(':documentId/flag')
  @ApiOperation({ summary: 'Flag a document reconciliation discrepancy' })
  flagDiscrepancy(
    @Param('documentId') documentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { documentType?: string; note?: string; reason?: string },
  ) {
    return this.reconciliationService.flagDiscrepancy(
      documentId,
      body.documentType,
      user.organizationId,
      body.note || body.reason || '',
      user.sub,
      user.role,
    );
  }
}
