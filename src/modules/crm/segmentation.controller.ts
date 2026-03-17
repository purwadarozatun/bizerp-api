import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { SegmentationService } from './segmentation.service';

@ApiTags('crm/segmentation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/segmentation')
export class SegmentationController {
  constructor(private readonly segmentation: SegmentationService) {}

  @Get('tags')
  @ApiOperation({ summary: 'List all tags used across contacts' })
  getAllTags(@CurrentUser() user: JwtPayload) {
    return this.segmentation.getAllTags(user.organizationId);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get contacts by tags (comma-separated, matchAll optional)' })
  getByTags(
    @CurrentUser() user: JwtPayload,
    @Query('tags') tags: string,
    @Query('matchAll') matchAll?: string,
  ) {
    const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    return this.segmentation.getByTags(user.organizationId, tagList, matchAll === 'true');
  }

  @Post('contacts/:contactId/tags')
  @ApiOperation({ summary: 'Add tags to a contact' })
  addTags(@Param('contactId') contactId: string, @Body() body: { tags: string[] }) {
    return this.segmentation.addTags(contactId, body.tags);
  }

  @Delete('contacts/:contactId/tags')
  @ApiOperation({ summary: 'Remove tags from a contact' })
  removeTags(@Param('contactId') contactId: string, @Body() body: { tags: string[] }) {
    return this.segmentation.removeTags(contactId, body.tags);
  }
}
