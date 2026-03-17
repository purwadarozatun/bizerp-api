"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.isValidCurrencyCode = isValidCurrencyCode;
exports.isValidAmount = isValidAmount;
/**
 * Validate an email address
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/**
 * Validate a URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Check if a string is a valid ISO 4217 currency code
 */
function isValidCurrencyCode(code) {
    return /^[A-Z]{3}$/.test(code);
}
/**
 * Validate that amount is a non-negative finite number
 */
function isValidAmount(amount) {
    return typeof amount === 'number' && isFinite(amount) && amount >= 0;
}
//# sourceMappingURL=validation.js.map