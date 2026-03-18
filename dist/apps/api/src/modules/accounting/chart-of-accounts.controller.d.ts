import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ChartOfAccountsService } from './chart-of-accounts.service';
export declare class ChartOfAccountsController {
    private readonly coaService;
    constructor(coaService: ChartOfAccountsService);
    findAll(user: JwtPayload, active?: string): Promise<{
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
    create(user: JwtPayload, body: {
        code: string;
        name: string;
        type: string;
        subtype?: string;
        description?: string;
        parentId?: string;
        isSystemAccount?: boolean;
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
    update(id: string, user: JwtPayload, body: {
        name?: string;
        description?: string;
        isActive?: boolean;
        subtype?: string;
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
    deactivate(id: string, user: JwtPayload): Promise<{
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
    findMappings(user: JwtPayload, documentType?: string): Promise<{
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
    setMapping(user: JwtPayload, body: {
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
    getSystemAccounts(user: JwtPayload): Promise<{
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
    updateSystemAccount(user: JwtPayload, body: {
        accountType: string;
        accountId: string;
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
        accountId: string;
        accountType: string;
    }>;
}
//# sourceMappingURL=chart-of-accounts.controller.d.ts.map