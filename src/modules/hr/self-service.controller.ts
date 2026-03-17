import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { SelfServiceService } from './self-service.service';

@ApiTags('hr/self-service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/self-service')
export class SelfServiceController {
  constructor(private readonly selfService: SelfServiceService) {}

  @Get(':employeeId/profile')
  @ApiOperation({ summary: 'Get own employee profile (self-service)' })
  getProfile(@Param('employeeId') employeeId: string, @CurrentUser() user: JwtPayload) {
    return this.selfService.getMyProfile(employeeId, user.organizationId);
  }

  @Patch(':employeeId/profile')
  @ApiOperation({ summary: 'Update contact info (phone, address)' })
  updateProfile(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { phone?: string; address?: Prisma.InputJsonValue },
  ) {
    return this.selfService.updateMyProfile(employeeId, user.organizationId, body);
  }

  @Get(':employeeId/leave')
  @ApiOperation({ summary: 'My leave requests' })
  getLeaveRequests(
    @Param('employeeId') employeeId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.selfService.getMyLeaveRequests(employeeId, page, pageSize);
  }

  @Get(':employeeId/leave/balance')
  @ApiOperation({ summary: 'My leave balances for the current year' })
  getLeaveBalance(@Param('employeeId') employeeId: string) {
    return this.selfService.getLeaveBalance(employeeId);
  }

  @Get(':employeeId/time')
  @ApiOperation({ summary: 'My time entries for a given month' })
  getTimeEntries(
    @Param('employeeId') employeeId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.selfService.getMyTimeEntries(employeeId, year, month);
  }
}
