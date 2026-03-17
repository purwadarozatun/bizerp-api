import { PrismaClient } from '@bis/database';
export declare class InvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, status?: string, page?: number, pageSize?: number): Promise<{
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
            lines: {
                id: string;
                createdAt: Date;
                description: string;
                total: import("@prisma/client/runtime/library").Decimal;
                accountId: string | null;
                invoiceId: string;
                productId: string | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                taxRate: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            number: string;
            id: string;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            date: Date;
            status: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            contactId: string;
            dueDate: Date;
            notes: string | null;
            terms: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, organizationId: string): Promise<{
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
            account: {
                name: string;
                id: string;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                isActive: boolean;
                code: string;
                type: string;
                subtype: string | null;
                description: string | null;
                parentId: string | null;
            } | null;
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            description: string;
            total: import("@prisma/client/runtime/library").Decimal;
            accountId: string | null;
            invoiceId: string;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
        })[];
        payments: {
            id: string;
            currency: string;
            createdAt: Date;
            date: Date;
            reference: string | null;
            notes: string | null;
            invoiceId: string | null;
            billId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            method: string;
        }[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        date: Date;
        status: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        contactId: string;
        dueDate: Date;
        notes: string | null;
        terms: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(organizationId: string, data: {
        contactId: string;
        date: Date;
        dueDate: Date;
        currency?: string;
        notes?: string;
        lines: Array<{
            accountId?: string;
            productId?: string;
            description: string;
            quantity: number;
            unitPrice: number;
            taxRate?: number;
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
        lines: {
            id: string;
            createdAt: Date;
            description: string;
            total: import("@prisma/client/runtime/library").Decimal;
            accountId: string | null;
            invoiceId: string;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        date: Date;
        status: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        contactId: string;
        dueDate: Date;
        notes: string | null;
        terms: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateStatus(id: string, organizationId: string, status: string): Promise<{
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        date: Date;
        status: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        contactId: string;
        dueDate: Date;
        notes: string | null;
        terms: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
}
//# sourceMappingURL=invoices.service.d.ts.map