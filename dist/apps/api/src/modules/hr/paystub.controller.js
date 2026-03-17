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
exports.PaystubController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const paystub_service_1 = require("./paystub.service");
let PaystubController = class PaystubController {
    paystubs;
    constructor(paystubs) {
        this.paystubs = paystubs;
    }
    listByEmployee(employeeId, user) {
        return this.paystubs.listByEmployee(employeeId, user.organizationId);
    }
    getPaystub(payrollId, employeeId, user) {
        return this.paystubs.getPaystub(payrollId, employeeId, user.organizationId);
    }
    async getPaystubHtml(payrollId, employeeId, user, res) {
        const html = await this.paystubs.generateHtml(payrollId, employeeId, user.organizationId);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
};
exports.PaystubController = PaystubController;
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'List pay stubs for an employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaystubController.prototype, "listByEmployee", null);
__decorate([
    (0, common_1.Get)(':payrollId/employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pay stub data' }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PaystubController.prototype, "getPaystub", null);
__decorate([
    (0, common_1.Get)(':payrollId/employee/:employeeId/html'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pay stub as HTML (printable)' }),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaystubController.prototype, "getPaystubHtml", null);
exports.PaystubController = PaystubController = __decorate([
    (0, swagger_1.ApiTags)('hr/paystubs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('hr/paystubs'),
    __metadata("design:paramtypes", [paystub_service_1.PaystubService])
], PaystubController);
//# sourceMappingURL=paystub.controller.js.map