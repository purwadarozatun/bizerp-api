import { Controller, Get, Param, Query, Res, UseGuards, Header } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PaystubService } from './paystub.service';

@ApiTags('hr/paystubs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/paystubs')
export class PaystubController {
  constructor(private readonly paystubs: PaystubService) {}

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'List pay stubs for an employee' })
  listByEmployee(@Param('employeeId') employeeId: string, @CurrentUser() user: JwtPayload) {
    return this.paystubs.listByEmployee(employeeId, user.organizationId);
  }

  @Get(':payrollId/employee/:employeeId')
  @ApiOperation({ summary: 'Get pay stub data' })
  getPaystub(@Param('payrollId') payrollId: string, @Param('employeeId') employeeId: string, @CurrentUser() user: JwtPayload) {
    return this.paystubs.getPaystub(payrollId, employeeId, user.organizationId);
  }

  @Get(':payrollId/employee/:employeeId/html')
  @ApiOperation({ summary: 'Get pay stub as HTML (printable)' })
  @Header('Content-Type', 'text/html')
  async getPaystubHtml(
    @Param('payrollId') payrollId: string,
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const html = await this.paystubs.generateHtml(payrollId, employeeId, user.organizationId);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
