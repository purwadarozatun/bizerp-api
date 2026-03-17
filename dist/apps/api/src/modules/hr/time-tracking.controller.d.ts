import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { TimeTrackingService } from './time-tracking.service';
export declare class TimeTrackingController {
    private readonly time;
    constructor(time: TimeTrackingService);
    findAll(user: JwtPayload, employeeId?: string, startDate?: string, endDate?: string, page?: number, pageSize?: number): Promise<{
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
    getSummary(user: JwtPayload, employeeId: string, year: number, month: number): Promise<{
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
    create(body: {
        employeeId: string;
        date: string;
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
    update(id: string, body: {
        hours?: number;
        description?: string;
        date?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        date: Date;
        employeeId: string;
        hours: import("@prisma/client/runtime/library").Decimal;
    }>;
}
//# sourceMappingURL=time-tracking.controller.d.ts.map