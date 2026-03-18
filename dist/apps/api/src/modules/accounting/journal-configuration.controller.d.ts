import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JournalConfigurationService } from './journal-configuration.service';
export declare class JournalConfigurationController {
    private readonly configService;
    constructor(configService: JournalConfigurationService);
    findByDocumentType(user: JwtPayload, documentType: string): Promise<({
        triggerRules: ({
            debitAccount: {
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
            creditAccount: {
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
            isActive: boolean;
            configurationId: string;
            triggerEvent: string;
            debitAccountId: string;
            creditAccountId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        documentType: string;
        autoJournalEnabled: boolean;
    }) | {
        organizationId: string;
        documentType: string;
        autoJournalEnabled: boolean;
        triggerRules: never[];
    }>;
    update(id: string, user: JwtPayload, body: {
        autoJournalEnabled?: boolean;
    }): Promise<{
        triggerRules: ({
            debitAccount: {
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
            creditAccount: {
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
            isActive: boolean;
            configurationId: string;
            triggerEvent: string;
            debitAccountId: string;
            creditAccountId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        documentType: string;
        autoJournalEnabled: boolean;
    }>;
    healthCheck(user: JwtPayload): Promise<{
        status: string;
        missing: string[];
        checkedAt: string;
    }>;
    getAuditLog(user: JwtPayload): Promise<{
        data: {
            id: string;
            organizationId: string;
            configurationId: string;
            changedByUserId: string | null;
            field: string;
            oldValue: string | null;
            newValue: string | null;
            changedAt: Date;
        }[];
    }>;
}
export declare class JournalTriggerRulesController {
    private readonly configService;
    constructor(configService: JournalConfigurationService);
    findAll(user: JwtPayload, configurationId: string): Promise<{
        data: ({
            debitAccount: {
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
            creditAccount: {
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
            isActive: boolean;
            configurationId: string;
            triggerEvent: string;
            debitAccountId: string;
            creditAccountId: string;
        })[];
    }>;
    create(user: JwtPayload, body: {
        configurationId: string;
        triggerEvent: string;
        debitAccountId: string;
        creditAccountId: string;
        isActive?: boolean;
    }): Promise<{
        debitAccount: {
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
        creditAccount: {
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
        isActive: boolean;
        configurationId: string;
        triggerEvent: string;
        debitAccountId: string;
        creditAccountId: string;
    }>;
    update(id: string, user: JwtPayload, body: {
        debitAccountId?: string;
        creditAccountId?: string;
        isActive?: boolean;
    }): Promise<{
        debitAccount: {
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
        creditAccount: {
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
        isActive: boolean;
        configurationId: string;
        triggerEvent: string;
        debitAccountId: string;
        creditAccountId: string;
    }>;
}
export declare class JournalTaxMappingsController {
    private readonly configService;
    constructor(configService: JournalConfigurationService);
    findAll(user: JwtPayload): Promise<{
        data: ({
            taxPayableAccount: {
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
            taxReceivableAccount: {
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
            taxType: string;
            taxPayableAccountId: string;
            taxReceivableAccountId: string;
        })[];
    }>;
    update(id: string, user: JwtPayload, body: {
        taxPayableAccountId?: string;
        taxReceivableAccountId?: string;
    }): Promise<{
        taxPayableAccount: {
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
        taxReceivableAccount: {
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
        taxType: string;
        taxPayableAccountId: string;
        taxReceivableAccountId: string;
    }>;
}
//# sourceMappingURL=journal-configuration.controller.d.ts.map