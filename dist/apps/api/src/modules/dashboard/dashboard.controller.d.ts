import { Response } from 'express';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboard;
    constructor(dashboard: DashboardService);
    getKpis(user: JwtPayload): Promise<{
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
    getTrends(user: JwtPayload, months?: string): Promise<{
        month: string;
        revenue: number;
        expenses: number;
        netIncome: number;
    }[]>;
    getIncomeStatement(user: JwtPayload, start?: string, end?: string): Promise<{
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
    getInventorySummary(user: JwtPayload): Promise<{
        totalProducts: number;
        totalStock: number;
        lowStockItems: number;
    }>;
    getHrSummary(user: JwtPayload): Promise<{
        totalEmployees: number;
        activeEmployees: number;
        onLeave: number;
        monthlyPayroll: number;
    }>;
    getCrmPipeline(user: JwtPayload): Promise<{
        stage: string;
        count: number;
        value: number;
    }[]>;
    exportCsv(user: JwtPayload, report: string, res: Response, start?: string, end?: string): Promise<void>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map