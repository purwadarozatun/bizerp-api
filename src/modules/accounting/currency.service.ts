import { Injectable } from '@nestjs/common';

/**
 * Basic multi-currency service.
 *
 * For MVP, rates are manually managed by the org or fetched from a free
 * exchange-rate API. In production, connect to an FX provider.
 */
@Injectable()
export class CurrencyService {
  // In-memory rate cache (base: USD). Replace with DB-backed rates in prod.
  private rates: Map<string, number> = new Map([
    ['USD', 1],
    ['EUR', 0.92],
    ['GBP', 0.79],
    ['CAD', 1.36],
    ['AUD', 1.53],
    ['JPY', 149.5],
    ['CHF', 0.90],
    ['CNY', 7.24],
    ['INR', 83.1],
    ['MXN', 17.2],
  ]);

  /**
   * Get exchange rate from `from` to `to` currency.
   * Falls back to 1 if either currency is unknown.
   */
  getRate(from: string, to: string): number {
    if (from === to) return 1;
    const fromRate = this.rates.get(from) ?? 1;
    const toRate = this.rates.get(to) ?? 1;
    return toRate / fromRate;
  }

  /**
   * Convert an amount between currencies.
   */
  convert(amount: number, from: string, to: string): number {
    return Math.round(amount * this.getRate(from, to) * 100) / 100;
  }

  /**
   * List all supported currencies with their USD rate.
   */
  getSupportedCurrencies() {
    return Array.from(this.rates.entries()).map(([code, rate]) => ({ code, rateToUsd: rate }));
  }

  /**
   * Update a rate (admin only in production — add RBAC guard).
   */
  setRate(currency: string, rateToUsd: number) {
    this.rates.set(currency.toUpperCase(), rateToUsd);
    return { currency: currency.toUpperCase(), rateToUsd };
  }
}
