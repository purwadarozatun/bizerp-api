import { PrismaClient } from '@bis/database';
import { Prisma } from '@prisma/client';
export declare class SelfServiceService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getMyProfile(employeeId: string, organizationId: string): Promise<{
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
    getMyLeaveRequests(employeeId: string, page?: number, pageSize?: number): Promise<{
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
    getMyTimeEntries(employeeId: string, year: number, month: number): Promise<{
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
    updateMyProfile(employeeId: string, organizationId: string, data: Partial<{
        phone: string;
        address: Prisma.InputJsonValue;
    }>): Promise<{
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
}
//# sourceMappingURL=self-service.service.d.ts.map