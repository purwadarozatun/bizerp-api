import { PrismaClient } from '@bis/database';
export declare class JournalConfigurationService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findByDocumentType(organizationId: string, documentType: string): Promise<({
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
    update(id: string, organizationId: string, data: Partial<{
        autoJournalEnabled: boolean;
    }>, userId: string | undefined, userRole: string): Promise<{
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
    healthCheck(organizationId: string): Promise<{
        status: string;
        missing: string[];
        checkedAt: string;
    }>;
    findTriggerRules(organizationId: string, configurationId: string): Promise<{
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
    updateTriggerRule(id: string, organizationId: string, data: Partial<{
        triggerEvent: string;
        debitAccountId: string;
        creditAccountId: string;
        isActive: boolean;
    }>, userId: string | undefined): Promise<{
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
    createTriggerRule(organizationId: string, configurationId: string, data: {
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
    findTaxMappings(organizationId: string): Promise<{
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
    updateTaxMapping(id: string, organizationId: string, data: Partial<{
        taxPayableAccountId: string;
        taxReceivableAccountId: string;
    }>): Promise<{
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
    getAuditLog(organizationId: string): Promise<{
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
    /**
     * Ensure journal configuration exists for a document type, creating it if needed.
     */
    ensureConfig(organizationId: string, documentType: string): Promise<{
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
}
//# sourceMappingURL=journal-configuration.service.d.ts.map