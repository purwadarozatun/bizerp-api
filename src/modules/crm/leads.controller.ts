import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { LeadsService } from './leads.service';

@ApiTags('crm/leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads' })
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.leads.findAll(user.organizationId, status, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leads.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a lead' })
  create(@Body() body: { contactId: string; title: string; source?: string; value?: number; notes?: string }) {
    return this.leads.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; status?: string; source?: string; value?: number; notes?: string }) {
    return this.leads.update(id, body);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to opportunity' })
  convert(@Param('id') id: string) {
    return this.leads.convertToOpportunity(id);
  }
}
