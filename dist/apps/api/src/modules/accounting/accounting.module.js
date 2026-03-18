"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingModule = void 0;
const common_1 = require("@nestjs/common");
const accounts_controller_1 = require("./accounts.controller");
const accounts_service_1 = require("./accounts.service");
const journals_controller_1 = require("./journals.controller");
const journals_service_1 = require("./journals.service");
const invoices_controller_1 = require("./invoices.controller");
const invoices_service_1 = require("./invoices.service");
const bills_controller_1 = require("./bills.controller");
const bills_service_1 = require("./bills.service");
const bill_attachments_service_1 = require("./bill-attachments.service");
const bill_expense_service_1 = require("./bill-expense.service");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const currency_controller_1 = require("./currency.controller");
const currency_service_1 = require("./currency.service");
const overdue_service_1 = require("./overdue.service");
const pdf_service_1 = require("./pdf.service");
const crm_module_1 = require("../crm/crm.module");
const chart_of_accounts_controller_1 = require("./chart-of-accounts.controller");
const chart_of_accounts_service_1 = require("./chart-of-accounts.service");
const journal_configuration_controller_1 = require("./journal-configuration.controller");
const journal_configuration_service_1 = require("./journal-configuration.service");
const auto_journal_service_1 = require("./auto-journal.service");
const reconciliation_controller_1 = require("./reconciliation.controller");
const reconciliation_service_1 = require("./reconciliation.service");
let AccountingModule = class AccountingModule {
};
exports.AccountingModule = AccountingModule;
exports.AccountingModule = AccountingModule = __decorate([
    (0, common_1.Module)({
        imports: [crm_module_1.CrmModule],
        controllers: [
            accounts_controller_1.AccountsController,
            journals_controller_1.JournalsController,
            invoices_controller_1.InvoicesController,
            bills_controller_1.BillsController,
            payments_controller_1.PaymentsController,
            reports_controller_1.ReportsController,
            currency_controller_1.CurrencyController,
            chart_of_accounts_controller_1.ChartOfAccountsController,
            journal_configuration_controller_1.JournalConfigurationController,
            journal_configuration_controller_1.JournalTriggerRulesController,
            journal_configuration_controller_1.JournalTaxMappingsController,
            reconciliation_controller_1.ReconciliationController,
        ],
        providers: [
            accounts_service_1.AccountsService,
            journals_service_1.JournalsService,
            invoices_service_1.InvoicesService,
            bills_service_1.BillsService,
            bill_attachments_service_1.BillAttachmentsService,
            bill_expense_service_1.BillExpenseService,
            payments_service_1.PaymentsService,
            reports_service_1.ReportsService,
            currency_service_1.CurrencyService,
            overdue_service_1.OverdueService,
            pdf_service_1.PdfService,
            chart_of_accounts_service_1.ChartOfAccountsService,
            journal_configuration_service_1.JournalConfigurationService,
            auto_journal_service_1.AutoJournalService,
            reconciliation_service_1.ReconciliationService,
        ],
        exports: [accounts_service_1.AccountsService, currency_service_1.CurrencyService, overdue_service_1.OverdueService, auto_journal_service_1.AutoJournalService],
    })
], AccountingModule);
//# sourceMappingURL=accounting.module.js.map