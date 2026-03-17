import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseOrdersService } from '../purchase-orders.service';

function makePrismaMock() {
  return {
    purchaseOrder: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'po-1', ...data, lines: [] })),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'po-1', ...data })),
    },
    purchaseOrderLine: {
      update: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    stockMovement: { create: vi.fn() },
    stockLevel: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation((fn) => fn({
      purchaseOrderLine: { update: vi.fn(), findMany: vi.fn().mockResolvedValue([{ id: 'line-1', received: '10', quantity: '10' }]) },
      stockMovement: { create: vi.fn() },
      stockLevel: { upsert: vi.fn() },
      purchaseOrder: { update: vi.fn() },
    })),
  };
}

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new PurchaseOrdersService(prisma as never);
  });

  describe('create', () => {
    it('generates a PO number and calculates total', async () => {
      const result = await service.create('org-1', {
        contactId: 'contact-1',
        date: new Date('2026-03-01'),
        lines: [
          { productId: 'prod-1', quantity: 10, unitCost: 5 },
          { productId: 'prod-2', quantity: 2, unitCost: 25 },
        ],
      });

      expect(prisma.purchaseOrder.create).toHaveBeenCalledOnce();
      const createCall = prisma.purchaseOrder.create.mock.calls[0][0];
      expect(createCall.data.number).toBe('PO-000001');
      expect(createCall.data.total).toBe(100); // 10*5 + 2*25
    });
  });

  describe('updateStatus', () => {
    it('rejects invalid statuses', async () => {
      prisma.purchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', organizationId: 'org-1', lines: [] });
      await expect(service.updateStatus('po-1', 'org-1', 'invalid_status')).rejects.toThrow(BadRequestException);
    });

    it('accepts valid statuses', async () => {
      prisma.purchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', organizationId: 'org-1', lines: [] });
      await service.updateStatus('po-1', 'org-1', 'approved');
      expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({ where: { id: 'po-1' }, data: { status: 'approved' } });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for missing PO', async () => {
      prisma.purchaseOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'org-1')).rejects.toThrow(NotFoundException);
    });
  });
});
