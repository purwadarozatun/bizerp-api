import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { SegmentationService } from './segmentation.service';
export declare class SegmentationController {
    private readonly segmentation;
    constructor(segmentation: SegmentationService);
    getAllTags(user: JwtPayload): Promise<string[]>;
    getByTags(user: JwtPayload, tags: string, matchAll?: string): Promise<{
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
    addTags(contactId: string, body: {
        tags: string[];
    }): Promise<{
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
    removeTags(contactId: string, body: {
        tags: string[];
    }): Promise<{
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
//# sourceMappingURL=segmentation.controller.d.ts.map