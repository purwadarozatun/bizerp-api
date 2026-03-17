"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.roundMoney = roundMoney;
exports.convertCurrency = convertCurrency;
/**
 * Format a number as currency string
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
/**
 * Round to 2 decimal places (for financial calculations)
 */
function roundMoney(amount) {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}
/**
 * Convert amount between currencies using provided rate
 */
function convertCurrency(amount, rate) {
    return roundMoney(amount * rate);
}
//# sourceMappingURL=currency.js.map