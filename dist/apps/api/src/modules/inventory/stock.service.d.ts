import { PrismaClient } from '@bis/database';
export declare class StockService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getStockLevels(organizationId: string): Promise<({
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
        warehouse: {
            name: string;
            id: string;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            isActive: boolean;
            code: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        productId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        warehouseId: string;
    })[]>;
    getLowStock(organizationId: string): Promise<({
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
        warehouse: {
            name: string;
            id: string;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            isActive: boolean;
            code: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        productId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        warehouseId: string;
    })[]>;
    adjustStock(data: {
        productId: string;
        warehouseId: string;
        quantity: number;
        type: string;
        reference?: string;
        notes?: string;
        unitCost?: number;
    }): Promise<{
        id: string;
        updatedAt: Date;
        productId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        warehouseId: string;
    }>;
    getMovements(productId: string, page?: number, pageSize?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: string;
            reference: string | null;
            notes: string | null;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            warehouseId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=stock.service.d.ts.map