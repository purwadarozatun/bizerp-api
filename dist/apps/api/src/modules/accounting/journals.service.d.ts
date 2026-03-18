import { PrismaClient } from '@bis/database';
interface CreateJournalLineDto {
    accountId: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
    description?: string;
}
interface CreateJournalDto {
    date: Date;
    description: string;
    reference?: string;
    currency?: string;
    referenceId?: string;
    referenceType?: 'INVOICE' | 'BILL';
    source?: 'SYSTEM' | 'MANUAL';
    createdByUserId?: string;
    lines: CreateJournalLineDto[];
}
export declare class JournalsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, referenceId?: string, referenceType?: string, page?: number, pageSize?: number): Promise<{
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
    findOne(id: string, organizationId: string): Promise<{
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
    create(organizationId: string, dto: CreateJournalDto): Promise<{
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
    update(id: string, organizationId: string, dto: Partial<CreateJournalDto>): Promise<{
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
    post(id: string, organizationId: string): Promise<{
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
    void(id: string, organizationId: string, reason: string): Promise<{
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
    delete(id: string, organizationId: string): Promise<{
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
    /**
     * Internal: create a journal entry from the auto-journal service (source=SYSTEM)
     */
    createSystemEntry(organizationId: string, dto: CreateJournalDto & {
        referenceId: string;
        referenceType: 'INVOICE' | 'BILL';
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
    /**
     * Create a reversal entry for a posted journal entry
     */
    createReversal(id: string, organizationId: string, createdByUserId?: string): Promise<{
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
export {};
//# sourceMappingURL=journals.service.d.ts.map