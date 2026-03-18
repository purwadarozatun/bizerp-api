"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PdfService = class PdfService {
    /**
     * Generate an invoice PDF document
     */
    async generateInvoicePdf(data) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
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
                if (addr.street)
                    doc.text(addr.street);
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
            if (data.contact.email)
                doc.text(data.contact.email);
            if (data.contact.phone)
                doc.text(data.contact.phone);
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
    formatDate(dateString) {
        if (!dateString)
            return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    formatCurrency(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map