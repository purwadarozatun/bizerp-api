import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { StockService } from './stock.service';
export declare class StockController {
    private readonly stock;
    constructor(stock: StockService);
    getStockLevels(user: JwtPayload): Promise<({
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
    getLowStock(user: JwtPayload): Promise<({
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
    adjustStock(body: {
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
//# sourceMappingURL=stock.controller.d.ts.map