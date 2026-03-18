import { PrismaClient } from '@bis/database';
export declare class AccountsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string): Promise<{
        data: {
            balance: number;
            children: {
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
            }[];
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
        }[];
        total: number;
    }>;
    findOne(id: string, organizationId: string): Promise<{
        parent: {
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
        } | null;
        children: {
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
        }[];
    } & {
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
    }>;
    create(organizationId: string, data: {
        code: string;
        name: string;
        type: string;
        subtype?: string;
        description?: string;
        parentId?: string;
    }): Promise<{
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
    }>;
    update(id: string, organizationId: string, data: Partial<{
        name: string;
        description: string;
        isActive: boolean;
    }>): Promise<{
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
    }>;
    getTrialBalance(organizationId: string, asOf: Date): Promise<{
        account: {
            id: string;
            code: string;
            name: string;
            type: string;
        };
        debit: number;
        credit: number;
    }[]>;
}
//# sourceMappingURL=accounts.service.d.ts.map