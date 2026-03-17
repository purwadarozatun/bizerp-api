/**
 * Basic multi-currency service.
 *
 * For MVP, rates are manually managed by the org or fetched from a free
 * exchange-rate API. In production, connect to an FX provider.
 */
export declare class CurrencyService {
    private rates;
    /**
     * Get exchange rate from `from` to `to` currency.
     * Falls back to 1 if either currency is unknown.
     */
    getRate(from: string, to: string): number;
    /**
     * Convert an amount between currencies.
     */
    convert(amount: number, from: string, to: string): number;
    /**
     * List all supported currencies with their USD rate.
     */
    getSupportedCurrencies(): {
        code: string;
        rateToUsd: number;
    }[];
    /**
     * Update a rate (admin only in production — add RBAC guard).
     */
    setRate(currency: string, rateToUsd: number): {
        currency: string;
        rateToUsd: number;
    };
}
//# sourceMappingURL=currency.service.d.ts.map