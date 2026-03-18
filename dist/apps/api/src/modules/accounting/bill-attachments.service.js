"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillAttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/bis-uploads/bills';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
let BillAttachmentsService = class BillAttachmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureUploadDir(billId) {
        const dir = path.join(UPLOAD_DIR, billId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    }
    async getAttachments(billId, organizationId) {
        // Verify bill belongs to org
        const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
        if (!bill)
            throw new common_1.NotFoundException(`Bill ${billId} not found`);
        return this.prisma.billAttachment.findMany({
            where: { billId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async addAttachment(billId, organizationId, file) {
        const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
        if (!bill)
            throw new common_1.NotFoundException(`Bill ${billId} not found`);
        if (bill.status !== 'draft') {
            throw new common_1.ForbiddenException('Attachments can only be added to draft bills');
        }
        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only PDF, JPG, and PNG files are allowed');
        }
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('File size cannot exceed 10MB');
        }
        // Save to disk
        const dir = await this.ensureUploadDir(billId);
        const ext = path.extname(file.originalname) || '.bin';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const storagePath = path.join(dir, filename);
        fs.writeFileSync(storagePath, file.buffer);
        return this.prisma.billAttachment.create({
            data: {
                billId,
                filename: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                storagePath,
            },
        });
    }
    async deleteAttachment(billId, attachmentId, organizationId) {
        const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
        if (!bill)
            throw new common_1.NotFoundException(`Bill ${billId} not found`);
        if (bill.status !== 'draft') {
            throw new common_1.ForbiddenException('Attachments can only be deleted from draft bills');
        }
        const attachment = await this.prisma.billAttachment.findFirst({
            where: { id: attachmentId, billId },
        });
        if (!attachment)
            throw new common_1.NotFoundException(`Attachment ${attachmentId} not found`);
        // Delete from disk if exists
        if (attachment.storagePath && fs.existsSync(attachment.storagePath)) {
            fs.unlinkSync(attachment.storagePath);
        }
        return this.prisma.billAttachment.delete({ where: { id: attachmentId } });
    }
    async getAttachmentFile(billId, attachmentId, organizationId) {
        const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
        if (!bill)
            throw new common_1.NotFoundException(`Bill ${billId} not found`);
        const attachment = await this.prisma.billAttachment.findFirst({
            where: { id: attachmentId, billId },
        });
        if (!attachment)
            throw new common_1.NotFoundException(`Attachment ${attachmentId} not found`);
        if (!fs.existsSync(attachment.storagePath)) {
            throw new common_1.NotFoundException('File not found on storage');
        }
        return {
            buffer: fs.readFileSync(attachment.storagePath),
            filename: attachment.filename,
            mimeType: attachment.mimeType,
        };
    }
};
exports.BillAttachmentsService = BillAttachmentsService;
exports.BillAttachmentsService = BillAttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], BillAttachmentsService);
//# sourceMappingURL=bill-attachments.service.js.map