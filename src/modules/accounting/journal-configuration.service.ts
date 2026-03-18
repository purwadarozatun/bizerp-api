import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class JournalConfigurationService {
  constructor(private readonly prisma: PrismaClient) {}

  async findByDocumentType(organizationId: string, documentType: string) {
    const config = await this.prisma.journalConfiguration.findUnique({
      where: { organizationId_documentType: { organizationId, documentType } },
      include: {
        triggerRules: {
          include: { debitAccount: true, creditAccount: true },
        },
      },
    });
    if (!config) {
      // Return a default empty config if not yet created
      return { organizationId, documentType, autoJournalEnabled: false, triggerRules: [] };
    }
    return config;
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<{ autoJournalEnabled: boolean }>,
    userId: string | undefined,
    userRole: string,
  ) {
    const config = await this.prisma.journalConfiguration.findFirst({
      where: { id, organizationId },
    });
    if (!config) throw new NotFoundException(`Journal configuration ${id} not found`);

    // Only Super Admin can toggle autoJournalEnabled
    if (data.autoJournalEnabled !== undefined && !['owner', 'admin'].includes(userRole)) {
      throw new ForbiddenException('Only Super Admin can toggle auto-journal');
    }

    // Log changes
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
    if (
      data.autoJournalEnabled !== undefined &&
      data.autoJournalEnabled !== config.autoJournalEnabled
    ) {
      changes.push({
        field: 'autoJournalEnabled',
        oldValue: String(config.autoJournalEnabled),
        newValue: String(data.autoJournalEnabled),
      });
    }

    const updated = await this.prisma.journalConfiguration.update({
      where: { id },
      data,
      include: {
        triggerRules: {
          include: { debitAccount: true, creditAccount: true },
        },
      },
    });

    if (changes.length > 0 && userId) {
      await Promise.all(
        changes.map((change) =>
          this.prisma.journalConfigAuditLog.create({
            data: {
              organizationId,
              configurationId: id,
              changedByUserId: userId,
              field: change.field,
              oldValue: change.oldValue,
              newValue: change.newValue,
            },
          }),
        ),
      );
    }

    return updated;
  }

  async healthCheck(organizationId: string) {
    const configs = await this.prisma.journalConfiguration.findMany({
      where: { organizationId },
      include: { triggerRules: { include: { debitAccount: true, creditAccount: true } } },
    });

    const requiredEvents: Record<string, string[]> = {
      INVOICE: ['ON_CREATED', 'ON_PAID', 'ON_VOIDED'],
      BILL: ['ON_APPROVED', 'ON_PAID', 'ON_VOIDED'],
    };

    const missing: string[] = [];
    for (const [docType, events] of Object.entries(requiredEvents)) {
      const config = configs.find((c) => c.documentType === docType);
      if (!config) {
        events.forEach((e) => missing.push(`${docType}: ${e} (no configuration found)`));
        continue;
      }
      for (const event of events) {
        const rule = config.triggerRules.find((r) => r.triggerEvent === event && r.isActive);
        if (!rule) {
          missing.push(`${docType}: ${event} (no active rule)`);
        } else if (!rule.debitAccountId || !rule.creditAccountId) {
          missing.push(`${docType}: ${event} (missing debit or credit account)`);
        }
      }
    }

    return {
      status: missing.length === 0 ? 'green' : 'red',
      missing,
      checkedAt: new Date().toISOString(),
    };
  }

  // ─── Trigger Rules ────────────────────────────────────────────────────────

  async findTriggerRules(organizationId: string, configurationId: string) {
    // Verify config belongs to org
    const config = await this.prisma.journalConfiguration.findFirst({
      where: { id: configurationId, organizationId },
    });
    if (!config) throw new NotFoundException(`Configuration ${configurationId} not found`);

    const data = await this.prisma.journalTriggerRule.findMany({
      where: { configurationId },
      include: { debitAccount: true, creditAccount: true },
    });
    return { data };
  }

  async updateTriggerRule(
    id: string,
    organizationId: string,
    data: Partial<{
      triggerEvent: string;
      debitAccountId: string;
      creditAccountId: string;
      isActive: boolean;
    }>,
    userId: string | undefined,
  ) {
    const rule = await this.prisma.journalTriggerRule.findFirst({
      where: { id, configuration: { organizationId } },
      include: { configuration: true },
    });
    if (!rule) throw new NotFoundException(`Trigger rule ${id} not found`);

    const oldValues: Record<string, string> = {
      debitAccountId: rule.debitAccountId,
      creditAccountId: rule.creditAccountId,
      isActive: String(rule.isActive),
    };

    const updated = await this.prisma.journalTriggerRule.update({
      where: { id },
      data,
      include: { debitAccount: true, creditAccount: true },
    });

    // Audit log
    if (userId) {
      const changedFields = Object.entries(data).filter(
        ([k, v]) => v !== undefined && String(v) !== oldValues[k],
      );
      await Promise.all(
        changedFields.map(([field, newValue]) =>
          this.prisma.journalConfigAuditLog.create({
            data: {
              organizationId,
              configurationId: rule.configurationId,
              changedByUserId: userId,
              field: `triggerRule.${id}.${field}`,
              oldValue: oldValues[field],
              newValue: String(newValue),
            },
          }),
        ),
      );
    }

    return updated;
  }

  async createTriggerRule(
    organizationId: string,
    configurationId: string,
    data: {
      triggerEvent: string;
      debitAccountId: string;
      creditAccountId: string;
      isActive?: boolean;
    },
  ) {
    const config = await this.prisma.journalConfiguration.findFirst({
      where: { id: configurationId, organizationId },
    });
    if (!config) throw new NotFoundException(`Configuration ${configurationId} not found`);

    return this.prisma.journalTriggerRule.create({
      data: { configurationId, ...data, isActive: data.isActive ?? true },
      include: { debitAccount: true, creditAccount: true },
    });
  }

  // ─── Tax Mappings ─────────────────────────────────────────────────────────

  async findTaxMappings(organizationId: string) {
    const data = await this.prisma.journalTaxMapping.findMany({
      where: { organizationId },
      include: { taxPayableAccount: true, taxReceivableAccount: true },
    });
    return { data };
  }

  async updateTaxMapping(
    id: string,
    organizationId: string,
    data: Partial<{ taxPayableAccountId: string; taxReceivableAccountId: string }>,
  ) {
    const mapping = await this.prisma.journalTaxMapping.findFirst({
      where: { id, organizationId },
    });
    if (!mapping) throw new NotFoundException(`Tax mapping ${id} not found`);

    return this.prisma.journalTaxMapping.update({
      where: { id },
      data,
      include: { taxPayableAccount: true, taxReceivableAccount: true },
    });
  }

  async getAuditLog(organizationId: string) {
    const data = await this.prisma.journalConfigAuditLog.findMany({
      where: { organizationId },
      orderBy: { changedAt: 'desc' },
    });
    return { data };
  }

  /**
   * Ensure journal configuration exists for a document type, creating it if needed.
   */
  async ensureConfig(organizationId: string, documentType: string) {
    return this.prisma.journalConfiguration.upsert({
      where: { organizationId_documentType: { organizationId, documentType } },
      update: {},
      create: { organizationId, documentType, autoJournalEnabled: true },
      include: {
        triggerRules: {
          include: { debitAccount: true, creditAccount: true },
        },
      },
    });
  }
}
