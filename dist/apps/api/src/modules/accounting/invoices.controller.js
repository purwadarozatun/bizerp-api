"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const permissions_1 = require("../../common/permissions");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const invoices_service_1 = require("./invoices.service");
const pdf_service_1 = require("./pdf.service");
const email_service_1 = require("../crm/email.service");
const database_1 = require("@bis/database");
let InvoicesController = class InvoicesController {
    invoices;
    pdf;
    email;
    prisma;
    constructor(invoices, pdf, email, prisma) {
        this.invoices = invoices;
        this.pdf = pdf;
        this.email = email;
        this.prisma = prisma;
    }
    findAll(user, status, page, pageSize) {
        return this.invoices.findAll(user.organizationId, status, page, pageSize);
    }
    findOne(id, user) {
        return this.invoices.findOne(id, user.organizationId);
    }
    create(user, body) {
        return this.invoices.create(user.organizationId, { ...body, date: new Date(body.date), dueDate: new Date(body.dueDate) });
    }
    updateStatus(id, user, body) {
        return this.invoices.updateStatus(id, user.organizationId, body.status, user.sub);
    }
    async downloadPdf(id, user, res) {
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
    async sendEmail(id, user, body) {
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
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List invoices' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create an invoice' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Download invoice as PDF' }),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.ACCOUNTING, 'full'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Post)(':id/send-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Send invoice via email with PDF attachment' }),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.ACCOUNTING, 'full'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "sendEmail", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('accounting/invoices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('accounting/invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        pdf_service_1.PdfService,
        email_service_1.EmailService,
        database_1.PrismaClient])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map