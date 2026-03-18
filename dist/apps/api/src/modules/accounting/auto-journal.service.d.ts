import { PrismaClient } from '@bis/database';
import { JournalsService } from './journals.service';
import { JournalConfigurationService } from './journal-configuration.service';
export declare class AutoJournalService {
    private readonly prisma;
    private readonly journals;
    private readonly configService;
    constructor(prisma: PrismaClient, journals: JournalsService, configService: JournalConfigurationService);
    /**
     * Trigger auto-journal on invoice status transition
     */
    onInvoiceStatusChange(invoiceId: string, organizationId: string, fromStatus: string, toStatus: string, userId?: string): Promise<{
        journalEntry: Record<string, unknown> | null;
        warning?: string;
    }>;
    /**
     * Trigger auto-journal on bill status transition
     */
    onBillStatusChange(billId: string, organizationId: string, fromStatus: string, toStatus: string, userId?: string): Promise<{
        journalEntry: Record<string, unknown> | null;
        warning?: string;
    }>;
    /**
     * Create a reversal entry for all posted journal entries linked to a document
     */
    private createVoidReversal;
    private getInvoiceTriggerEvent;
    private getBillTriggerEvent;
}
//# sourceMappingURL=auto-journal.service.d.ts.map