import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
interface PaymentBody {
    date: string;
    amount: number;
    currency?: string;
    method: string;
    reference?: string;
    notes?: string;
}
export declare class PaymentsController {
    private readonly payments;
    constructor(payments: PaymentsService);
    payInvoice(id: string, user: JwtPayload, body: PaymentBody): Promise<{
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
    getInvoicePayments(id: string, user: JwtPayload): Promise<{
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
    payBill(id: string, user: JwtPayload, body: PaymentBody): Promise<{
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
    getBillPayments(id: string, user: JwtPayload): Promise<{
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
//# sourceMappingURL=payments.controller.d.ts.map