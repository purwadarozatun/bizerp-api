import { Response } from 'express';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { PdfService } from './pdf.service';
import { EmailService } from '../crm/email.service';
import { PrismaClient } from '@bis/database';
export declare class InvoicesController {
    private readonly invoices;
    private readonly pdf;
    private readonly email;
    private readonly prisma;
    constructor(invoices: InvoicesService, pdf: PdfService, email: EmailService, prisma: PrismaClient);
    findAll(user: JwtPayload, status?: string, page?: number, pageSize?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, user: JwtPayload): Promise<any>;
    create(user: JwtPayload, body: {
        contactId: string;
        date: string;
        dueDate: string;
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
    updateStatus(id: string, user: JwtPayload, body: {
        status: string;
    }): Promise<any>;
    downloadPdf(id: string, user: JwtPayload, res: Response): Promise<void>;
    sendEmail(id: string, user: JwtPayload, body: {
        to: string;
        subject: string;
        body: string;
    }): Promise<{
        success: boolean;
        message: string;
        messageId: string;
        sentTo: string;
    }>;
}
//# sourceMappingURL=invoices.controller.d.ts.map