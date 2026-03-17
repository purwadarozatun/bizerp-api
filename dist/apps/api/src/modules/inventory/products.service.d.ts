import { PrismaClient } from '@bis/database';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, search?: string, page?: number, pageSize?: number): Promise<{
        data: ({
            stockLevels: ({
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
            })[];
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
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, organizationId: string): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            parentId: string | null;
        } | null;
        stockLevels: ({
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
        })[];
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
    }>;
    create(organizationId: string, data: {
        sku: string;
        name: string;
        description?: string;
        categoryId?: string;
        unitOfMeasure?: string;
        costPrice?: number;
        salePrice?: number;
        reorderPoint?: number;
        trackInventory?: boolean;
    }): Promise<{
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
    }>;
    update(id: string, organizationId: string, data: Partial<{
        name: string;
        description: string;
        costPrice: number;
        salePrice: number;
        reorderPoint: number;
        isActive: boolean;
    }>): Promise<{
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
    }>;
}
//# sourceMappingURL=products.service.d.ts.map