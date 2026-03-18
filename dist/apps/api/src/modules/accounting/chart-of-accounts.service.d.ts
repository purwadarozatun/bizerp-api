import { PrismaClient } from '@bis/database';
export declare class ChartOfAccountsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, isActive?: boolean): Promise<{
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
        isSystemAccount?: boolean;
    }, userRole: string): Promise<{
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
        subtype: string;
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
    deactivate(id: string, organizationId: string): Promise<{
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
    findCategoryMappings(organizationId: string, documentType?: string): Promise<{
        data: ({
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
            updatedAt: Date;
            organizationId: string;
            category: string;
            documentType: string;
            accountId: string;
            isDefault: boolean;
        })[];
        total: number;
    }>;
    setCategoryMapping(organizationId: string, data: {
        category: string;
        documentType: string;
        accountId: string;
        isDefault?: boolean;
    }): Promise<{
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
        updatedAt: Date;
        organizationId: string;
        category: string;
        documentType: string;
        accountId: string;
        isDefault: boolean;
    }>;
    getSystemAccounts(organizationId: string): Promise<{
        data: ({
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
            updatedAt: Date;
            organizationId: string;
            accountId: string;
            accountType: string;
        })[];
    }>;
    updateSystemAccount(organizationId: string, accountType: string, accountId: string, userRole: string): Promise<{
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
        updatedAt: Date;
        organizationId: string;
        accountId: string;
        accountType: string;
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
//# sourceMappingURL=chart-of-accounts.service.d.ts.map