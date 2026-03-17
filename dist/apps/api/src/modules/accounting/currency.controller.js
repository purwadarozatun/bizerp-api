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
exports.CurrencyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const currency_service_1 = require("./currency.service");
let CurrencyController = class CurrencyController {
    currency;
    constructor(currency) {
        this.currency = currency;
    }
    list() {
        return this.currency.getSupportedCurrencies();
    }
    rate(body) {
        const rate = this.currency.getRate(body.from, body.to);
        return { from: body.from, to: body.to, rate };
    }
    setRate(body) {
        return this.currency.setRate(body.currency, body.rateToUsd);
    }
};
exports.CurrencyController = CurrencyController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List supported currencies and their USD rates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('rate'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exchange rate between two currencies' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "rate", null);
__decorate([
    (0, common_1.Post)('rate'),
    (0, swagger_1.ApiOperation)({ summary: 'Update exchange rate (USD base)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "setRate", null);
exports.CurrencyController = CurrencyController = __decorate([
    (0, swagger_1.ApiTags)('accounting/currencies'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('accounting/currencies'),
    __metadata("design:paramtypes", [currency_service_1.CurrencyService])
], CurrencyController);
//# sourceMappingURL=currency.controller.js.map