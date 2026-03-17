import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';

function makeMockInvoice(overrides = {}) {
  return {
    id: 'inv-1',
    organizationId: 'org-1',
    total: 500,
    amountPaid: 0,
    status: 'sent',
    ...overrides,
  };
}

function makePrismaMock(invoice = makeMockInvoice()) {
  return {
    invoice: {
      findFirst: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...invoice, ...data })),
    },
    bill: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    },
    payment: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'pay-1', ...data })),
    },
  };
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new PaymentsService(prisma as never);
  });

  describe('payInvoice', () => {
    const paymentDto = { date: new Date(), amount: 300, currency: 'USD', method: 'bank_transfer' };

    it('records a partial payment and updates status to partial', async () => {
      await service.payInvoice('inv-1', 'org-1', paymentDto);

      expect(prisma.payment.create).toHaveBeenCalledOnce();
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'partial', amountPaid: 300 }),
        }),
      );
    });

    it('marks invoice as paid when fully settled', async () => {
      await service.payInvoice('inv-1', 'org-1', { ...paymentDto, amount: 500 });
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'paid' }) }),
      );
    });

    it('throws NotFoundException for unknown invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);
      await expect(service.payInvoice('bad-id', 'org-1', paymentDto)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for already-paid invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(makeMockInvoice({ status: 'paid' }));
      await expect(service.payInvoice('inv-1', 'org-1', paymentDto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when overpaying', async () => {
      await expect(
        service.payInvoice('inv-1', 'org-1', { ...paymentDto, amount: 600 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
