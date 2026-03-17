import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payroll;
    constructor(payroll: PayrollService);
    findAll(user: JwtPayload, page?: number): Promise<{
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
    create(user: JwtPayload, body: {
        period: string;
        startDate: string;
        endDate: string;
        payDate: string;
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
    process(id: string, user: JwtPayload): Promise<{
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
//# sourceMappingURL=payroll.controller.d.ts.map