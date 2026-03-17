import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ActivitiesService } from './activities.service';

@ApiTags('crm/activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activities with optional filters' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: string,
    @Query('contactId') contactId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.activities.findAll(user.organizationId, type, contactId, page, pageSize);
  }

  @Get('timeline/:contactId')
  @ApiOperation({ summary: 'Get interaction timeline for a contact' })
  getTimeline(@Param('contactId') contactId: string) {
    return this.activities.getTimeline(contactId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activities.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Log a new activity' })
  create(@Body() body: { contactId: string; type: string; subject: string; description?: string; dueDate?: string }) {
    return this.activities.create({ ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { type?: string; subject?: string; description?: string; dueDate?: string }) {
    return this.activities.update(id, { ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined });
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark an activity as completed' })
  complete(@Param('id') id: string) {
    return this.activities.complete(id);
  }
}
