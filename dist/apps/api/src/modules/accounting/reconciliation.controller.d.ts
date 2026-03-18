import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ReconciliationService } from './reconciliation.service';
export declare class ReconciliationController {
    private readonly reconciliationService;
    constructor(reconciliationService: ReconciliationService);
    findAll(user: JwtPayload, documentType?: string, status?: string, dateFrom?: string, dateTo?: string, amountMin?: string, amountMax?: string, page?: string, pageSize?: string): Promise<unknown>;
    getSummary(user: JwtPayload): Promise<{
        totalInvoiced: number;
        totalBilled: number;
        totalJournaled: number;
        totalDiscrepancyValue: number;
    }>;
    getDocumentStatus(documentId: string, user: JwtPayload, documentType: 'INVOICE' | 'BILL'): Promise<{
        documentId: string;
        documentType: "INVOICE" | "BILL";
        documentAmount: number;
        journalAmount: number;
        status: "pending" | "reconciled" | "unreconciled" | "discrepancy";
        discrepancyAmount: number;
    }>;
    flagDiscrepancy(documentId: string, user: JwtPayload, body: {
        documentType?: string;
        note?: string;
        reason?: string;
    }): Promise<{
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
}
//# sourceMappingURL=reconciliation.controller.d.ts.map