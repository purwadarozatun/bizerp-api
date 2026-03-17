import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesOrdersService } from '../sales-orders.service';

function makePrismaMock() {
  return {
    salesOrder: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'so-1', ...data, lines: [] })),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'so-1', ...data })),
    },
    salesOrderLine: {
      update: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    stockMovement: { create: vi.fn() },
    stockLevel: {
      findUnique: vi.fn().mockResolvedValue({ quantity: '100' }),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}

describe('SalesOrdersService', () => {
  let service: SalesOrdersService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new SalesOrdersService(prisma as never);
  });

  describe('create', () => {
    it('generates an SO number and calculates total', async () => {
      const result = await service.create('org-1', {
        contactId: 'contact-1',
        date: new Date('2026-03-01'),
        lines: [
          { productId: 'prod-1', quantity: 5, unitPrice: 20 },
          { productId: 'prod-2', quantity: 3, unitPrice: 15 },
        ],
      });

      expect(prisma.salesOrder.create).toHaveBeenCalledOnce();
      const createCall = prisma.salesOrder.create.mock.calls[0][0];
      expect(createCall.data.number).toBe('SO-000001');
      expect(createCall.data.total).toBe(145); // 5*20 + 3*15
    });
  });

  describe('updateStatus', () => {
    it('rejects invalid statuses', async () => {
      prisma.salesOrder.findFirst.mockResolvedValue({ id: 'so-1', organizationId: 'org-1', lines: [] });
      await expect(service.updateStatus('so-1', 'org-1', 'invalid')).rejects.toThrow(BadRequestException);
    });

    it('accepts valid statuses', async () => {
      prisma.salesOrder.findFirst.mockResolvedValue({ id: 'so-1', organizationId: 'org-1', lines: [] });
      await service.updateStatus('so-1', 'org-1', 'confirmed');
      expect(prisma.salesOrder.update).toHaveBeenCalledWith({ where: { id: 'so-1' }, data: { status: 'confirmed' } });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for missing SO', async () => {
      prisma.salesOrder.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'org-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('fulfill', () => {
    it('throws BadRequestException when SO is already fulfilled', async () => {
      prisma.salesOrder.findFirst.mockResolvedValue({ id: 'so-1', status: 'fulfilled', lines: [] });
      await expect(service.fulfill('so-1', 'org-1', 'wh-1', [])).rejects.toThrow(BadRequestException);
    });
  });
});
