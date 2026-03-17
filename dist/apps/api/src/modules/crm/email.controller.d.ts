import { EmailService } from './email.service';
export declare class EmailController {
    private readonly email;
    constructor(email: EmailService);
    getConfig(): Promise<{
        configured: boolean;
        host: string | null;
        port: number;
        from: string | null;
    }>;
    send(body: {
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
    }): Promise<{
        messageId: string;
        accepted: (string | import("nodemailer/lib/mailer").Address)[];
        rejected: (string | import("nodemailer/lib/mailer").Address)[];
    }>;
    sendToContact(body: {
        contactId: string;
        subject: string;
        body: string;
    }): Promise<{
        messageId: string;
        accepted: (string | import("nodemailer/lib/mailer").Address)[];
        rejected: (string | import("nodemailer/lib/mailer").Address)[];
    }>;
}
//# sourceMappingURL=email.controller.d.ts.map