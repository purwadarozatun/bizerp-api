import { Module } from '@nestjs/common';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { BillAttachmentsService } from './bill-attachments.service';
import { BillExpenseService } from './bill-expense.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { OverdueService } from './overdue.service';
import { PdfService } from './pdf.service';
import { CrmModule } from '../crm/crm.module';
import { ChartOfAccountsController } from './chart-of-accounts.controller';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import {
  JournalConfigurationController,
  JournalTriggerRulesController,
  JournalTaxMappingsController,
} from './journal-configuration.controller';
import { JournalConfigurationService } from './journal-configuration.service';
import { AutoJournalService } from './auto-journal.service';
import { ReconciliationController } from './reconciliation.controller';
import { ReconciliationService } from './reconciliation.service';

@Module({
  imports: [CrmModule],
  controllers: [
    AccountsController,
    JournalsController,
    InvoicesController,
    BillsController,
    PaymentsController,
    ReportsController,
    CurrencyController,
    ChartOfAccountsController,
    JournalConfigurationController,
    JournalTriggerRulesController,
    JournalTaxMappingsController,
    ReconciliationController,
  ],
  providers: [
    AccountsService,
    JournalsService,
    InvoicesService,
    BillsService,
    BillAttachmentsService,
    BillExpenseService,
    PaymentsService,
    ReportsService,
    CurrencyService,
    OverdueService,
    PdfService,
    ChartOfAccountsService,
    JournalConfigurationService,
    AutoJournalService,
    ReconciliationService,
  ],
  exports: [AccountsService, CurrencyService, OverdueService, AutoJournalService],
})
export class AccountingModule {}
