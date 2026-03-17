import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ContactsService } from './contacts.service';

@ApiTags('crm/contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('search') search?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.contacts.findAll(user.organizationId, search, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contacts.findOne(id, user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: { type?: string; firstName?: string; lastName?: string; company?: string; email?: string; phone?: string; isCustomer?: boolean; isVendor?: boolean }) {
    return this.contacts.create(user.organizationId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { firstName?: string; lastName?: string; company?: string; email?: string; phone?: string }) {
    return this.contacts.update(id, user.organizationId, body);
  }

  @Post(':id/activities')
  logActivity(@Param('id') contactId: string, @Body() body: { type: string; subject: string; description?: string; dueDate?: string }) {
    return this.contacts.logActivity(contactId, { ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined });
  }
}
