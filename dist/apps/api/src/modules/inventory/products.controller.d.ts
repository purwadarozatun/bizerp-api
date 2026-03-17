import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly products;
    constructor(products: ProductsService);
    findAll(user: JwtPayload, search?: string, page?: number, pageSize?: number): Promise<{
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
    findOne(id: string, user: JwtPayload): Promise<{
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
    create(user: JwtPayload, body: {
        sku: string;
        name: string;
        description?: string;
        unit?: string;
        unitOfMeasure?: string;
        costPrice?: number;
        salePrice?: number;
        sellingPrice?: number;
        reorderPoint?: number;
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
    update(id: string, user: JwtPayload, body: {
        name?: string;
        description?: string;
        costPrice?: number;
        salePrice?: number;
        reorderPoint?: number;
        isActive?: boolean;
    }): Promise<{
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
//# sourceMappingURL=products.controller.d.ts.map