import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JournalsService } from './journals.service';

@ApiTags('accounting/journals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/journals')
export class JournalsController {
  constructor(private readonly journals: JournalsService) {}

  @Get()
  @ApiOperation({ summary: 'List journal entries' })
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.journals.findAll(user.organizationId, page, pageSize);
  }

  @Post()
  @ApiOperation({ summary: 'Create a journal entry' })
  create(@CurrentUser() user: JwtPayload, @Body() body: { date: string; description: string; reference?: string; currency?: string; lines: Array<{ accountId: string; description?: string; debit?: number; credit?: number }> }) {
    return this.journals.create(user.organizationId, { ...body, date: new Date(body.date) });
  }

  @Patch(':id/post')
  @ApiOperation({ summary: 'Post a draft journal entry' })
  post(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.journals.post(id, user.organizationId);
  }

  @Patch(':id/void')
  @ApiOperation({ summary: 'Void a journal entry' })
  void(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.journals.void(id, user.organizationId);
  }
}
