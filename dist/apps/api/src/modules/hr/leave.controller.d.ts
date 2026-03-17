import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { LeaveService } from './leave.service';
export declare class LeaveController {
    private readonly leave;
    constructor(leave: LeaveService);
    findAll(user: JwtPayload, status?: string, page?: number): Promise<{
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
    create(body: {
        employeeId: string;
        type: string;
        startDate: string;
        endDate: string;
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
    approve(id: string): Promise<{
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
    reject(id: string, body: {
        notes?: string;
    }): Promise<{
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
//# sourceMappingURL=leave.controller.d.ts.map