import { PrismaClient } from '@bis/database';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(): Promise<({
        _count: {
            products: number;
        };
        children: {
            name: string;
            id: string;
            createdAt: Date;
            parentId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        products: {
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
        }[];
        children: {
            name: string;
            id: string;
            createdAt: Date;
            parentId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        parentId: string | null;
    }>;
    create(data: {
        name: string;
        parentId?: string;
    }): Promise<{
        parent: {
            name: string;
            id: string;
            createdAt: Date;
            parentId: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        parentId: string | null;
    }>;
    update(id: string, data: Partial<{
        name: string;
        parentId: string;
    }>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        parentId: string | null;
    }>;
}
//# sourceMappingURL=categories.service.d.ts.map