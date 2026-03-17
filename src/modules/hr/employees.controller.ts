import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { EmployeesService } from './employees.service';

@ApiTags('hr/employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('search') search?: string, @Query('page') page?: number) {
    return this.employees.findAll(user.organizationId, search, page);
  }

  @Get('org-chart')
  getOrgChart(@CurrentUser() user: JwtPayload) {
    return this.employees.getOrgChart(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.employees.findOne(id, user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: { employeeNumber?: string; firstName: string; lastName: string; email: string; hireDate: string; jobTitle?: string; position?: string; department?: string; employmentType: string; baseSalary?: number; salary?: number; payPeriod?: string }) {
    const { position, salary, jobTitle: jt, baseSalary: bs, employeeNumber: en, hireDate, ...rest } = body;
    return this.employees.create(user.organizationId, {
      ...rest,
      jobTitle: jt ?? position ?? '',
      baseSalary: bs ?? salary,
      employeeNumber: en ?? `EMP-${Date.now()}`,
      hireDate: new Date(hireDate),
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { firstName?: string; lastName?: string; jobTitle?: string; department?: string; baseSalary?: number; status?: string }) {
    return this.employees.update(id, user.organizationId, body);
  }
}
