import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';

@ApiTags('accounting/invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.invoices.findAll(user.organizationId, status, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoices.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an invoice' })
  create(@CurrentUser() user: JwtPayload, @Body() body: { contactId: string; date: string; dueDate: string; currency?: string; notes?: string; lines: Array<{ accountId?: string; productId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }> }) {
    return this.invoices.create(user.organizationId, { ...body, date: new Date(body.date), dueDate: new Date(body.dueDate) });
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { status: string }) {
    return this.invoices.updateStatus(id, user.organizationId, body.status);
  }
}
