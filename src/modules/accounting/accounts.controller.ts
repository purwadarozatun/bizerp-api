import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { AccountsService } from './accounts.service';

@ApiTags('accounting/accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all accounts (Chart of Accounts)' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.accounts.findAll(user.organizationId);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance as of date' })
  trialBalance(@CurrentUser() user: JwtPayload, @Query('asOf') asOf?: string) {
    return this.accounts.getTrialBalance(user.organizationId, asOf ? new Date(asOf) : new Date());
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.accounts.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an account' })
  create(@CurrentUser() user: JwtPayload, @Body() body: { code: string; name: string; type: string; subtype?: string; description?: string; parentId?: string }) {
    return this.accounts.create(user.organizationId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { name?: string; description?: string; isActive?: boolean }) {
    return this.accounts.update(id, user.organizationId, body);
  }
}
