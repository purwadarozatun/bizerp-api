import { PrismaClient } from '@bis/database';
interface CreateJournalDto {
    date: Date;
    description: string;
    reference?: string;
    currency?: string;
    lines: Array<{
        accountId: string;
        description?: string;
        debit?: number;
        credit?: number;
    }>;
}
export declare class JournalsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, page?: number, pageSize?: number): Promise<{
        data: ({
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
                };
            } & {
                id: string;
                createdAt: Date;
                description: string | null;
                journalEntryId: string;
                accountId: string;
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
            date: Date;
            status: string;
            reference: string | null;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
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
            };
        } & {
            id: string;
            createdAt: Date;
            description: string | null;
            journalEntryId: string;
            accountId: string;
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
        date: Date;
        status: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    post(id: string, organizationId: string): Promise<{
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        date: Date;
        status: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    void(id: string, organizationId: string): Promise<{
        number: string;
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string;
        date: Date;
        status: string;
        reference: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
    }>;
}
export {};
//# sourceMappingURL=journals.service.d.ts.map