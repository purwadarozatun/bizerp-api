import { PrismaClient } from '@bis/database';
export declare class TimeTrackingService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, employeeId?: string, startDate?: Date, endDate?: Date, page?: number, pageSize?: number): Promise<{
        data: ({
            employee: {
                id: string;
                firstName: string;
                lastName: string;
                employeeNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            date: Date;
            employeeId: string;
            hours: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    create(data: {
        employeeId: string;
        date: Date;
        hours: number;
        description?: string;
    }): Promise<{
        employee: {
            id: string;
            currency: string;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            email: string;
            firstName: string;
            lastName: string;
            status: string;
            phone: string | null;
            employeeNumber: string;
            hireDate: Date;
            terminationDate: Date | null;
            jobTitle: string;
            department: string | null;
            managerId: string | null;
            employmentType: string;
            baseSalary: import("@prisma/client/runtime/library").Decimal | null;
            payPeriod: string | null;
            bankDetails: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        date: Date;
        employeeId: string;
        hours: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, data: Partial<{
        hours: number;
        description: string;
        date: Date;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        date: Date;
        employeeId: string;
        hours: import("@prisma/client/runtime/library").Decimal;
    }>;
    getSummary(organizationId: string, employeeId: string, year: number, month: number): Promise<{
        employeeId: string;
        year: number;
        month: number;
        totalHours: number;
        entries: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            date: Date;
            employeeId: string;
            hours: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
}
//# sourceMappingURL=time-tracking.service.d.ts.map