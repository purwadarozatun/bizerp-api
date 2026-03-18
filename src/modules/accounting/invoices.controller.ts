import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../common/permissions';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { PdfService } from './pdf.service';
import { EmailService } from '../crm/email.service';
import { PrismaClient } from '@bis/database';

@ApiTags('accounting/invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/invoices')
export class InvoicesController {
  constructor(
    private readonly invoices: InvoicesService,
    private readonly pdf: PdfService,
    private readonly email: EmailService,
    private readonly prisma: PrismaClient,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.invoices.findAll(user.organizationId, status, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoices.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an invoice' })
  create(@CurrentUser() user: JwtPayload, @Body() body: { contactId: string; date: string; dueDate: string; currency?: string; notes?: string; lines: Array<{ accountId?: string; productId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }> }) {
    return this.invoices.create(user.organizationId, { ...body, date: new Date(body.date), dueDate: new Date(body.dueDate) });
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: { status: string }) {
    return this.invoices.updateStatus(id, user.organizationId, body.status, user.sub);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice as PDF' })
  @RequirePermission(PERMISSIONS.ACCOUNTING, 'full')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    // Get invoice data
    const invoice = await this.invoices.findOne(id, user.organizationId);

    // Get organization details
    const organization = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    // Generate PDF
    const pdfBuffer = await this.pdf.generateInvoicePdf({
      number: invoice.number,
      date: invoice.date,
      dueDate: invoice.dueDate,
      contact: invoice.contact,
      organization: {
        name: organization?.name || 'Company',
        address: organization?.address,
      },
      lines: invoice.lines,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency,
      notes: invoice.notes || undefined,
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.number}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send invoice via email with PDF attachment' })
  @RequirePermission(PERMISSIONS.ACCOUNTING, 'full')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async sendEmail(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { to: string; subject: string; body: string },
  ) {
    // Get invoice data
    const invoice = await this.invoices.findOne(id, user.organizationId);

    // Get organization details
    const organization = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    // Generate PDF
    const pdfBuffer = await this.pdf.generateInvoicePdf({
      number: invoice.number,
      date: invoice.date,
      dueDate: invoice.dueDate,
      contact: invoice.contact,
      organization: {
        name: organization?.name || 'Company',
        address: organization?.address,
      },
      lines: invoice.lines,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency,
      notes: invoice.notes || undefined,
    });

    // Send email with PDF attachment
    const emailResult = await this.email.send({
      to: body.to,
      subject: body.subject,
      html: body.body,
      attachments: [
        {
          filename: `invoice-${invoice.number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // Update invoice status to 'sent'
    await this.invoices.updateStatus(id, user.organizationId, 'sent', user.sub);

    // Log the email send event
    await this.prisma.invoiceEmailLog.create({
      data: {
        invoiceId: id,
        sentTo: body.to,
        sentByUserId: user.sub,
        subject: body.subject,
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Invoice sent successfully',
      messageId: emailResult.messageId,
      sentTo: body.to,
    };
  }
}
