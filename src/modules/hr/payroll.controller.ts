import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PayrollService } from './payroll.service';

@ApiTags('hr/payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/payroll')
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: number) {
    return this.payroll.findAll(user.organizationId, page);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: { period: string; startDate: string; endDate: string; payDate: string; currency?: string }) {
    return this.payroll.create(user.organizationId, { ...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate), payDate: new Date(body.payDate) });
  }

  @Patch(':id/process')
  process(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.payroll.process(id, user.organizationId);
  }
}
