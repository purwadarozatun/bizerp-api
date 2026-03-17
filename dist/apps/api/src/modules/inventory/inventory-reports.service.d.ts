import { PrismaClient } from '@bis/database';
export type ValuationMethod = 'average' | 'fifo' | 'lifo';
export declare class InventoryReportsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getStockReport(organizationId: string): Promise<{
        product: {
            category: {
                name: string;
                id: string;
                createdAt: Date;
                parentId: string | null;
            } | null;
        } & {
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
        quantity: number;
        value: number;
    }[]>;
    getLowStockReport(organizationId: string): Promise<{
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
        currentQuantity: number;
        reorderPoint: number;
        deficit: number;
    }[]>;
    getMovementHistory(organizationId: string, productId?: string, startDate?: Date, endDate?: Date, page?: number, pageSize?: number): Promise<{
        data: ({
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
            createdAt: Date;
            type: string;
            reference: string | null;
            notes: string | null;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            warehouseId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getValuation(organizationId: string, method?: ValuationMethod): Promise<{
        valuations: {
            product: {
                id: string;
                sku: string;
                name: string;
            };
            totalQuantity: number;
            valuationMethod: ValuationMethod;
            unitCost: number;
            totalValue: number;
        }[];
        grandTotal: number;
        method: ValuationMethod;
    }>;
    private calculateValuation;
    private valueLayers;
}
//# sourceMappingURL=inventory-reports.service.d.ts.map