import { PrismaClient } from '@bis/database';
interface SalesOrderLine {
    productId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
}
export declare class SalesOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, status?: string, page?: number, pageSize?: number): Promise<{
        data: ({
            contact: {
                id: string;
                address: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                email: string | null;
                firstName: string | null;
                lastName: string | null;
                type: string;
                notes: string | null;
                company: string | null;
                phone: string | null;
                website: string | null;
                tags: string[];
                isCustomer: boolean;
                isVendor: boolean;
            };
            lines: ({
                product: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    organizationId: string;
                    isActive: boolean;
                    description: string | null;
                    sku: string;
                    categoryId: string | null;
                    unitOfMeasure: string;
                    costPrice: import("@prisma/client/runtime/library").Decimal;
                    salePrice: import("@prisma/client/runtime/library").Decimal;
                    trackInventory: boolean;
                    reorderPoint: number;
                };
            } & {
                id: string;
                description: string | null;
                total: import("@prisma/client/runtime/library").Decimal;
                productId: string;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                salesOrderId: string;
                fulfilled: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            number: string;
            id: string;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            date: Date;
            status: string;
            contactId: string;
            notes: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, organizationId: string): Promise<{
        contact: {
            id: string;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            type: string;
            notes: string | null;
            company: string | null;
            phone: string | null;
            website: string | null;
            tags: string[];
            isCustomer: boolean;
            isVendor: boolean;
        };
        lines: ({
            product: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                isActive: boolean;
                description: string | null;
                sku: string;
                categoryId: string | null;
                unitOfMeasure: string;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                salePrice: import("@prisma/client/runtime/library").Decimal;
                trackInventory: boolean;
                reorderPoint: number;
            };
        } & {
            id: string;
            description: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            salesOrderId: string;
            fulfilled: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        date: Date;
        status: string;
        contactId: string;
        notes: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(organizationId: string, data: {
        contactId: string;
        date: Date;
        currency?: string;
        notes?: string;
        lines: SalesOrderLine[];
    }): Promise<{
        contact: {
            id: string;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            type: string;
            notes: string | null;
            company: string | null;
            phone: string | null;
            website: string | null;
            tags: string[];
            isCustomer: boolean;
            isVendor: boolean;
        };
        lines: ({
            product: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                isActive: boolean;
                description: string | null;
                sku: string;
                categoryId: string | null;
                unitOfMeasure: string;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                salePrice: import("@prisma/client/runtime/library").Decimal;
                trackInventory: boolean;
                reorderPoint: number;
            };
        } & {
            id: string;
            description: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            salesOrderId: string;
            fulfilled: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        date: Date;
        status: string;
        contactId: string;
        notes: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
    }>;
    fulfill(id: string, organizationId: string, warehouseId: string, fulfillments: Array<{
        lineId: string;
        quantity: number;
    }>): Promise<{
        contact: {
            id: string;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            type: string;
            notes: string | null;
            company: string | null;
            phone: string | null;
            website: string | null;
            tags: string[];
            isCustomer: boolean;
            isVendor: boolean;
        };
        lines: ({
            product: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                isActive: boolean;
                description: string | null;
                sku: string;
                categoryId: string | null;
                unitOfMeasure: string;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                salePrice: import("@prisma/client/runtime/library").Decimal;
                trackInventory: boolean;
                reorderPoint: number;
            };
        } & {
            id: string;
            description: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            salesOrderId: string;
            fulfilled: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        date: Date;
        status: string;
        contactId: string;
        notes: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateStatus(id: string, organizationId: string, status: string): Promise<{
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        date: Date;
        status: string;
        contactId: string;
        notes: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
    }>;
}
export {};
//# sourceMappingURL=sales-orders.service.d.ts.map