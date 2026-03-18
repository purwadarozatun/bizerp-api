import { Controller, Get, Put, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JournalConfigurationService } from './journal-configuration.service';

@ApiTags('accounting/journal-configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/journal-configuration')
export class JournalConfigurationController {
  constructor(private readonly configService: JournalConfigurationService) {}

  @Get()
  @ApiOperation({ summary: 'Get journal configuration for a document type' })
  findByDocumentType(@CurrentUser() user: JwtPayload, @Query('documentType') documentType: string) {
    return this.configService.findByDocumentType(user.organizationId, documentType);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update journal configuration (Accounting Admin, Super Admin)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { autoJournalEnabled?: boolean },
  ) {
    return this.configService.update(id, user.organizationId, body, user.sub, user.role);
  }

  @Get('health-check')
  @ApiOperation({ summary: 'Check journal configuration completeness' })
  healthCheck(@CurrentUser() user: JwtPayload) {
    return this.configService.healthCheck(user.organizationId);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get journal configuration audit log' })
  getAuditLog(@CurrentUser() user: JwtPayload) {
    return this.configService.getAuditLog(user.organizationId);
  }
}

@ApiTags('accounting/journal-trigger-rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/journal-trigger-rules')
export class JournalTriggerRulesController {
  constructor(private readonly configService: JournalConfigurationService) {}

  @Get()
  @ApiOperation({ summary: 'List trigger rules for a configuration' })
  findAll(@CurrentUser() user: JwtPayload, @Query('configurationId') configurationId: string) {
    return this.configService.findTriggerRules(user.organizationId, configurationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a trigger rule' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      configurationId: string;
      triggerEvent: string;
      debitAccountId: string;
      creditAccountId: string;
      isActive?: boolean;
    },
  ) {
    const { configurationId, ...data } = body;
    return this.configService.createTriggerRule(user.organizationId, configurationId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a trigger rule' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      debitAccountId?: string;
      creditAccountId?: string;
      isActive?: boolean;
    },
  ) {
    return this.configService.updateTriggerRule(id, user.organizationId, body, user.sub);
  }
}

@ApiTags('accounting/journal-tax-mappings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/journal-tax-mappings')
export class JournalTaxMappingsController {
  constructor(private readonly configService: JournalConfigurationService) {}

  @Get()
  @ApiOperation({ summary: 'List tax account mappings' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.configService.findTaxMappings(user.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tax mapping' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      taxPayableAccountId?: string;
      taxReceivableAccountId?: string;
    },
  ) {
    return this.configService.updateTaxMapping(id, user.organizationId, body);
  }
}
