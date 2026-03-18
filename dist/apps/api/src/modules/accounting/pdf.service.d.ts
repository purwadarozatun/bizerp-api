export interface InvoicePdfData {
    number: string;
    date: string;
    dueDate: string;
    contact: {
        firstName?: string;
        lastName?: string;
        company?: string;
        email?: string;
        phone?: string;
    };
    organization: {
        name: string;
        address?: any;
    };
    lines: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        total: number;
    }>;
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
    notes?: string;
}
export declare class PdfService {
    /**
     * Generate an invoice PDF document
     */
    generateInvoicePdf(data: InvoicePdfData): Promise<Buffer>;
    private formatDate;
    private formatCurrency;
}
//# sourceMappingURL=pdf.service.d.ts.map