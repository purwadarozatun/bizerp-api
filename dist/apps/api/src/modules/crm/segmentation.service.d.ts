import { PrismaClient } from '@bis/database';
export declare class SegmentationService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getByTags(organizationId: string, tags: string[], matchAll?: boolean): Promise<{
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
    }[]>;
    getAllTags(organizationId: string): Promise<string[]>;
    addTags(contactId: string, tags: string[]): Promise<{
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
    } | null>;
    removeTags(contactId: string, tags: string[]): Promise<{
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
    } | null>;
}
//# sourceMappingURL=segmentation.service.d.ts.map