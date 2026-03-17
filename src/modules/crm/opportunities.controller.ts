import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { OpportunitiesService } from './opportunities.service';

@ApiTags('crm/opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/opportunities')
export class OpportunitiesController {
  constructor(private readonly opps: OpportunitiesService) {}

  @Get('pipeline')
  getPipeline(@CurrentUser() user: JwtPayload) {
    return this.opps.getPipeline(user.organizationId);
  }

  @Post()
  create(@Body() body: { contactId: string; title: string; stage?: string; value?: number; probability?: number; closeDate?: string; notes?: string }) {
    return this.opps.create({ ...body, closeDate: body.closeDate ? new Date(body.closeDate) : undefined });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { stage?: string; value?: number; probability?: number; notes?: string }) {
    return this.opps.update(id, body);
  }
}
