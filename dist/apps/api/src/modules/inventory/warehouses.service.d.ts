import { PrismaClient } from '@bis/database';
import { Prisma } from '@prisma/client';
export declare class WarehousesService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string): Promise<({
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
    findOne(id: string, organizationId: string): Promise<{
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
    create(organizationId: string, data: {
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
    update(id: string, organizationId: string, data: Partial<{
        name: string;
        address: Prisma.InputJsonValue;
        isActive: boolean;
    }>): Promise<{
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
//# sourceMappingURL=warehouses.service.d.ts.map