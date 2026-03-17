import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

@Injectable()
export class PdfService {
  /**
   * Generate an invoice PDF document
   */
  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('INVOICE', 50, 50, { align: 'right' })
        .fontSize(10)
        .text(`Invoice #: ${data.number}`, { align: 'right' })
        .text(`Date: ${this.formatDate(data.date)}`, { align: 'right' })
        .text(`Due Date: ${this.formatDate(data.dueDate)}`, { align: 'right' })
        .moveDown();

      // Company info
      doc
        .fontSize(12)
        .text(data.organization.name, 50, 50)
        .fontSize(10);

      if (data.organization.address) {
        const addr = data.organization.address;
        if (addr.street) doc.text(addr.street);
        if (addr.city || addr.state || addr.zip) {
          doc.text(`${addr.city || ''} ${addr.state || ''} ${addr.zip || ''}`.trim());
        }
      }

      doc.moveDown();

      // Bill to
      doc.fontSize(12).text('Bill To:', 50);
      const contactName = data.contact.company ||
        `${data.contact.firstName || ''} ${data.contact.lastName || ''}`.trim() ||
        'N/A';
      doc.fontSize(10).text(contactName);
      if (data.contact.email) doc.text(data.contact.email);
      if (data.contact.phone) doc.text(data.contact.phone);

      doc.moveDown(2);

      // Line items table
      const tableTop = doc.y;
      const descCol = 50;
      const qtyCol = 280;
      const priceCol = 350;
      const taxCol = 420;
      const totalCol = 490;

      // Table header
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Description', descCol, tableTop)
        .text('Qty', qtyCol, tableTop)
        .text('Unit Price', priceCol, tableTop)
        .text('Tax', taxCol, tableTop)
        .text('Total', totalCol, tableTop)
        .font('Helvetica');

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(560, tableTop + 15)
        .stroke();

      // Line items
      let yPos = tableTop + 25;
      data.lines.forEach((line) => {
        doc
          .fontSize(9)
          .text(line.description, descCol, yPos, { width: 220 })
          .text(line.quantity.toString(), qtyCol, yPos)
          .text(this.formatCurrency(line.unitPrice, data.currency), priceCol, yPos)
          .text(`${(line.taxRate * 100).toFixed(0)}%`, taxCol, yPos)
          .text(this.formatCurrency(line.total, data.currency), totalCol, yPos);
        yPos += 20;
      });

      // Totals
      yPos += 10;
      doc
        .moveTo(50, yPos)
        .lineTo(560, yPos)
        .stroke();

      yPos += 15;
      const totalLabelX = 400;
      const totalValueX = 490;

      doc
        .fontSize(10)
        .text('Subtotal:', totalLabelX, yPos)
        .text(this.formatCurrency(data.subtotal, data.currency), totalValueX, yPos);

      yPos += 20;
      doc
        .text('Tax:', totalLabelX, yPos)
        .text(this.formatCurrency(data.taxAmount, data.currency), totalValueX, yPos);

      yPos += 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Total:', totalLabelX, yPos)
        .text(this.formatCurrency(data.total, data.currency), totalValueX, yPos)
        .font('Helvetica');

      // Notes
      if (data.notes) {
        yPos += 40;
        doc
          .fontSize(10)
          .text('Notes:', 50, yPos)
          .fontSize(9)
          .text(data.notes, 50, yPos + 15, { width: 500 });
      }

      doc.end();
    });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  }
}
