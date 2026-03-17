import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaClient } from '@bis/database';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaClient,
  ) {}

  private createTransport() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT') || 587;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host) throw new BadRequestException('SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });
  }

  async send(options: EmailOptions) {
    const transport = this.createTransport();
    const from = this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER');

    const info = await transport.sendMail({
      from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  }

  async sendToContact(contactId: string, subject: string, body: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact?.email) throw new BadRequestException(`Contact ${contactId} has no email address`);

    const result = await this.send({ to: contact.email, subject, html: body });

    // Log as activity
    await this.prisma.activity.create({
      data: {
        contactId,
        type: 'email',
        subject,
        description: `Email sent: ${subject}`,
        completedAt: new Date(),
      },
    });

    return result;
  }

  async getSmtpConfig() {
    return {
      configured: !!this.config.get<string>('SMTP_HOST'),
      host: this.config.get<string>('SMTP_HOST') || null,
      port: this.config.get<number>('SMTP_PORT') || 587,
      from: this.config.get<string>('SMTP_FROM') || null,
    };
  }
}
