import { PrismaClient } from '@bis/database';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getKpis(organizationId: string): Promise<{
        revenue: {
            thisMonth: number;
            lastMonth: number;
            change: number | null;
        };
        expenses: {
            thisMonth: number;
            lastMonth: number;
            change: number | null;
        };
        netIncome: {
            thisMonth: number;
            lastMonth: number;
        };
        cash: {
            balance: number;
        };
        invoices: {
            open: number;
            overdue: number;
        };
        employees: {
            active: number;
        };
        inventory: {
            stockRecords: number;
        };
        crm: {
            openOpportunities: number;
        };
    }>;
    getTrends(organizationId: string, months?: number): Promise<{
        month: string;
        revenue: number;
        expenses: number;
        netIncome: number;
    }[]>;
    getIncomeStatement(organizationId: string, startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        revenue: {
            accounts: {
                name: string;
                code: string;
                amount: number;
            }[];
            total: number;
        };
        expenses: {
            accounts: {
                name: string;
                code: string;
                amount: number;
            }[];
            total: number;
        };
        netIncome: number;
    }>;
    getInventorySummary(organizationId: string): Promise<{
        totalProducts: number;
        totalStock: number;
        lowStockItems: number;
    }>;
    getHrSummary(organizationId: string): Promise<{
        totalEmployees: number;
        activeEmployees: number;
        onLeave: number;
        monthlyPayroll: number;
    }>;
    getCrmPipeline(organizationId: string): Promise<{
        stage: string;
        count: number;
        value: number;
    }[]>;
    exportCsv(organizationId: string, report: string, startDate: Date, endDate: Date): Promise<string>;
    private groupByAccount;
}
//# sourceMappingURL=dashboard.service.d.ts.map