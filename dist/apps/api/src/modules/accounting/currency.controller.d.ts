import { CurrencyService } from './currency.service';
export declare class CurrencyController {
    private readonly currency;
    constructor(currency: CurrencyService);
    list(): {
        code: string;
        rateToUsd: number;
    }[];
    rate(body: {
        from: string;
        to: string;
    }): {
        from: string;
        to: string;
        rate: number;
    };
    setRate(body: {
        currency: string;
        rateToUsd: number;
    }): {
        currency: string;
        rateToUsd: number;
    };
}
//# sourceMappingURL=currency.controller.d.ts.map