import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { BillsService } from './bills.service';
import { BillAttachmentsService } from './bill-attachments.service';
import { BillExpenseService } from './bill-expense.service';

@ApiTags('accounting/bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/bills')
export class BillsController {
  constructor(
    private readonly bills: BillsService,
    private readonly attachments: BillAttachmentsService,
    private readonly billExpense: BillExpenseService,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('vendor') vendor?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
  ) {
    return this.bills.findAll(
      user.organizationId,
      status,
      vendor,
      dateFrom,
      dateTo,
      page ? +page : 1,
      pageSize ? +pageSize : 25,
      sortBy,
      sortDir,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.bills.findOne(id, user.organizationId);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      contactId: string;
      date: string;
      dueDate: string;
      currency?: string;
      expenseCategory?: string;
      referenceNo?: string;
      notes?: string;
      lines: Array<{
        accountId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
      }>;
    },
  ) {
    return this.bills.create(user.organizationId, {
      ...body,
      date: new Date(body.date),
      dueDate: new Date(body.dueDate),
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      contactId?: string;
      date?: string;
      dueDate?: string;
      currency?: string;
      expenseCategory?: string;
      referenceNo?: string;
      notes?: string;
      lines?: Array<{
        accountId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
      }>;
    },
  ) {
    return this.bills.update(id, user.organizationId, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    });
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  submit(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.bills.submitForApproval(id, user.organizationId, user.sub);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.bills.approve(id, user.organizationId, user.sub);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { reason: string },
  ) {
    return this.bills.reject(id, user.organizationId, body.reason, user.sub);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  pay(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      paymentDate: string;
      paymentMethod: string;
      reference?: string;
      notes?: string;
    },
  ) {
    return this.bills.markAsPaid(
      id,
      user.organizationId,
      {
        paymentDate: new Date(body.paymentDate),
        paymentMethod: body.paymentMethod,
        reference: body.reference,
        notes: body.notes,
      },
      user.sub,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.bills.delete(id, user.organizationId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { status: string },
  ) {
    return this.bills.updateStatus(id, user.organizationId, body.status);
  }

  // ─── Expense entries (BIS-82) ─────────────────────────────────────────────

  @Get('expenses')
  getExpenses(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    return this.billExpense.findAll(user.organizationId, status);
  }

  // ─── Attachment endpoints ─────────────────────────────────────────────────

  @Get(':id/attachments')
  getAttachments(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.attachments.getAttachments(id, user.organizationId);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  addAttachment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile()
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  ) {
    return this.attachments.addAttachment(id, user.organizationId, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });
  }

  @Delete(':id/attachments/:fileId')
  @HttpCode(HttpStatus.OK)
  deleteAttachment(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attachments.deleteAttachment(id, fileId, user.organizationId);
  }

  @Get(':id/attachments/:fileId/download')
  async downloadAttachment(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const { buffer, filename, mimeType } = await this.attachments.getAttachmentFile(
      id,
      fileId,
      user.organizationId,
    );
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
