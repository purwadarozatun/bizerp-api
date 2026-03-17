/**
 * Format a date to ISO date string (YYYY-MM-DD)
 */
export declare function toISODate(date: Date): string;
/**
 * Get the start of a fiscal year given a year and fiscal start month (1-indexed)
 */
export declare function fiscalYearStart(year: number, startMonth?: number): Date;
/**
 * Get the end of a fiscal year
 */
export declare function fiscalYearEnd(year: number, startMonth?: number): Date;
/**
 * Check if a date is overdue (before today)
 */
export declare function isOverdue(date: Date | string): boolean;
/**
 * Add days to a date
 */
export declare function addDays(date: Date, days: number): Date;
//# sourceMappingURL=date.d.ts.map