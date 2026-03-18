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
exports.ReconciliationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const reconciliation_service_1 = require("./reconciliation.service");
let ReconciliationController = class ReconciliationController {
    reconciliationService;
    constructor(reconciliationService) {
        this.reconciliationService = reconciliationService;
    }
    async findAll(user, documentType, status, dateFrom, dateTo, amountMin, amountMax, page, pageSize) {
        return this.reconciliationService.findAll(user.organizationId, {
            documentType,
            status,
            dateFrom,
            dateTo,
            amountMin: amountMin !== undefined ? Number(amountMin) : undefined,
            amountMax: amountMax !== undefined ? Number(amountMax) : undefined,
            page: page !== undefined ? Number(page) : undefined,
            pageSize: pageSize !== undefined ? Number(pageSize) : undefined,
        });
    }
    getSummary(user) {
        return this.reconciliationService.getSummary(user.organizationId);
    }
    getDocumentStatus(documentId, user, documentType) {
        return this.reconciliationService.getDocumentReconciliationStatus(documentId, documentType, user.organizationId);
    }
    flagDiscrepancy(documentId, user, body) {
        return this.reconciliationService.flagDiscrepancy(documentId, body.documentType, user.organizationId, body.note || body.reason || '', user.sub, user.role);
    }
};
exports.ReconciliationController = ReconciliationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List reconciliation records with filters and pagination' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('documentType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('dateFrom')),
    __param(4, (0, common_1.Query)('dateTo')),
    __param(5, (0, common_1.Query)('amountMin')),
    __param(6, (0, common_1.Query)('amountMax')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reconciliation summary totals' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReconciliationController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':documentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reconciliation status for a specific document' }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('documentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ReconciliationController.prototype, "getDocumentStatus", null);
__decorate([
    (0, common_1.Post)(':documentId/flag'),
    (0, swagger_1.ApiOperation)({ summary: 'Flag a document reconciliation discrepancy' }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ReconciliationController.prototype, "flagDiscrepancy", null);
exports.ReconciliationController = ReconciliationController = __decorate([
    (0, swagger_1.ApiTags)('accounting/reconciliation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('accounting/reconciliation'),
    __metadata("design:paramtypes", [reconciliation_service_1.ReconciliationService])
], ReconciliationController);
//# sourceMappingURL=reconciliation.controller.js.map