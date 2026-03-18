"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let JournalConfigurationService = class JournalConfigurationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByDocumentType(organizationId, documentType) {
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
    async update(id, organizationId, data, userId, userRole) {
        const config = await this.prisma.journalConfiguration.findFirst({
            where: { id, organizationId },
        });
        if (!config)
            throw new common_1.NotFoundException(`Journal configuration ${id} not found`);
        // Only Super Admin can toggle autoJournalEnabled
        if (data.autoJournalEnabled !== undefined && !['owner', 'admin'].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Super Admin can toggle auto-journal');
        }
        // Log changes
        const changes = [];
        if (data.autoJournalEnabled !== undefined &&
            data.autoJournalEnabled !== config.autoJournalEnabled) {
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
            await Promise.all(changes.map((change) => this.prisma.journalConfigAuditLog.create({
                data: {
                    organizationId,
                    configurationId: id,
                    changedByUserId: userId,
                    field: change.field,
                    oldValue: change.oldValue,
                    newValue: change.newValue,
                },
            })));
        }
        return updated;
    }
    async healthCheck(organizationId) {
        const configs = await this.prisma.journalConfiguration.findMany({
            where: { organizationId },
            include: { triggerRules: { include: { debitAccount: true, creditAccount: true } } },
        });
        const requiredEvents = {
            INVOICE: ['ON_CREATED', 'ON_PAID', 'ON_VOIDED'],
            BILL: ['ON_APPROVED', 'ON_PAID', 'ON_VOIDED'],
        };
        const missing = [];
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
                }
                else if (!rule.debitAccountId || !rule.creditAccountId) {
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
    async findTriggerRules(organizationId, configurationId) {
        // Verify config belongs to org
        const config = await this.prisma.journalConfiguration.findFirst({
            where: { id: configurationId, organizationId },
        });
        if (!config)
            throw new common_1.NotFoundException(`Configuration ${configurationId} not found`);
        const data = await this.prisma.journalTriggerRule.findMany({
            where: { configurationId },
            include: { debitAccount: true, creditAccount: true },
        });
        return { data };
    }
    async updateTriggerRule(id, organizationId, data, userId) {
        const rule = await this.prisma.journalTriggerRule.findFirst({
            where: { id, configuration: { organizationId } },
            include: { configuration: true },
        });
        if (!rule)
            throw new common_1.NotFoundException(`Trigger rule ${id} not found`);
        const oldValues = {
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
            const changedFields = Object.entries(data).filter(([k, v]) => v !== undefined && String(v) !== oldValues[k]);
            await Promise.all(changedFields.map(([field, newValue]) => this.prisma.journalConfigAuditLog.create({
                data: {
                    organizationId,
                    configurationId: rule.configurationId,
                    changedByUserId: userId,
                    field: `triggerRule.${id}.${field}`,
                    oldValue: oldValues[field],
                    newValue: String(newValue),
                },
            })));
        }
        return updated;
    }
    async createTriggerRule(organizationId, configurationId, data) {
        const config = await this.prisma.journalConfiguration.findFirst({
            where: { id: configurationId, organizationId },
        });
        if (!config)
            throw new common_1.NotFoundException(`Configuration ${configurationId} not found`);
        return this.prisma.journalTriggerRule.create({
            data: { configurationId, ...data, isActive: data.isActive ?? true },
            include: { debitAccount: true, creditAccount: true },
        });
    }
    // ─── Tax Mappings ─────────────────────────────────────────────────────────
    async findTaxMappings(organizationId) {
        const data = await this.prisma.journalTaxMapping.findMany({
            where: { organizationId },
            include: { taxPayableAccount: true, taxReceivableAccount: true },
        });
        return { data };
    }
    async updateTaxMapping(id, organizationId, data) {
        const mapping = await this.prisma.journalTaxMapping.findFirst({
            where: { id, organizationId },
        });
        if (!mapping)
            throw new common_1.NotFoundException(`Tax mapping ${id} not found`);
        return this.prisma.journalTaxMapping.update({
            where: { id },
            data,
            include: { taxPayableAccount: true, taxReceivableAccount: true },
        });
    }
    async getAuditLog(organizationId) {
        const data = await this.prisma.journalConfigAuditLog.findMany({
            where: { organizationId },
            orderBy: { changedAt: 'desc' },
        });
        return { data };
    }
    /**
     * Ensure journal configuration exists for a document type, creating it if needed.
     */
    async ensureConfig(organizationId, documentType) {
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
};
exports.JournalConfigurationService = JournalConfigurationService;
exports.JournalConfigurationService = JournalConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], JournalConfigurationService);
//# sourceMappingURL=journal-configuration.service.js.map