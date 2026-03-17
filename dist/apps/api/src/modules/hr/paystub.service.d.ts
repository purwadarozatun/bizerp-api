import { PrismaClient } from '@bis/database';
export declare class PaystubService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getPaystub(payrollId: string, employeeId: string, organizationId: string): Promise<{
        payroll: {
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
        };
        line: {
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
            payroll: {
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
        };
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
        organization: {
            name: string;
            id: string;
            slug: string;
            logoUrl: string | null;
            currency: string;
            timezone: string;
            fiscalYearStartMonth: number;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        deductions: Record<string, number>;
    }>;
    generateHtml(payrollId: string, employeeId: string, organizationId: string): Promise<string>;
    listByEmployee(employeeId: string, organizationId: string): Promise<{
        payrollId: string;
        period: string;
        payDate: Date;
        grossPay: number;
        netPay: number;
        currency: string;
    }[]>;
}
//# sourceMappingURL=paystub.service.d.ts.map