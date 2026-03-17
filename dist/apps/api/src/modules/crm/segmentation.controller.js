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
exports.SegmentationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const segmentation_service_1 = require("./segmentation.service");
let SegmentationController = class SegmentationController {
    segmentation;
    constructor(segmentation) {
        this.segmentation = segmentation;
    }
    getAllTags(user) {
        return this.segmentation.getAllTags(user.organizationId);
    }
    getByTags(user, tags, matchAll) {
        const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        return this.segmentation.getByTags(user.organizationId, tagList, matchAll === 'true');
    }
    addTags(contactId, body) {
        return this.segmentation.addTags(contactId, body.tags);
    }
    removeTags(contactId, body) {
        return this.segmentation.removeTags(contactId, body.tags);
    }
};
exports.SegmentationController = SegmentationController;
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tags used across contacts' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SegmentationController.prototype, "getAllTags", null);
__decorate([
    (0, common_1.Get)('contacts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contacts by tags (comma-separated, matchAll optional)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('tags')),
    __param(2, (0, common_1.Query)('matchAll')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SegmentationController.prototype, "getByTags", null);
__decorate([
    (0, common_1.Post)('contacts/:contactId/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Add tags to a contact' }),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SegmentationController.prototype, "addTags", null);
__decorate([
    (0, common_1.Delete)('contacts/:contactId/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove tags from a contact' }),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SegmentationController.prototype, "removeTags", null);
exports.SegmentationController = SegmentationController = __decorate([
    (0, swagger_1.ApiTags)('crm/segmentation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('crm/segmentation'),
    __metadata("design:paramtypes", [segmentation_service_1.SegmentationService])
], SegmentationController);
//# sourceMappingURL=segmentation.controller.js.map