import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AccountsService } from './accounts.service';
export declare class AccountsController {
    private readonly accounts;
    constructor(accounts: AccountsService);
    findAll(user: JwtPayload): Promise<{
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
    trialBalance(user: JwtPayload, asOf?: string): Promise<{
        account: {
            id: string;
            code: string;
            name: string;
            type: string;
        };
        debit: number;
        credit: number;
    }[]>;
    findOne(id: string, user: JwtPayload): Promise<{
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
    create(user: JwtPayload, body: {
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
    update(id: string, user: JwtPayload, body: {
        name?: string;
        description?: string;
        isActive?: boolean;
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
}
//# sourceMappingURL=accounts.controller.d.ts.map