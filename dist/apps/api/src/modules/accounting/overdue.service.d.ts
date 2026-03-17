import { PrismaClient } from '@bis/database';
/**
 * Marks sent/partial invoices and bills as overdue when their due date passes.
 * In production, call this via a BullMQ cron job (daily).
 */
export declare class OverdueService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaClient);
    markOverdueInvoices(): Promise<{
        invoicesMarked: number;
    }>;
    markOverdueBills(): Promise<{
        billsMarked: number;
    }>;
    runAll(): Promise<{
        billsMarked: number;
        invoicesMarked: number;
    }>;
}
//# sourceMappingURL=overdue.service.d.ts.map