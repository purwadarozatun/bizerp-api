import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { BillsService } from './bills.service';

@ApiTags('accounting/bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/bills')
export class BillsController {
  constructor(private readonly bills: BillsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.bills.findAll(user.organizationId, status, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.bills.findOne(id, user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: { contactId: string; date: string; dueDate: string; currency?: string; notes?: string; lines: Array<{ accountId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }> }) {
    return this.bills.create(user.organizationId, { ...body, date: new Date(body.date), dueDate: new Date(body.dueDate) });
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { status: string }) {
    return this.bills.updateStatus(id, user.organizationId, body.status);
  }
}
