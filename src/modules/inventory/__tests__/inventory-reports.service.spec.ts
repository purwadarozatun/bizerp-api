import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryReportsService } from '../inventory-reports.service';

function makeProduct(overrides = {}) {
  return {
    id: 'prod-1',
    sku: 'SKU-001',
    name: 'Test Product',
    organizationId: 'org-1',
    trackInventory: true,
    isActive: true,
    costPrice: '10.00',
    stockLevels: [{ quantity: '100' }],
    movements: [],
    ...overrides,
  };
}

function makePrismaMock() {
  return {
    product: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    stockLevel: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    stockMovement: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  };
}

describe('InventoryReportsService', () => {
  let service: InventoryReportsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new InventoryReportsService(prisma as never);
  });

  describe('getValuation - average cost', () => {
    it('returns zero value when no movements', async () => {
      prisma.product.findMany.mockResolvedValue([makeProduct()]);
      const result = await service.getValuation('org-1', 'average');
      expect(result.grandTotal).toBe(0);
      expect(result.valuations[0].totalQuantity).toBe(100);
    });

    it('calculates average cost correctly', async () => {
      const movements = [
        { type: 'purchase', quantity: '50', unitCost: '8.00', createdAt: new Date('2026-01-01') },
        { type: 'purchase', quantity: '50', unitCost: '12.00', createdAt: new Date('2026-01-15') },
      ];
      prisma.product.findMany.mockResolvedValue([makeProduct({ movements })]);
      const result = await service.getValuation('org-1', 'average');
      // avg cost = (50*8 + 50*12) / 100 = 10, total = 100 * 10 = 1000
      expect(result.valuations[0].unitCost).toBe(10);
      expect(result.valuations[0].totalValue).toBe(1000);
    });
  });

  describe('getValuation - FIFO', () => {
    it('values remaining stock using oldest layers first', async () => {
      // Bought 60 @ $8, then 60 @ $12. Have 100 in stock.
      // FIFO: 60 @ $8 + 40 @ $12 = 480 + 480 = 960
      const movements = [
        { type: 'purchase', quantity: '60', unitCost: '8.00', createdAt: new Date('2026-01-01') },
        { type: 'purchase', quantity: '60', unitCost: '12.00', createdAt: new Date('2026-01-15') },
      ];
      prisma.product.findMany.mockResolvedValue([makeProduct({ movements })]);
      const result = await service.getValuation('org-1', 'fifo');
      expect(result.valuations[0].totalValue).toBe(960); // 60*8 + 40*12
    });
  });

  describe('getValuation - LIFO', () => {
    it('values remaining stock using newest layers first', async () => {
      // Bought 60 @ $8, then 60 @ $12. Have 100 in stock.
      // LIFO: 60 @ $12 + 40 @ $8 = 720 + 320 = 1040
      const movements = [
        { type: 'purchase', quantity: '60', unitCost: '8.00', createdAt: new Date('2026-01-01') },
        { type: 'purchase', quantity: '60', unitCost: '12.00', createdAt: new Date('2026-01-15') },
      ];
      prisma.product.findMany.mockResolvedValue([makeProduct({ movements })]);
      const result = await service.getValuation('org-1', 'lifo');
      expect(result.valuations[0].totalValue).toBe(1040); // 60*12 + 40*8
    });
  });
});
