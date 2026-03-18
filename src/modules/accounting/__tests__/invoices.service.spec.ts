import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';
import { AutoJournalService } from '../auto-journal.service';

function makeMockInvoice(overrides = {}) {
  return {
    id: 'inv-1',
    organizationId: 'org-1',
    number: 'INV-000001',
    contactId: 'contact-1',
    date: new Date('2024-01-01'),
    dueDate: new Date('2024-01-31'),
    status: 'draft',
    currency: 'USD',
    subtotal: 1000,
    taxAmount: 100,
    total: 1100,
    amountPaid: 0,
    exchangeRate: 1,
    notes: null,
    lines: [],
    payments: [],
    contact: { id: 'contact-1', name: 'Test Contact' },
    ...overrides,
  };
}

function makePrismaMock(invoice = makeMockInvoice()) {
  return {
    invoice: {
      findFirst: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          ...invoice,
          ...data,
          lines: [],
          payments: [],
          contact: invoice.contact,
        }),
      ),
      findMany: vi.fn().mockResolvedValue([invoice]),
      count: vi.fn().mockResolvedValue(1),
      create: vi
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ ...makeMockInvoice(), ...data, lines: [], contact: invoice.contact }),
        ),
    },
    invoiceAuditLog: {
      create: vi.fn().mockResolvedValue({
        id: 'audit-1',
        invoiceId: invoice.id,
        fromStatus: invoice.status,
        toStatus: 'sent',
        changedByUserId: 'user-1',
      }),
    },
    $transaction: vi.fn().mockImplementation((operations) => Promise.all(operations)),
  };
}

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let autoJournalMock: AutoJournalService;

  beforeEach(() => {
    prisma = makePrismaMock();
    autoJournalMock = {
      onInvoiceStatusChange: vi.fn().mockResolvedValue({ journalEntry: null }),
      onBillStatusChange: vi.fn().mockResolvedValue({ journalEntry: null }),
    } as unknown as AutoJournalService;
    service = new InvoicesService(prisma as never, autoJournalMock);
  });

  describe('updateStatus', () => {
    it('allows draft → sent transition (direct send)', async () => {
      const draftInvoice = makeMockInvoice({ status: 'draft' });
      prisma.invoice.findFirst.mockResolvedValue(draftInvoice);

      await service.updateStatus('inv-1', 'org-1', 'sent', 'user-1');

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: { status: 'sent' },
        }),
      );
      expect(prisma.invoiceAuditLog.create).toHaveBeenCalledWith({
        data: {
          invoiceId: 'inv-1',
          fromStatus: 'draft',
          toStatus: 'sent',
          changedByUserId: 'user-1',
        },
      });
    });

    it('allows draft → created transition (traditional flow)', async () => {
      const draftInvoice = makeMockInvoice({ status: 'draft' });
      prisma.invoice.findFirst.mockResolvedValue(draftInvoice);

      await service.updateStatus('inv-1', 'org-1', 'created', 'user-1');

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'created' },
        }),
      );
    });

    it('allows created → sent transition', async () => {
      const createdInvoice = makeMockInvoice({ status: 'created' });
      prisma.invoice.findFirst.mockResolvedValue(createdInvoice);

      await service.updateStatus('inv-1', 'org-1', 'sent', 'user-1');

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'sent' },
        }),
      );
    });

    it('allows sent → paid transition', async () => {
      const sentInvoice = makeMockInvoice({ status: 'sent' });
      prisma.invoice.findFirst.mockResolvedValue(sentInvoice);

      await service.updateStatus('inv-1', 'org-1', 'paid', 'user-1');

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'paid' },
        }),
      );
    });

    it('rejects invalid transition: draft → paid', async () => {
      const draftInvoice = makeMockInvoice({ status: 'draft' });
      prisma.invoice.findFirst.mockResolvedValue(draftInvoice);

      await expect(service.updateStatus('inv-1', 'org-1', 'paid', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateStatus('inv-1', 'org-1', 'paid', 'user-1')).rejects.toThrow(
        'Invalid status transition: cannot change from "draft" to "paid"',
      );
    });

    it('rejects invalid transition: sent → draft', async () => {
      const sentInvoice = makeMockInvoice({ status: 'sent' });
      prisma.invoice.findFirst.mockResolvedValue(sentInvoice);

      await expect(service.updateStatus('inv-1', 'org-1', 'draft', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects invalid transition: paid → sent', async () => {
      const paidInvoice = makeMockInvoice({ status: 'paid' });
      prisma.invoice.findFirst.mockResolvedValue(paidInvoice);

      await expect(service.updateStatus('inv-1', 'org-1', 'sent', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows any status → voided transition', async () => {
      const statuses = ['draft', 'created', 'sent', 'partial', 'overdue', 'paid'];

      for (const status of statuses) {
        const invoice = makeMockInvoice({ status });
        prisma.invoice.findFirst.mockResolvedValue(invoice);

        await service.updateStatus('inv-1', 'org-1', 'voided', 'user-1');

        expect(prisma.invoice.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { status: 'voided' },
          }),
        );
      }
    });

    it('throws NotFoundException when invoice does not exist', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.updateStatus('inv-999', 'org-1', 'sent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateStatus('inv-999', 'org-1', 'sent', 'user-1')).rejects.toThrow(
        'Invoice inv-999 not found',
      );
    });

    it('allows same status transition (no-op)', async () => {
      const draftInvoice = makeMockInvoice({ status: 'draft' });
      prisma.invoice.findFirst.mockResolvedValue(draftInvoice);

      await service.updateStatus('inv-1', 'org-1', 'draft', 'user-1');

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'draft' },
        }),
      );
    });

    it('creates audit log for status changes', async () => {
      const sentInvoice = makeMockInvoice({ status: 'sent' });
      prisma.invoice.findFirst.mockResolvedValue(sentInvoice);

      await service.updateStatus('inv-1', 'org-1', 'paid', 'user-1');

      expect(prisma.invoiceAuditLog.create).toHaveBeenCalledWith({
        data: {
          invoiceId: 'inv-1',
          fromStatus: 'sent',
          toStatus: 'paid',
          changedByUserId: 'user-1',
        },
      });
    });

    it('wraps update and audit log in a transaction', async () => {
      const draftInvoice = makeMockInvoice({ status: 'draft' });
      prisma.invoice.findFirst.mockResolvedValue(draftInvoice);

      await service.updateStatus('inv-1', 'org-1', 'sent', 'user-1');

      expect(prisma.$transaction).toHaveBeenCalledOnce();
      expect(prisma.$transaction).toHaveBeenCalledWith([expect.any(Promise), expect.any(Promise)]);
    });
  });

  describe('findOne', () => {
    it('returns a transformed invoice', async () => {
      const invoice = makeMockInvoice();
      prisma.invoice.findFirst.mockResolvedValue(invoice);

      const result = await service.findOne('inv-1', 'org-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'inv-1',
          organizationId: 'org-1',
          total: 1100,
        }),
      );
    });

    it('throws NotFoundException when invoice does not exist', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne('inv-999', 'org-1')).rejects.toThrow(NotFoundException);
    });
  });
});
