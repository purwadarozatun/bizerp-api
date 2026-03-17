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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    dashboard;
    constructor(dashboard) {
        this.dashboard = dashboard;
    }
    getKpis(user) {
        return this.dashboard.getKpis(user.organizationId);
    }
    getTrends(user, months) {
        return this.dashboard.getTrends(user.organizationId, months ? parseInt(months, 10) : 6);
    }
    getIncomeStatement(user, start, end) {
        const now = new Date();
        const startDate = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = end ? new Date(end) : now;
        return this.dashboard.getIncomeStatement(user.organizationId, startDate, endDate);
    }
    getInventorySummary(user) {
        return this.dashboard.getInventorySummary(user.organizationId);
    }
    getHrSummary(user) {
        return this.dashboard.getHrSummary(user.organizationId);
    }
    getCrmPipeline(user) {
        return this.dashboard.getCrmPipeline(user.organizationId);
    }
    async exportCsv(user, report, res, start, end) {
        const now = new Date();
        const startDate = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = end ? new Date(end) : now;
        const csv = await this.dashboard.exportCsv(user.organizationId, report, startDate, endDate);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${report}.csv"`);
        res.send(csv);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get executive KPI dashboard data' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue/expense trends (last N months)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false, type: Number }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getTrends", null);
__decorate([
    (0, common_1.Get)('reports/income-statement'),
    (0, swagger_1.ApiOperation)({ summary: 'Income statement (P&L) for a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getIncomeStatement", null);
__decorate([
    (0, common_1.Get)('reports/inventory'),
    (0, swagger_1.ApiOperation)({ summary: 'Inventory summary report' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getInventorySummary", null);
__decorate([
    (0, common_1.Get)('reports/hr'),
    (0, swagger_1.ApiOperation)({ summary: 'HR summary report' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getHrSummary", null);
__decorate([
    (0, common_1.Get)('reports/crm-pipeline'),
    (0, swagger_1.ApiOperation)({ summary: 'CRM pipeline by stage' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getCrmPipeline", null);
__decorate([
    (0, common_1.Get)('export/:report'),
    (0, swagger_1.ApiOperation)({ summary: 'Export report as CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('report')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('start')),
    __param(4, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "exportCsv", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map