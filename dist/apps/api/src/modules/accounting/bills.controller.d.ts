import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { BillsService } from './bills.service';
export declare class BillsController {
    private readonly bills;
    constructor(bills: BillsService);
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
            lines: {
                id: string;
                createdAt: Date;
                description: string;
                total: import("@prisma/client/runtime/library").Decimal;
                accountId: string | null;
                productId: string | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                taxRate: import("@prisma/client/runtime/library").Decimal;
                billId: string;
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
        lines: {
            id: string;
            createdAt: Date;
            description: string;
            total: import("@prisma/client/runtime/library").Decimal;
            accountId: string | null;
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            billId: string;
        }[];
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
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(user: JwtPayload, body: {
        contactId: string;
        date: string;
        dueDate: string;
        currency?: string;
        notes?: string;
        lines: Array<{
            accountId?: string;
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
            productId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            billId: string;
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
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
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
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        contactId: string;
        dueDate: Date;
        notes: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
}
//# sourceMappingURL=bills.controller.d.ts.map