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
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ChartOfAccountsService } from './chart-of-accounts.service';

@ApiTags('accounting/chart-of-accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class ChartOfAccountsController {
  constructor(private readonly coaService: ChartOfAccountsService) {}

  // ─── Chart of Accounts ───────────────────────────────────────────────────

  @Get('chart-of-accounts')
  @ApiOperation({ summary: 'List all accounts in chart of accounts' })
  findAll(@CurrentUser() user: JwtPayload, @Query('active') active?: string) {
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
    return this.coaService.findAll(user.organizationId, isActive);
  }

  @Post('chart-of-accounts')
  @ApiOperation({ summary: 'Create an account (Super Admin)' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      code: string;
      name: string;
      type: string;
      subtype?: string;
      description?: string;
      parentId?: string;
      isSystemAccount?: boolean;
    },
  ) {
    return this.coaService.create(user.organizationId, body, user.role);
  }

  @Patch('chart-of-accounts/:id')
  @ApiOperation({ summary: 'Update an account' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      name?: string;
      description?: string;
      isActive?: boolean;
      subtype?: string;
    },
  ) {
    return this.coaService.update(id, user.organizationId, body);
  }

  @Delete('chart-of-accounts/:id')
  @ApiOperation({ summary: 'Deactivate an account (soft delete)' })
  deactivate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.coaService.deactivate(id, user.organizationId);
  }

  // ─── Category CoA Mappings ───────────────────────────────────────────────

  @Get('coa-mappings')
  @ApiOperation({ summary: 'List category-to-account mappings' })
  findMappings(@CurrentUser() user: JwtPayload, @Query('documentType') documentType?: string) {
    return this.coaService.findCategoryMappings(user.organizationId, documentType);
  }

  @Post('coa-mappings')
  @ApiOperation({ summary: 'Set default category-to-account mapping' })
  setMapping(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: { category: string; documentType: string; accountId: string; isDefault?: boolean },
  ) {
    return this.coaService.setCategoryMapping(user.organizationId, body);
  }

  // ─── System Account Configs ──────────────────────────────────────────────

  @Get('system-accounts')
  @ApiOperation({ summary: 'Get system account configuration' })
  getSystemAccounts(@CurrentUser() user: JwtPayload) {
    return this.coaService.getSystemAccounts(user.organizationId);
  }

  @Put('system-accounts')
  @ApiOperation({ summary: 'Update system accounts (Super Admin only)' })
  updateSystemAccount(
    @CurrentUser() user: JwtPayload,
    @Body() body: { accountType: string; accountId: string },
  ) {
    return this.coaService.updateSystemAccount(
      user.organizationId,
      body.accountType,
      body.accountId,
      user.role,
    );
  }
}
