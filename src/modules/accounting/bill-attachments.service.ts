import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@bis/database';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/bis-uploads/bills';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

@Injectable()
export class BillAttachmentsService {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureUploadDir(billId: string): Promise<string> {
    const dir = path.join(UPLOAD_DIR, billId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async getAttachments(billId: string, organizationId: string) {
    // Verify bill belongs to org
    const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);
    return this.prisma.billAttachment.findMany({
      where: { billId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addAttachment(
    billId: string,
    organizationId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  ) {
    const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);

    if (bill.status !== 'draft') {
      throw new ForbiddenException('Attachments can only be added to draft bills');
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPG, and PNG files are allowed');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size cannot exceed 10MB');
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

  async deleteAttachment(billId: string, attachmentId: string, organizationId: string) {
    const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);

    if (bill.status !== 'draft') {
      throw new ForbiddenException('Attachments can only be deleted from draft bills');
    }

    const attachment = await this.prisma.billAttachment.findFirst({
      where: { id: attachmentId, billId },
    });
    if (!attachment) throw new NotFoundException(`Attachment ${attachmentId} not found`);

    // Delete from disk if exists
    if (attachment.storagePath && fs.existsSync(attachment.storagePath)) {
      fs.unlinkSync(attachment.storagePath);
    }

    return this.prisma.billAttachment.delete({ where: { id: attachmentId } });
  }

  async getAttachmentFile(billId: string, attachmentId: string, organizationId: string) {
    const bill = await this.prisma.bill.findFirst({ where: { id: billId, organizationId } });
    if (!bill) throw new NotFoundException(`Bill ${billId} not found`);

    const attachment = await this.prisma.billAttachment.findFirst({
      where: { id: attachmentId, billId },
    });
    if (!attachment) throw new NotFoundException(`Attachment ${attachmentId} not found`);

    if (!fs.existsSync(attachment.storagePath)) {
      throw new NotFoundException('File not found on storage');
    }

    return {
      buffer: fs.readFileSync(attachment.storagePath),
      filename: attachment.filename,
      mimeType: attachment.mimeType,
    };
  }
}
