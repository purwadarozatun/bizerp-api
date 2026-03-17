import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

interface PaymentBody {
  date: string;
  amount: number;
  currency?: string;
  method: string;
  reference?: string;
  notes?: string;
}

@ApiTags('accounting/payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('invoices/:id/payments')
  @ApiOperation({ summary: 'Record a payment against an invoice' })
  payInvoice(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: PaymentBody,
  ) {
    return this.payments.payInvoice(id, user.organizationId, {
      ...body,
      currency: body.currency || 'USD',
      date: new Date(body.date),
    });
  }

  @Get('invoices/:id/payments')
  @ApiOperation({ summary: 'List payments for an invoice' })
  getInvoicePayments(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.payments.getInvoicePayments(id, user.organizationId);
  }

  @Post('bills/:id/payments')
  @ApiOperation({ summary: 'Record a payment against a bill' })
  payBill(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: PaymentBody,
  ) {
    return this.payments.payBill(id, user.organizationId, {
      ...body,
      currency: body.currency || 'USD',
      date: new Date(body.date),
    });
  }

  @Get('bills/:id/payments')
  @ApiOperation({ summary: 'List payments for a bill' })
  getBillPayments(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.payments.getBillPayments(id, user.organizationId);
  }
}
