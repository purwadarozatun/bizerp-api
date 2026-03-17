import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JournalsService } from './journals.service';
export declare class JournalsController {
    private readonly journals;
    constructor(journals: JournalsService);
    findAll(user: JwtPayload, page?: number, pageSize?: number): Promise<{
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
    create(user: JwtPayload, body: {
        date: string;
        description: string;
        reference?: string;
        currency?: string;
        lines: Array<{
            accountId: string;
            description?: string;
            debit?: number;
            credit?: number;
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
    post(id: string, user: JwtPayload): Promise<{
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
    void(id: string, user: JwtPayload): Promise<{
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
//# sourceMappingURL=journals.controller.d.ts.map