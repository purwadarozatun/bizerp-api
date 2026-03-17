import { PrismaClient } from '@bis/database';
export declare class LeaveService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, status?: string, page?: number, pageSize?: number): Promise<{
        data: ({
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
            type: string;
            status: string;
            notes: string | null;
            startDate: Date;
            endDate: Date;
            employeeId: string;
            days: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    create(data: {
        employeeId: string;
        type: string;
        startDate: Date;
        endDate: Date;
        days: number;
        reason?: string;
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
        type: string;
        status: string;
        notes: string | null;
        startDate: Date;
        endDate: Date;
        employeeId: string;
        days: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
    }>;
    updateStatus(id: string, status: 'approved' | 'rejected' | 'cancelled', notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        notes: string | null;
        startDate: Date;
        endDate: Date;
        employeeId: string;
        days: import("@prisma/client/runtime/library").Decimal;
        reason: string | null;
    }>;
}
//# sourceMappingURL=leave.service.d.ts.map