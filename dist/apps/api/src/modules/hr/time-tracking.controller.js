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
exports.TimeTrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const time_tracking_service_1 = require("./time-tracking.service");
let TimeTrackingController = class TimeTrackingController {
    time;
    constructor(time) {
        this.time = time;
    }
    findAll(user, employeeId, startDate, endDate, page, pageSize) {
        return this.time.findAll(user.organizationId, employeeId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, page, pageSize);
    }
    getSummary(user, employeeId, year, month) {
        return this.time.getSummary(user.organizationId, employeeId, year, month);
    }
    create(body) {
        return this.time.create({ ...body, date: new Date(body.date) });
    }
    update(id, body) {
        return this.time.update(id, { ...body, date: body.date ? new Date(body.date) : undefined });
    }
};
exports.TimeTrackingController = TimeTrackingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List time entries' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], TimeTrackingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Monthly time summary for an employee' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", void 0)
], TimeTrackingController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Log a time entry' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeTrackingController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimeTrackingController.prototype, "update", null);
exports.TimeTrackingController = TimeTrackingController = __decorate([
    (0, swagger_1.ApiTags)('hr/time'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('hr/time'),
    __metadata("design:paramtypes", [time_tracking_service_1.TimeTrackingService])
], TimeTrackingController);
//# sourceMappingURL=time-tracking.controller.js.map