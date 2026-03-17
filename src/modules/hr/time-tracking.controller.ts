import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { TimeTrackingService } from './time-tracking.service';

@ApiTags('hr/time')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/time')
export class TimeTrackingController {
  constructor(private readonly time: TimeTrackingService) {}

  @Get()
  @ApiOperation({ summary: 'List time entries' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.time.findAll(
      user.organizationId,
      employeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      pageSize,
    );
  }

  @Get('summary/:employeeId')
  @ApiOperation({ summary: 'Monthly time summary for an employee' })
  getSummary(
    @CurrentUser() user: JwtPayload,
    @Param('employeeId') employeeId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.time.getSummary(user.organizationId, employeeId, year, month);
  }

  @Post()
  @ApiOperation({ summary: 'Log a time entry' })
  create(@Body() body: { employeeId: string; date: string; hours: number; description?: string }) {
    return this.time.create({ ...body, date: new Date(body.date) });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { hours?: number; description?: string; date?: string }) {
    return this.time.update(id, { ...body, date: body.date ? new Date(body.date) : undefined });
  }
}
