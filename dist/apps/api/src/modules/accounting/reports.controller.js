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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    reports;
    constructor(reports) {
        this.reports = reports;
    }
    profitAndLoss(user, from, to) {
        return this.reports.getProfitAndLoss(user.organizationId, new Date(from), new Date(to));
    }
    balanceSheet(user, asOf) {
        return this.reports.getBalanceSheet(user.organizationId, asOf ? new Date(asOf) : new Date());
    }
    cashFlow(user, from, to) {
        return this.reports.getCashFlow(user.organizationId, new Date(from), new Date(to));
    }
    arAging(user, asOf) {
        return this.reports.getArAging(user.organizationId, asOf ? new Date(asOf) : undefined);
    }
    apAging(user, asOf) {
        return this.reports.getApAging(user.organizationId, asOf ? new Date(asOf) : undefined);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('profit-and-loss'),
    (0, swagger_1.ApiOperation)({ summary: 'Profit & Loss statement' }),
    (0, swagger_1.ApiQuery)({ name: 'from', example: '2026-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', example: '2026-12-31' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "profitAndLoss", null);
__decorate([
    (0, common_1.Get)('balance-sheet'),
    (0, swagger_1.ApiOperation)({ summary: 'Balance Sheet as of a date' }),
    (0, swagger_1.ApiQuery)({ name: 'asOf', required: false, example: '2026-12-31' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "balanceSheet", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Cash Flow statement (indirect method)' }),
    (0, swagger_1.ApiQuery)({ name: 'from', example: '2026-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', example: '2026-12-31' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "cashFlow", null);
__decorate([
    (0, common_1.Get)('ar-aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Accounts Receivable aging report' }),
    (0, swagger_1.ApiQuery)({ name: 'asOf', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "arAging", null);
__decorate([
    (0, common_1.Get)('ap-aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Accounts Payable aging report' }),
    (0, swagger_1.ApiQuery)({ name: 'asOf', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "apAging", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('accounting/reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('accounting/reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map