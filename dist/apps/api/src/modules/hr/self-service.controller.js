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
exports.SelfServiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const self_service_service_1 = require("./self-service.service");
let SelfServiceController = class SelfServiceController {
    selfService;
    constructor(selfService) {
        this.selfService = selfService;
    }
    getProfile(employeeId, user) {
        return this.selfService.getMyProfile(employeeId, user.organizationId);
    }
    updateProfile(employeeId, user, body) {
        return this.selfService.updateMyProfile(employeeId, user.organizationId, body);
    }
    getLeaveRequests(employeeId, page, pageSize) {
        return this.selfService.getMyLeaveRequests(employeeId, page, pageSize);
    }
    getLeaveBalance(employeeId) {
        return this.selfService.getLeaveBalance(employeeId);
    }
    getTimeEntries(employeeId, year, month) {
        return this.selfService.getMyTimeEntries(employeeId, year, month);
    }
};
exports.SelfServiceController = SelfServiceController;
__decorate([
    (0, common_1.Get)(':employeeId/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get own employee profile (self-service)' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SelfServiceController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)(':employeeId/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update contact info (phone, address)' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SelfServiceController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(':employeeId/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'My leave requests' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], SelfServiceController.prototype, "getLeaveRequests", null);
__decorate([
    (0, common_1.Get)(':employeeId/leave/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'My leave balances for the current year' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SelfServiceController.prototype, "getLeaveBalance", null);
__decorate([
    (0, common_1.Get)(':employeeId/time'),
    (0, swagger_1.ApiOperation)({ summary: 'My time entries for a given month' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], SelfServiceController.prototype, "getTimeEntries", null);
exports.SelfServiceController = SelfServiceController = __decorate([
    (0, swagger_1.ApiTags)('hr/self-service'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('hr/self-service'),
    __metadata("design:paramtypes", [self_service_service_1.SelfServiceService])
], SelfServiceController);
//# sourceMappingURL=self-service.controller.js.map