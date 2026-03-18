import { PrismaClient } from '@bis/database';
type ReconciliationStatus = 'reconciled' | 'unreconciled' | 'discrepancy' | 'pending';
interface ReconciliationRecord {
    documentId: string;
    documentNumber: string;
    documentType: 'INVOICE' | 'BILL';
    documentDate: Date;
    totalAmount: number;
    currency: string;
    journalEntryCount: number;
    journalAmount: number;
    status: ReconciliationStatus;
    discrepancyAmount: number;
    contactName: string | null;
    flaggedAt: Date | null;
    flagReason: string | null;
    lastCheckedAt: Date | null;
}
export declare class ReconciliationService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private computeStatus;
    findAll(organizationId: string, filters: {
        documentType?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        amountMin?: number;
        amountMax?: number;
        page?: number;
        pageSize?: number;
    }): Promise<{
        data: ReconciliationRecord[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getSummary(organizationId: string): Promise<{
        totalInvoiced: number;
        totalBilled: number;
        totalJournaled: number;
        totalDiscrepancyValue: number;
    }>;
    flagDiscrepancy(documentId: string, documentTypeHint: string | undefined, organizationId: string, note: string, userId: string, userRole: string): Promise<{
        id: string;
        organizationId: string;
        status: string;
        documentType: string;
        documentId: string;
        note: string;
        flaggedByUserId: string | null;
        flaggedAt: Date;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    getDocumentReconciliationStatus(documentId: string, documentType: 'INVOICE' | 'BILL', organizationId: string): Promise<{
        documentId: string;
        documentType: "INVOICE" | "BILL";
        documentAmount: number;
        journalAmount: number;
        status: ReconciliationStatus;
        discrepancyAmount: number;
    }>;
}
export {};
//# sourceMappingURL=reconciliation.service.d.ts.map