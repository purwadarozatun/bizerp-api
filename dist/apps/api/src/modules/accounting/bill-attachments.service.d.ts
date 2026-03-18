import { PrismaClient } from '@bis/database';
export declare class BillAttachmentsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    ensureUploadDir(billId: string): Promise<string>;
    getAttachments(billId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        billId: string;
        filename: string;
        fileSize: number;
        mimeType: string;
        storagePath: string;
    }[]>;
    addAttachment(billId: string, organizationId: string, file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }): Promise<{
        id: string;
        createdAt: Date;
        billId: string;
        filename: string;
        fileSize: number;
        mimeType: string;
        storagePath: string;
    }>;
    deleteAttachment(billId: string, attachmentId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        billId: string;
        filename: string;
        fileSize: number;
        mimeType: string;
        storagePath: string;
    }>;
    getAttachmentFile(billId: string, attachmentId: string, organizationId: string): Promise<{
        buffer: NonSharedBuffer;
        filename: string;
        mimeType: string;
    }>;
}
//# sourceMappingURL=bill-attachments.service.d.ts.map