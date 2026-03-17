import { PrismaClient } from '@bis/database';
export declare class PayrollService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(organizationId: string, page?: number, pageSize?: number): Promise<{
        data: ({
            lines: ({
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
                employeeId: string;
                payrollId: string;
                grossPay: import("@prisma/client/runtime/library").Decimal;
                deductions: import("@prisma/client/runtime/library").JsonValue;
                netPay: import("@prisma/client/runtime/library").Decimal;
                hours: import("@prisma/client/runtime/library").Decimal | null;
            })[];
        } & {
            id: string;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            status: string;
            period: string;
            startDate: Date;
            endDate: Date;
            payDate: Date;
            totalGross: import("@prisma/client/runtime/library").Decimal;
            totalNet: import("@prisma/client/runtime/library").Decimal;
            totalTax: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    create(organizationId: string, data: {
        period: string;
        startDate: Date;
        endDate: Date;
        payDate: Date;
        currency?: string;
    }): Promise<{
        lines: ({
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
            employeeId: string;
            payrollId: string;
            grossPay: import("@prisma/client/runtime/library").Decimal;
            deductions: import("@prisma/client/runtime/library").JsonValue;
            netPay: import("@prisma/client/runtime/library").Decimal;
            hours: import("@prisma/client/runtime/library").Decimal | null;
        })[];
    } & {
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        period: string;
        startDate: Date;
        endDate: Date;
        payDate: Date;
        totalGross: import("@prisma/client/runtime/library").Decimal;
        totalNet: import("@prisma/client/runtime/library").Decimal;
        totalTax: import("@prisma/client/runtime/library").Decimal;
    }>;
    process(id: string, organizationId: string): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        period: string;
        startDate: Date;
        endDate: Date;
        payDate: Date;
        totalGross: import("@prisma/client/runtime/library").Decimal;
        totalNet: import("@prisma/client/runtime/library").Decimal;
        totalTax: import("@prisma/client/runtime/library").Decimal;
    }>;
}
//# sourceMappingURL=payroll.service.d.ts.map