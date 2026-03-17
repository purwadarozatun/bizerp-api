"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
/**
 * Basic multi-currency service.
 *
 * For MVP, rates are manually managed by the org or fetched from a free
 * exchange-rate API. In production, connect to an FX provider.
 */
let CurrencyService = class CurrencyService {
    // In-memory rate cache (base: USD). Replace with DB-backed rates in prod.
    rates = new Map([
        ['USD', 1],
        ['EUR', 0.92],
        ['GBP', 0.79],
        ['CAD', 1.36],
        ['AUD', 1.53],
        ['JPY', 149.5],
        ['CHF', 0.90],
        ['CNY', 7.24],
        ['INR', 83.1],
        ['MXN', 17.2],
    ]);
    /**
     * Get exchange rate from `from` to `to` currency.
     * Falls back to 1 if either currency is unknown.
     */
    getRate(from, to) {
        if (from === to)
            return 1;
        const fromRate = this.rates.get(from) ?? 1;
        const toRate = this.rates.get(to) ?? 1;
        return toRate / fromRate;
    }
    /**
     * Convert an amount between currencies.
     */
    convert(amount, from, to) {
        return Math.round(amount * this.getRate(from, to) * 100) / 100;
    }
    /**
     * List all supported currencies with their USD rate.
     */
    getSupportedCurrencies() {
        return Array.from(this.rates.entries()).map(([code, rate]) => ({ code, rateToUsd: rate }));
    }
    /**
     * Update a rate (admin only in production — add RBAC guard).
     */
    setRate(currency, rateToUsd) {
        this.rates.set(currency.toUpperCase(), rateToUsd);
        return { currency: currency.toUpperCase(), rateToUsd };
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)()
], CurrencyService);
//# sourceMappingURL=currency.service.js.map