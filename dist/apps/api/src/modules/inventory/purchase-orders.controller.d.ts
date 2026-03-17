import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PurchaseOrdersService } from './purchase-orders.service';
export declare class PurchaseOrdersController {
    private readonly pos;
    constructor(pos: PurchaseOrdersService);
    findAll(user: JwtPayload, status?: string, page?: number, pageSize?: number): Promise<{
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
                unitCost: import("@prisma/client/runtime/library").Decimal;
                purchaseOrderId: string;
                received: import("@prisma/client/runtime/library").Decimal;
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
            expectedDate: Date | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, user: JwtPayload): Promise<{
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
            unitCost: import("@prisma/client/runtime/library").Decimal;
            purchaseOrderId: string;
            received: import("@prisma/client/runtime/library").Decimal;
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
        expectedDate: Date | null;
    }>;
    create(user: JwtPayload, body: {
        contactId: string;
        date: string;
        expectedDate?: string;
        currency?: string;
        notes?: string;
        lines: Array<{
            productId: string;
            description?: string;
            quantity: number;
            unitCost: number;
        }>;
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
            unitCost: import("@prisma/client/runtime/library").Decimal;
            purchaseOrderId: string;
            received: import("@prisma/client/runtime/library").Decimal;
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
        expectedDate: Date | null;
    }>;
    receive(id: string, user: JwtPayload, body: {
        warehouseId: string;
        receipts: Array<{
            lineId: string;
            quantity: number;
        }>;
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
            unitCost: import("@prisma/client/runtime/library").Decimal;
            purchaseOrderId: string;
            received: import("@prisma/client/runtime/library").Decimal;
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
        expectedDate: Date | null;
    }>;
    updateStatus(id: string, user: JwtPayload, body: {
        status: string;
    }): Promise<{
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
        expectedDate: Date | null;
    }>;
}
//# sourceMappingURL=purchase-orders.controller.d.ts.map