import { describe, it, expect, beforeEach } from 'vitest';
import { CurrencyService } from '../currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(() => {
    service = new CurrencyService();
  });

  it('returns 1 for same currency conversion', () => {
    expect(service.getRate('USD', 'USD')).toBe(1);
    expect(service.getRate('EUR', 'EUR')).toBe(1);
  });

  it('returns a non-zero rate for supported currency pair', () => {
    const rate = service.getRate('USD', 'EUR');
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(2);
  });

  it('converts amounts correctly', () => {
    const rate = service.getRate('USD', 'EUR');
    const converted = service.convert(100, 'USD', 'EUR');
    expect(converted).toBeCloseTo(100 * rate, 2);
  });

  it('allows updating a rate', () => {
    service.setRate('USD', 1);
    service.setRate('EUR', 0.85);
    const rate = service.getRate('USD', 'EUR');
    expect(rate).toBeCloseTo(0.85, 2);
  });

  it('lists all supported currencies', () => {
    const currencies = service.getSupportedCurrencies();
    expect(currencies.length).toBeGreaterThan(5);
    expect(currencies.find(c => c.code === 'USD')).toBeTruthy();
  });
});
