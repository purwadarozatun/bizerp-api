import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ActivitiesService } from './activities.service';
export declare class ActivitiesController {
    private readonly activities;
    constructor(activities: ActivitiesService);
    findAll(user: JwtPayload, type?: string, contactId?: string, page?: number, pageSize?: number): Promise<{
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
            type: string;
            description: string | null;
            contactId: string;
            dueDate: Date | null;
            subject: string;
            completedAt: Date | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getTimeline(contactId: string): Promise<({
        type: string;
        date: Date;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            description: string | null;
            contactId: string;
            dueDate: Date | null;
            subject: string;
            completedAt: Date | null;
        };
    } | {
        type: string;
        date: Date;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            contactId: string;
            notes: string | null;
            title: string;
            source: string | null;
            value: import("@prisma/client/runtime/library").Decimal | null;
        };
    } | {
        type: string;
        date: Date;
        data: {
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
        };
    })[]>;
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
        type: string;
        description: string | null;
        contactId: string;
        dueDate: Date | null;
        subject: string;
        completedAt: Date | null;
    }>;
    create(body: {
        contactId: string;
        type: string;
        subject: string;
        description?: string;
        dueDate?: string;
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
        type: string;
        description: string | null;
        contactId: string;
        dueDate: Date | null;
        subject: string;
        completedAt: Date | null;
    }>;
    update(id: string, body: {
        type?: string;
        subject?: string;
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
        subject: string;
        completedAt: Date | null;
    }>;
    complete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        description: string | null;
        contactId: string;
        dueDate: Date | null;
        subject: string;
        completedAt: Date | null;
    }>;
}
//# sourceMappingURL=activities.controller.d.ts.map