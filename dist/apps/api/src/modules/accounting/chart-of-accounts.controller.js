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
exports.ChartOfAccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const chart_of_accounts_service_1 = require("./chart-of-accounts.service");
let ChartOfAccountsController = class ChartOfAccountsController {
    coaService;
    constructor(coaService) {
        this.coaService = coaService;
    }
    // ─── Chart of Accounts ───────────────────────────────────────────────────
    findAll(user, active) {
        const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
        return this.coaService.findAll(user.organizationId, isActive);
    }
    create(user, body) {
        return this.coaService.create(user.organizationId, body, user.role);
    }
    update(id, user, body) {
        return this.coaService.update(id, user.organizationId, body);
    }
    deactivate(id, user) {
        return this.coaService.deactivate(id, user.organizationId);
    }
    // ─── Category CoA Mappings ───────────────────────────────────────────────
    findMappings(user, documentType) {
        return this.coaService.findCategoryMappings(user.organizationId, documentType);
    }
    setMapping(user, body) {
        return this.coaService.setCategoryMapping(user.organizationId, body);
    }
    // ─── System Account Configs ──────────────────────────────────────────────
    getSystemAccounts(user) {
        return this.coaService.getSystemAccounts(user.organizationId);
    }
    updateSystemAccount(user, body) {
        return this.coaService.updateSystemAccount(user.organizationId, body.accountType, body.accountId, user.role);
    }
};
exports.ChartOfAccountsController = ChartOfAccountsController;
__decorate([
    (0, common_1.Get)('chart-of-accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'List all accounts in chart of accounts' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('chart-of-accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an account (Super Admin)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('chart-of-accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('chart-of-accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate an account (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Get)('coa-mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'List category-to-account mappings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('documentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "findMappings", null);
__decorate([
    (0, common_1.Post)('coa-mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'Set default category-to-account mapping' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "setMapping", null);
__decorate([
    (0, common_1.Get)('system-accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system account configuration' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "getSystemAccounts", null);
__decorate([
    (0, common_1.Put)('system-accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Update system accounts (Super Admin only)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChartOfAccountsController.prototype, "updateSystemAccount", null);
exports.ChartOfAccountsController = ChartOfAccountsController = __decorate([
    (0, swagger_1.ApiTags)('accounting/chart-of-accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('accounting'),
    __metadata("design:paramtypes", [chart_of_accounts_service_1.ChartOfAccountsService])
], ChartOfAccountsController);
//# sourceMappingURL=chart-of-accounts.controller.js.map