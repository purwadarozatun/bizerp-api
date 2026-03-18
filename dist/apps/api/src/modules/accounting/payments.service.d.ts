import { PrismaClient } from '@bis/database';
interface RecordPaymentDto {
    date: Date;
    amount: number;
    currency: string;
    method: string;
    reference?: string;
    notes?: string;
}
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    payInvoice(invoiceId: string, organizationId: string, dto: RecordPaymentDto): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        date: Date;
        reference: string | null;
        notes: string | null;
        billId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        method: string;
    }>;
    payBill(billId: string, organizationId: string, dto: RecordPaymentDto): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        date: Date;
        reference: string | null;
        notes: string | null;
        billId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        method: string;
    }>;
    getInvoicePayments(invoiceId: string, organizationId: string): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        date: Date;
        reference: string | null;
        notes: string | null;
        billId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        method: string;
    }[]>;
    getBillPayments(billId: string, organizationId: string): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        date: Date;
        reference: string | null;
        notes: string | null;
        billId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        method: string;
    }[]>;
}
export {};
//# sourceMappingURL=payments.service.d.ts.map