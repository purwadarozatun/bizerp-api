import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categories;
    constructor(categories: CategoriesService);
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
    create(body: {
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
    update(id: string, body: {
        name?: string;
        parentId?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        parentId: string | null;
    }>;
}
//# sourceMappingURL=categories.controller.d.ts.map