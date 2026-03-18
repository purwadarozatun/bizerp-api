import { PrismaClient } from '@bis/database';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, status?: string, page?: number, pageSize?: number): Promise<{
        data: ({
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
            status: string;
            source: string | null;
            contactId: string;
            notes: string | null;
            title: string;
            value: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
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
        status: string;
        source: string | null;
        contactId: string;
        notes: string | null;
        title: string;
        value: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    create(data: {
        contactId: string;
        title: string;
        source?: string;
        value?: number;
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
        status: string;
        source: string | null;
        contactId: string;
        notes: string | null;
        title: string;
        value: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, data: Partial<{
        title: string;
        status: string;
        source: string;
        value: number;
        notes: string;
    }>): Promise<{
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
        status: string;
        source: string | null;
        contactId: string;
        notes: string | null;
        title: string;
        value: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    convertToOpportunity(id: string): Promise<{
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
}
//# sourceMappingURL=leads.service.d.ts.map