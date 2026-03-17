import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reports;
    constructor(reports: ReportsService);
    profitAndLoss(user: JwtPayload, from: string, to: string): Promise<{
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
    balanceSheet(user: JwtPayload, asOf?: string): Promise<{
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
    cashFlow(user: JwtPayload, from: string, to: string): Promise<{
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
    arAging(user: JwtPayload, asOf?: string): Promise<{
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
        totals: import("./reports.service").AgingBucket;
    }>;
    apAging(user: JwtPayload, asOf?: string): Promise<{
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
        totals: import("./reports.service").AgingBucket;
    }>;
}
//# sourceMappingURL=reports.controller.d.ts.map