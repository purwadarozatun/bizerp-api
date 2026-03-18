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
exports.AutoJournalService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
const journals_service_1 = require("./journals.service");
const journal_configuration_service_1 = require("./journal-configuration.service");
let AutoJournalService = class AutoJournalService {
    prisma;
    journals;
    configService;
    constructor(prisma, journals, configService) {
        this.prisma = prisma;
        this.journals = journals;
        this.configService = configService;
    }
    /**
     * Trigger auto-journal on invoice status transition
     */
    async onInvoiceStatusChange(invoiceId, organizationId, fromStatus, toStatus, userId) {
        const config = await this.configService.ensureConfig(organizationId, 'INVOICE');
        if (!config.autoJournalEnabled) {
            return {
                journalEntry: null,
                warning: 'Auto-journal is disabled for INVOICE. No journal entry was created.',
            };
        }
        const triggerEvent = this.getInvoiceTriggerEvent(fromStatus, toStatus);
        if (!triggerEvent) {
            return { journalEntry: null }; // No trigger for this transition
        }
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: invoiceId, organizationId },
            include: { lines: true },
        });
        if (!invoice)
            return { journalEntry: null };
        const rule = config.triggerRules.find((r) => r.triggerEvent === triggerEvent && r.isActive);
        if (!rule) {
            // Check if it's a voided transition (reversal)
            if (toStatus === 'voided') {
                return await this.createVoidReversal(invoiceId, organizationId, 'INVOICE', userId);
            }
            throw new common_1.UnprocessableEntityException(`Journal configuration incomplete: no active rule for INVOICE ${triggerEvent}. Please configure journal rules at /accounting/journal-configuration`);
        }
        const lines = [];
        const invoiceTotal = Number(invoice.total);
        const taxAmount = Number(invoice.taxAmount);
        const subtotal = Number(invoice.subtotal);
        if (triggerEvent === 'ON_CREATED') {
            // Debit AR (full total), Credit Revenue (subtotal), Credit Tax Payable (tax)
            lines.push({ accountId: rule.debitAccountId, type: 'DEBIT', amount: invoiceTotal });
            if (taxAmount > 0) {
                // Need tax payable account
                const taxMapping = await this.prisma.journalTaxMapping.findFirst({
                    where: { organizationId },
                });
                if (taxMapping) {
                    lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: subtotal });
                    lines.push({
                        accountId: taxMapping.taxPayableAccountId,
                        type: 'CREDIT',
                        amount: taxAmount,
                    });
                }
                else {
                    lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: invoiceTotal });
                }
            }
            else {
                lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: invoiceTotal });
            }
        }
        else if (triggerEvent === 'ON_PAID') {
            // Debit Cash/Bank, Credit AR
            lines.push({ accountId: rule.debitAccountId, type: 'DEBIT', amount: invoiceTotal });
            lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: invoiceTotal });
        }
        else if (triggerEvent === 'ON_VOIDED') {
            return await this.createVoidReversal(invoiceId, organizationId, 'INVOICE', userId);
        }
        if (lines.length === 0)
            return { journalEntry: null };
        const journalEntry = await this.journals.createSystemEntry(organizationId, {
            date: new Date(),
            description: `Auto-journal: Invoice ${invoice.number} → ${toStatus}`,
            referenceId: invoiceId,
            referenceType: 'INVOICE',
            createdByUserId: userId,
            source: 'SYSTEM',
            lines,
        });
        // Post the entry immediately
        await this.journals.post(journalEntry.id, organizationId);
        return { journalEntry };
    }
    /**
     * Trigger auto-journal on bill status transition
     */
    async onBillStatusChange(billId, organizationId, fromStatus, toStatus, userId) {
        const config = await this.configService.ensureConfig(organizationId, 'BILL');
        if (!config.autoJournalEnabled) {
            return {
                journalEntry: null,
                warning: 'Auto-journal is disabled for BILL. No journal entry was created.',
            };
        }
        const triggerEvent = this.getBillTriggerEvent(fromStatus, toStatus);
        if (!triggerEvent) {
            return { journalEntry: null };
        }
        const bill = await this.prisma.bill.findFirst({
            where: { id: billId, organizationId },
            include: { lines: true },
        });
        if (!bill)
            return { journalEntry: null };
        const rule = config.triggerRules.find((r) => r.triggerEvent === triggerEvent && r.isActive);
        if (!rule) {
            if (toStatus === 'voided') {
                return await this.createVoidReversal(billId, organizationId, 'BILL', userId);
            }
            // Bills hard-block on missing mapping (F-15)
            throw new common_1.UnprocessableEntityException(`Journal configuration incomplete: no active rule for BILL ${triggerEvent}. Please configure journal rules at /accounting/journal-configuration`);
        }
        const lines = [];
        const billTotal = Number(bill.total);
        const taxAmount = Number(bill.taxAmount);
        const subtotal = Number(bill.subtotal);
        if (triggerEvent === 'ON_APPROVED') {
            // Debit Expense (subtotal), Debit Tax Receivable (tax), Credit AP (total)
            if (taxAmount > 0) {
                const taxMapping = await this.prisma.journalTaxMapping.findFirst({
                    where: { organizationId },
                });
                if (taxMapping) {
                    lines.push({ accountId: rule.debitAccountId, type: 'DEBIT', amount: subtotal });
                    lines.push({
                        accountId: taxMapping.taxReceivableAccountId,
                        type: 'DEBIT',
                        amount: taxAmount,
                    });
                    lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: billTotal });
                }
                else {
                    lines.push({ accountId: rule.debitAccountId, type: 'DEBIT', amount: billTotal });
                    lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: billTotal });
                }
            }
            else {
                lines.push({ accountId: rule.debitAccountId, type: 'DEBIT', amount: billTotal });
                lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: billTotal });
            }
        }
        else if (triggerEvent === 'ON_PAID') {
            // Debit AP, Credit Cash/Bank
            lines.push({ accountId: rule.debitAccountId, type: 'DEBIT', amount: billTotal });
            lines.push({ accountId: rule.creditAccountId, type: 'CREDIT', amount: billTotal });
        }
        else if (triggerEvent === 'ON_VOIDED') {
            return await this.createVoidReversal(billId, organizationId, 'BILL', userId);
        }
        if (lines.length === 0)
            return { journalEntry: null };
        const journalEntry = await this.journals.createSystemEntry(organizationId, {
            date: new Date(),
            description: `Auto-journal: Bill ${bill.number} → ${toStatus}`,
            referenceId: billId,
            referenceType: 'BILL',
            createdByUserId: userId,
            source: 'SYSTEM',
            lines,
        });
        // Post the entry immediately
        await this.journals.post(journalEntry.id, organizationId);
        return { journalEntry };
    }
    /**
     * Create a reversal entry for all posted journal entries linked to a document
     */
    async createVoidReversal(documentId, organizationId, documentType, userId) {
        // Find all posted system journal entries for this document
        const entries = await this.prisma.journalEntry.findMany({
            where: {
                organizationId,
                referenceId: documentId,
                referenceType: documentType,
                status: 'posted',
                source: 'SYSTEM',
            },
        });
        if (entries.length === 0) {
            return { journalEntry: null, warning: 'No posted journal entries found to reverse' };
        }
        const reversals = await Promise.all(entries.map((entry) => this.journals.createReversal(entry.id, organizationId, userId)));
        // Post all reversals
        for (const reversal of reversals) {
            await this.journals.post(reversal.id, organizationId);
        }
        return { journalEntry: reversals[0] };
    }
    getInvoiceTriggerEvent(fromStatus, toStatus) {
        if (toStatus === 'created' || (fromStatus === 'draft' && toStatus === 'sent'))
            return 'ON_CREATED';
        if (toStatus === 'paid')
            return 'ON_PAID';
        if (toStatus === 'voided')
            return 'ON_VOIDED';
        return null;
    }
    getBillTriggerEvent(fromStatus, toStatus) {
        if (toStatus === 'approved')
            return 'ON_APPROVED';
        if (toStatus === 'paid')
            return 'ON_PAID';
        if (toStatus === 'voided')
            return 'ON_VOIDED';
        return null;
    }
};
exports.AutoJournalService = AutoJournalService;
exports.AutoJournalService = AutoJournalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient,
        journals_service_1.JournalsService,
        journal_configuration_service_1.JournalConfigurationService])
], AutoJournalService);
//# sourceMappingURL=auto-journal.service.js.map