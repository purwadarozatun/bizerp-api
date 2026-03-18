import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly contacts;
    constructor(contacts: ContactsService);
    findAll(user: JwtPayload, search?: string, page?: number, pageSize?: number): Promise<{
        data: {
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
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string, user: JwtPayload): Promise<{
        leads: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            source: string | null;
            contactId: string;
            notes: string | null;
            title: string;
            value: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        opportunities: {
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
        }[];
        activities: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            description: string | null;
            contactId: string;
            dueDate: Date | null;
            completedAt: Date | null;
            subject: string;
        }[];
    } & {
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
    }>;
    create(user: JwtPayload, body: {
        type?: string;
        firstName?: string;
        lastName?: string;
        company?: string;
        email?: string;
        phone?: string;
        isCustomer?: boolean;
        isVendor?: boolean;
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
    }>;
    update(id: string, user: JwtPayload, body: {
        firstName?: string;
        lastName?: string;
        company?: string;
        email?: string;
        phone?: string;
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
    }>;
    logActivity(contactId: string, body: {
        type: string;
        subject: string;
        description?: string;
        dueDate?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        description: string | null;
        contactId: string;
        dueDate: Date | null;
        completedAt: Date | null;
        subject: string;
    }>;
}
//# sourceMappingURL=contacts.controller.d.ts.map