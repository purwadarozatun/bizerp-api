import { PrismaClient } from '@bis/database';
export interface AgingBucket {
    current: number;
    days1_30: number;
    days31_60: number;
    days61_90: number;
    over90: number;
    total: number;
}
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getProfitAndLoss(organizationId: string, from: Date, to: Date): Promise<{
        period: {
            from: Date;
            to: Date;
        };
        revenue: {
            name: string;
            code: string;
            amount: number;
        }[];
        totalRevenue: number;
        expenses: {
            name: string;
            code: string;
            amount: number;
        }[];
        totalExpenses: number;
        netIncome: number;
    }>;
    getBalanceSheet(organizationId: string, asOf: Date): Promise<{
        asOf: Date;
        assets: {
            name: string;
            code: string;
            subtype: string | null;
            amount: number;
        }[];
        totalAssets: number;
        liabilities: {
            name: string;
            code: string;
            subtype: string | null;
            amount: number;
        }[];
        totalLiabilities: number;
        equity: {
            name: string;
            code: string;
            subtype: string | null;
            amount: number;
        }[];
        totalEquity: number;
        liabilitiesAndEquity: number;
    }>;
    getCashFlow(organizationId: string, from: Date, to: Date): Promise<{
        period: {
            from: Date;
            to: Date;
        };
        operating: {
            netIncome: number;
            adjustments: {
                label: string;
                amount: number;
            }[];
            total: number;
        };
        investing: {
            items: never[];
            total: number;
        };
        financing: {
            items: never[];
            total: number;
        };
        netCashChange: number;
    }>;
    getArAging(organizationId: string, asOf?: Date): Promise<{
        asOf: Date;
        rows: {
            current: number;
            days1_30: number;
            days31_60: number;
            days61_90: number;
            over90: number;
            total: number;
            id: string;
            number: string;
            contact: string;
            dueDate: Date;
            daysOverdue: number;
            outstanding: number;
        }[];
        totals: AgingBucket;
    }>;
    getApAging(organizationId: string, asOf?: Date): Promise<{
        asOf: Date;
        rows: {
            current: number;
            days1_30: number;
            days31_60: number;
            days61_90: number;
            over90: number;
            total: number;
            id: string;
            number: string;
            contact: string;
            dueDate: Date;
            daysOverdue: number;
            outstanding: number;
        }[];
        totals: AgingBucket;
    }>;
    private agingBucket;
}
//# sourceMappingURL=reports.service.d.ts.map