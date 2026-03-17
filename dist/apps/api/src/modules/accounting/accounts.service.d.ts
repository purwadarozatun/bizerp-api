import { PrismaClient } from '@bis/database';
export declare class AccountsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string): Promise<{
        data: ({
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
        })[];
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