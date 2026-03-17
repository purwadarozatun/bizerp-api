import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { LeaveService } from './leave.service';

@ApiTags('hr/leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/leave')
export class LeaveController {
  constructor(private readonly leave: LeaveService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string, @Query('page') page?: number) {
    return this.leave.findAll(user.organizationId, status, page);
  }

  @Post()
  create(@Body() body: { employeeId: string; type: string; startDate: string; endDate: string; days: number; reason?: string }) {
    return this.leave.create({ ...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate) });
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.leave.updateStatus(id, 'approved');
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { notes?: string }) {
    return this.leave.updateStatus(id, 'rejected', body.notes);
  }
}
