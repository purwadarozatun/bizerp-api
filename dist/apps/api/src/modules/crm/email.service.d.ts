import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@bis/database';
export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
    }>;
}
export declare class EmailService {
    private readonly config;
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaClient);
    private createTransport;
    send(options: EmailOptions): Promise<{
        messageId: string;
        accepted: (string | import("nodemailer/lib/mailer").Address)[];
        rejected: (string | import("nodemailer/lib/mailer").Address)[];
    }>;
    sendToContact(contactId: string, subject: string, body: string): Promise<{
        messageId: string;
        accepted: (string | import("nodemailer/lib/mailer").Address)[];
        rejected: (string | import("nodemailer/lib/mailer").Address)[];
    }>;
    getSmtpConfig(): Promise<{
        configured: boolean;
        host: string | null;
        port: number;
        from: string | null;
    }>;
}
//# sourceMappingURL=email.service.d.ts.map