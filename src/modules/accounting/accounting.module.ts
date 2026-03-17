import { Module } from '@nestjs/common';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { OverdueService } from './overdue.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [
    AccountsController,
    JournalsController,
    InvoicesController,
    BillsController,
    PaymentsController,
    ReportsController,
    CurrencyController,
  ],
  providers: [
    AccountsService,
    JournalsService,
    InvoicesService,
    BillsService,
    PaymentsService,
    ReportsService,
    CurrencyService,
    OverdueService,
    PdfService,
  ],
  exports: [AccountsService, CurrencyService, OverdueService],
})
export class AccountingModule {}
