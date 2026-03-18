import { PrismaClient } from '@bis/database';
import { AutoJournalService } from './auto-journal.service';
export declare class InvoicesService {
    private readonly prisma;
    private readonly autoJournal;
    constructor(prisma: PrismaClient, autoJournal: AutoJournalService);
    /**
     * Valid invoice status transitions (state machine)
     */
    private readonly VALID_TRANSITIONS;
    /**
     * Validate if a status transition is allowed
     */
    private isValidTransition;
    /**
     * Transform Invoice data to ensure proper serialization of dates and amounts
     */
    private transformInvoice;
    findAll(organizationId: string, status?: string, page?: number, pageSize?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, organizationId: string): Promise<any>;
    create(organizationId: string, data: {
        contactId: string;
        date: Date;
        dueDate: Date;
        currency?: string;
        notes?: string;
        lines: Array<{
            accountId?: string;
            productId?: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate?: number;
        }>;
    }): Promise<any>;
    updateStatus(id: string, organizationId: string, status: string, userId?: string): Promise<any>;
}
//# sourceMappingURL=invoices.service.d.ts.map