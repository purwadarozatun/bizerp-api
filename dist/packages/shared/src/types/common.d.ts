export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
}
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}
export type SortOrder = 'asc' | 'desc';
export interface QueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
    search?: string;
}
export type Currency = string;
export type ISODate = string;
export interface Money {
    amount: number;
    currency: Currency;
}
export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}
export interface ContactInfo {
    email?: string;
    phone?: string;
    website?: string;
}
//# sourceMappingURL=common.d.ts.map