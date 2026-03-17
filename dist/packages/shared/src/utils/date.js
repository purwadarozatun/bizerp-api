"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toISODate = toISODate;
exports.fiscalYearStart = fiscalYearStart;
exports.fiscalYearEnd = fiscalYearEnd;
exports.isOverdue = isOverdue;
exports.addDays = addDays;
/**
 * Format a date to ISO date string (YYYY-MM-DD)
 */
function toISODate(date) {
    return date.toISOString().split('T')[0];
}
/**
 * Get the start of a fiscal year given a year and fiscal start month (1-indexed)
 */
function fiscalYearStart(year, startMonth = 1) {
    return new Date(Date.UTC(year, startMonth - 1, 1));
}
/**
 * Get the end of a fiscal year
 */
function fiscalYearEnd(year, startMonth = 1) {
    // Last day = day before the start of the next fiscal year
    return new Date(Date.UTC(year + 1, startMonth - 1, 1) - 86400000);
}
/**
 * Check if a date is overdue (before today)
 */
function isOverdue(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
}
/**
 * Add days to a date
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
//# sourceMappingURL=date.js.map