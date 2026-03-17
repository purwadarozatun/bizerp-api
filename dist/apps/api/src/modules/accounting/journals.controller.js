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
exports.JournalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const journals_service_1 = require("./journals.service");
let JournalsController = class JournalsController {
    journals;
    constructor(journals) {
        this.journals = journals;
    }
    findAll(user, page, pageSize) {
        return this.journals.findAll(user.organizationId, page, pageSize);
    }
    create(user, body) {
        return this.journals.create(user.organizationId, { ...body, date: new Date(body.date) });
    }
    post(id, user) {
        return this.journals.post(id, user.organizationId);
    }
    void(id, user) {
        return this.journals.void(id, user.organizationId);
    }
};
exports.JournalsController = JournalsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List journal entries' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], JournalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a journal entry' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], JournalsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/post'),
    (0, swagger_1.ApiOperation)({ summary: 'Post a draft journal entry' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JournalsController.prototype, "post", null);
__decorate([
    (0, common_1.Patch)(':id/void'),
    (0, swagger_1.ApiOperation)({ summary: 'Void a journal entry' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JournalsController.prototype, "void", null);
exports.JournalsController = JournalsController = __decorate([
    (0, swagger_1.ApiTags)('accounting/journals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('accounting/journals'),
    __metadata("design:paramtypes", [journals_service_1.JournalsService])
], JournalsController);
//# sourceMappingURL=journals.controller.js.map