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
exports.InventoryReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const inventory_reports_service_1 = require("./inventory-reports.service");
let InventoryReportsController = class InventoryReportsController {
    reports;
    constructor(reports) {
        this.reports = reports;
    }
    getStockReport(user) {
        return this.reports.getStockReport(user.organizationId);
    }
    getLowStockReport(user) {
        return this.reports.getLowStockReport(user.organizationId);
    }
    getMovementHistory(user, productId, startDate, endDate, page, pageSize) {
        return this.reports.getMovementHistory(user.organizationId, productId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, page, pageSize);
    }
    getValuation(user, method) {
        return this.reports.getValuation(user.organizationId, method || 'average');
    }
};
exports.InventoryReportsController = InventoryReportsController;
__decorate([
    (0, common_1.Get)('stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Stock levels report by product and warehouse' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryReportsController.prototype, "getStockReport", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Products below reorder point' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryReportsController.prototype, "getLowStockReport", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, swagger_1.ApiOperation)({ summary: 'Stock movement history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], InventoryReportsController.prototype, "getMovementHistory", null);
__decorate([
    (0, common_1.Get)('valuation'),
    (0, swagger_1.ApiOperation)({ summary: 'Inventory valuation report (FIFO, LIFO, or average cost)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InventoryReportsController.prototype, "getValuation", null);
exports.InventoryReportsController = InventoryReportsController = __decorate([
    (0, swagger_1.ApiTags)('inventory/reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('inventory/reports'),
    __metadata("design:paramtypes", [inventory_reports_service_1.InventoryReportsService])
], InventoryReportsController);
//# sourceMappingURL=inventory-reports.controller.js.map