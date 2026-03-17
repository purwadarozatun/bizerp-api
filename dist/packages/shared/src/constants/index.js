"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_FILE_TYPES = exports.MAX_FILE_SIZE_MB = exports.REFRESH_TOKEN_EXPIRY = exports.JWT_EXPIRY = exports.INVENTORY_LOW_STOCK_THRESHOLD = exports.TAX_RATES = exports.FISCAL_YEAR_START_MONTH = exports.SUPPORTED_CURRENCIES = exports.DEFAULT_CURRENCY = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = void 0;
exports.DEFAULT_PAGE_SIZE = 25;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_CURRENCY = 'USD';
exports.SUPPORTED_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MXN',
];
exports.FISCAL_YEAR_START_MONTH = 1; // January
exports.TAX_RATES = {
    US_DEFAULT: 0, // Tax-exempt by default; configured per transaction
};
exports.INVENTORY_LOW_STOCK_THRESHOLD = 10;
exports.JWT_EXPIRY = '24h';
exports.REFRESH_TOKEN_EXPIRY = '30d';
exports.MAX_FILE_SIZE_MB = 25;
exports.ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
];
//# sourceMappingURL=index.js.map