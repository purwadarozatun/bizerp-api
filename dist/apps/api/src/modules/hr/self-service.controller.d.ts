import { Prisma } from '@prisma/client';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { SelfServiceService } from './self-service.service';
export declare class SelfServiceController {
    private readonly selfService;
    constructor(selfService: SelfServiceService);
    getProfile(employeeId: string, user: JwtPayload): Promise<{
        manager: {
            id: string;
            firstName: string;
            lastName: string;
            jobTitle: string;
        } | null;
        id: string;
        currency: string;
        address: Prisma.JsonValue | null;
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
        baseSalary: Prisma.Decimal | null;
        payPeriod: string | null;
    }>;
    updateProfile(employeeId: string, user: JwtPayload, body: {
        phone?: string;
        address?: Prisma.InputJsonValue;
    }): Promise<{
        id: string;
        currency: string;
        address: Prisma.JsonValue | null;
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
        baseSalary: Prisma.Decimal | null;
        payPeriod: string | null;
        bankDetails: Prisma.JsonValue | null;
    }>;
    getLeaveRequests(employeeId: string, page?: number, pageSize?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            status: string;
            notes: string | null;
            startDate: Date;
            endDate: Date;
            employeeId: string;
            days: Prisma.Decimal;
            reason: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getLeaveBalance(employeeId: string): Promise<{
        type: string;
        allocated: number;
        used: number;
        remaining: number;
    }[]>;
    getTimeEntries(employeeId: string, year: number, month: number): Promise<{
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
            hours: Prisma.Decimal;
        }[];
    }>;
}
//# sourceMappingURL=self-service.controller.d.ts.map