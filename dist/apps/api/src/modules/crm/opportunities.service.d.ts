import { PrismaClient } from '@bis/database';
export declare class OpportunitiesService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getPipeline(organizationId: string): Promise<{
        stage: string;
        opportunities: ({
            contact: {
                id: string;
                address: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                email: string | null;
                firstName: string | null;
                lastName: string | null;
                type: string;
                notes: string | null;
                company: string | null;
                phone: string | null;
                website: string | null;
                tags: string[];
                isCustomer: boolean;
                isVendor: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contactId: string;
            notes: string | null;
            title: string;
            value: import("@prisma/client/runtime/library").Decimal | null;
            stage: string;
            probability: number;
            closeDate: Date | null;
        })[];
        totalValue: number;
    }[]>;
    create(data: {
        contactId: string;
        title: string;
        stage?: string;
        value?: number;
        probability?: number;
        closeDate?: Date;
        notes?: string;
    }): Promise<{
        contact: {
            id: string;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            type: string;
            notes: string | null;
            company: string | null;
            phone: string | null;
            website: string | null;
            tags: string[];
            isCustomer: boolean;
            isVendor: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        contactId: string;
        notes: string | null;
        title: string;
        value: import("@prisma/client/runtime/library").Decimal | null;
        stage: string;
        probability: number;
        closeDate: Date | null;
    }>;
    update(id: string, data: Partial<{
        title: string;
        stage: string;
        value: number;
        probability: number;
        closeDate: Date;
        notes: string;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        contactId: string;
        notes: string | null;
        title: string;
        value: import("@prisma/client/runtime/library").Decimal | null;
        stage: string;
        probability: number;
        closeDate: Date | null;
    }>;
}
//# sourceMappingURL=opportunities.service.d.ts.map