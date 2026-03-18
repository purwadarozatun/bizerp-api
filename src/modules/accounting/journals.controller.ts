import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('referenceId') referenceId?: string,
    @Query('referenceType') referenceType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.journals.findAll(
      user.organizationId,
      referenceId,
      referenceType,
      page ? +page : 1,
      pageSize ? +pageSize : 25,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a journal entry' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.journals.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a journal entry' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      date: string;
      description: string;
      reference?: string;
      currency?: string;
      referenceId?: string;
      referenceType?: 'INVOICE' | 'BILL';
      lines: Array<{
        accountId: string;
        type: 'DEBIT' | 'CREDIT';
        amount: number;
        description?: string;
      }>;
    },
  ) {
    return this.journals.create(user.organizationId, {
      ...body,
      date: new Date(body.date),
      createdByUserId: user.sub,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft journal entry' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      date?: string;
      description?: string;
      reference?: string;
      currency?: string;
      lines?: Array<{
        accountId: string;
        type: 'DEBIT' | 'CREDIT';
        amount: number;
        description?: string;
      }>;
    },
  ) {
    return this.journals.update(id, user.organizationId, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post a draft journal entry' })
  post(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.journals.post(id, user.organizationId);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void a journal entry' })
  void(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { reason: string }) {
    return this.journals.void(id, user.organizationId, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft journal entry' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.journals.delete(id, user.organizationId);
  }

  @Post(':id/reversal')
  @ApiOperation({ summary: 'Create a reversal entry for a posted journal entry' })
  createReversal(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.journals.createReversal(id, user.organizationId, user.sub);
  }
}
