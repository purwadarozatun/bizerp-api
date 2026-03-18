import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JournalsService } from './journals.service';
export declare class JournalsController {
    private readonly journals;
    constructor(journals: JournalsService);
    findAll(user: JwtPayload, referenceId?: string, referenceType?: string, page?: string, pageSize?: string): Promise<{
        data: {
            entryNumber: string;
            totalDebit: number;
            totalCredit: number;
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
                    isSystemAccount: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                type: string;
                description: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                accountId: string;
                journalEntryId: string;
                debit: import("@prisma/client/runtime/library").Decimal;
                credit: import("@prisma/client/runtime/library").Decimal;
            })[];
            number: string;
            id: string;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            description: string;
            referenceId: string | null;
            referenceType: string | null;
            date: Date;
            status: string;
            source: string;
            reference: string | null;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            createdByUserId: string | null;
            voidReason: string | null;
            reversalOfId: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, user: JwtPayload): Promise<{
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
                isSystemAccount: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            accountId: string;
            journalEntryId: string;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        referenceId: string | null;
        referenceType: string | null;
        date: Date;
        status: string;
        source: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        createdByUserId: string | null;
        voidReason: string | null;
        reversalOfId: string | null;
    }>;
    create(user: JwtPayload, body: {
        date: string;
        description: string;
        reference?: string;
        currency?: string;
        referenceId?: string;
        referenceType?: 'INVOICE' | 'BILL';
        lines: Array<{
            accountId: string;
            type: 'DEBIT' | 'CREDIT';
            amount: number;
            description?: string;
        }>;
    }): Promise<{
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
                isSystemAccount: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            accountId: string;
            journalEntryId: string;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        referenceId: string | null;
        referenceType: string | null;
        date: Date;
        status: string;
        source: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        createdByUserId: string | null;
        voidReason: string | null;
        reversalOfId: string | null;
    }>;
    update(id: string, user: JwtPayload, body: {
        date?: string;
        description?: string;
        reference?: string;
        currency?: string;
        lines?: Array<{
            accountId: string;
            type: 'DEBIT' | 'CREDIT';
            amount: number;
            description?: string;
        }>;
    }): Promise<{
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
                isSystemAccount: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            accountId: string;
            journalEntryId: string;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        referenceId: string | null;
        referenceType: string | null;
        date: Date;
        status: string;
        source: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        createdByUserId: string | null;
        voidReason: string | null;
        reversalOfId: string | null;
    }>;
    post(id: string, user: JwtPayload): Promise<{
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
                isSystemAccount: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            accountId: string;
            journalEntryId: string;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        referenceId: string | null;
        referenceType: string | null;
        date: Date;
        status: string;
        source: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        createdByUserId: string | null;
        voidReason: string | null;
        reversalOfId: string | null;
    }>;
    void(id: string, user: JwtPayload, body: {
        reason: string;
    }): Promise<{
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
                isSystemAccount: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            accountId: string;
            journalEntryId: string;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        referenceId: string | null;
        referenceType: string | null;
        date: Date;
        status: string;
        source: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        createdByUserId: string | null;
        voidReason: string | null;
        reversalOfId: string | null;
    }>;
    delete(id: string, user: JwtPayload): Promise<{
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        referenceId: string | null;
        referenceType: string | null;
        date: Date;
        status: string;
        source: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        createdByUserId: string | null;
        voidReason: string | null;
        reversalOfId: string | null;
    }>;
    createReversal(id: string, user: JwtPayload): Promise<{
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
                isSystemAccount: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            accountId: string;
            journalEntryId: string;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        referenceId: string | null;
        referenceType: string | null;
        date: Date;
        status: string;
        source: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        createdByUserId: string | null;
        voidReason: string | null;
        reversalOfId: string | null;
    }>;
}
//# sourceMappingURL=journals.controller.d.ts.map