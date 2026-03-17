import { Prisma } from '@prisma/client';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { WarehousesService } from './warehouses.service';
export declare class WarehousesController {
    private readonly warehouses;
    constructor(warehouses: WarehousesService);
    findAll(user: JwtPayload): Promise<({
        _count: {
            stockLevels: number;
        };
    } & {
        name: string;
        id: string;
        address: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isActive: boolean;
        code: string;
    })[]>;
    findOne(id: string, user: JwtPayload): Promise<{
        stockLevels: ({
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
                costPrice: Prisma.Decimal;
                salePrice: Prisma.Decimal;
                trackInventory: boolean;
                reorderPoint: number;
            };
        } & {
            id: string;
            updatedAt: Date;
            productId: string;
            quantity: Prisma.Decimal;
            warehouseId: string;
        })[];
    } & {
        name: string;
        id: string;
        address: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isActive: boolean;
        code: string;
    }>;
    create(user: JwtPayload, body: {
        name: string;
        code: string;
        address?: Prisma.InputJsonValue;
    }): Promise<{
        name: string;
        id: string;
        address: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isActive: boolean;
        code: string;
    }>;
    update(id: string, user: JwtPayload, body: {
        name?: string;
        address?: Prisma.InputJsonValue;
        isActive?: boolean;
    }): Promise<{
        name: string;
        id: string;
        address: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        isActive: boolean;
        code: string;
    }>;
}
//# sourceMappingURL=warehouses.controller.d.ts.map