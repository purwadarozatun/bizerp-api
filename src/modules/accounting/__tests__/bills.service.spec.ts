import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BillsService } from '../bills.service';
import { BillExpenseService } from '../bill-expense.service';
import { AutoJournalService } from '../auto-journal.service';

function makeMockBill(overrides = {}) {
  return {
    id: 'bill-1',
    organizationId: 'org-1',
    number: 'BILL-000001',
    contactId: 'contact-1',
    date: new Date('2024-01-01'),
    dueDate: new Date('2024-01-31'),
    status: 'draft',
    currency: 'USD',
    expenseCategory: null,
    referenceNo: null,
    rejectionReason: null,
    subtotal: 1000,
    taxAmount: 100,
    total: 1100,
    amountPaid: 0,
    exchangeRate: 1,
    notes: null,
    paidAt: null,
    paidMethod: null,
    paidReference: null,
    paidNotes: null,
    approvedAt: null,
    approvedById: null,
    submittedAt: null,
    lines: [
      {
        id: 'line-1',
        billId: 'bill-1',
        description: 'Test item',
        quantity: 10,
        unitPrice: 100,
        taxRate: 10,
        total: 1100,
      },
    ],
    payments: [],
    attachments: [],
    statusLogs: [],
    contact: { id: 'contact-1', company: 'Test Vendor' },
    ...overrides,
  };
}

function makePrismaMock(bill = makeMockBill()) {
  return {
    bill: {
      findFirst: vi.fn().mockResolvedValue(bill),
      findMany: vi.fn().mockResolvedValue([bill]),
      count: vi.fn().mockResolvedValue(1),
      create: vi
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ ...makeMockBill(), ...data, lines: [], contact: bill.contact }),
        ),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...bill, ...data })),
      delete: vi.fn().mockResolvedValue(bill),
    },
    billStatusLog: {
      create: vi.fn().mockResolvedValue({ id: 'log-1', billId: bill.id }),
    },
  };
}

function makeBillExpenseMock(): BillExpenseService {
  return {
    onApproved: vi.fn().mockResolvedValue({}),
    onPaid: vi.fn().mockResolvedValue({}),
    onVoided: vi.fn().mockResolvedValue({}),
    findAll: vi.fn().mockResolvedValue([]),
  } as unknown as BillExpenseService;
}

function makeAutoJournalMock(): AutoJournalService {
  return {
    onBillStatusChange: vi.fn().mockResolvedValue({ journalEntry: null }),
    onInvoiceStatusChange: vi.fn().mockResolvedValue({ journalEntry: null }),
  } as unknown as AutoJournalService;
}

describe('BillsService', () => {
  let service: BillsService;
  let prismaMock: ReturnType<typeof makePrismaMock>;
  let expenseMock: BillExpenseService;
  let autoJournalMock: AutoJournalService;

  beforeEach(() => {
    const bill = makeMockBill();
    prismaMock = makePrismaMock(bill);
    expenseMock = makeBillExpenseMock();
    autoJournalMock = makeAutoJournalMock();
    service = new BillsService(prismaMock as never, expenseMock, autoJournalMock);
  });

  describe('findAll', () => {
    it('returns paginated bills', async () => {
      const result = await service.findAll('org-1');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(25);
    });

    it('applies status filter', async () => {
      await service.findAll('org-1', 'approved');
      expect(prismaMock.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: { in: ['approved'] } }),
        }),
      );
    });

    it('applies sorting', async () => {
      await service.findAll(
        'org-1',
        undefined,
        undefined,
        undefined,
        undefined,
        1,
        25,
        'number',
        'asc',
      );
      expect(prismaMock.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ number: 'asc' }],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns a bill by id', async () => {
      const result = await service.findOne('bill-1', 'org-1');
      expect(result.id).toBe('bill-1');
    });

    it('throws NotFoundException for missing bill', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'org-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a bill with line items', async () => {
      prismaMock.bill.count.mockResolvedValue(0);
      await service.create('org-1', {
        contactId: 'contact-1',
        date: new Date('2024-01-01'),
        dueDate: new Date('2024-01-31'),
        lines: [{ description: 'Test item', quantity: 10, unitPrice: 100, taxRate: 10 }],
      });
      expect(prismaMock.bill.create).toHaveBeenCalled();
      expect(prismaMock.billStatusLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ toStatus: 'draft' }),
        }),
      );
    });

    it('generates sequential bill number', async () => {
      prismaMock.bill.count.mockResolvedValue(5);
      await service.create('org-1', {
        contactId: 'contact-1',
        date: new Date('2024-01-01'),
        dueDate: new Date('2024-01-31'),
        lines: [{ description: 'Item', quantity: 1, unitPrice: 50 }],
      });
      expect(prismaMock.bill.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ number: 'BILL-000006' }),
        }),
      );
    });

    it('throws BadRequestException when no line items', async () => {
      await expect(
        service.create('org-1', {
          contactId: 'contact-1',
          date: new Date(),
          dueDate: new Date(),
          lines: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitForApproval', () => {
    it('submits a draft bill for approval', async () => {
      await service.submitForApproval('bill-1', 'org-1', 'user-1');
      expect(prismaMock.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'pending_approval' }),
        }),
      );
      expect(prismaMock.billStatusLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ toStatus: 'pending_approval' }),
        }),
      );
    });

    it('throws BadRequestException for non-draft bill', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'approved' }));
      await expect(service.submitForApproval('bill-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when bill has no lines', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ lines: [] }));
      await expect(service.submitForApproval('bill-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('approve', () => {
    it('approves a pending_approval bill', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'pending_approval' }));
      await service.approve('bill-1', 'org-1', 'approver-1');
      expect(prismaMock.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'approved' }),
        }),
      );
    });

    it('throws BadRequestException when approving a draft bill', async () => {
      await expect(service.approve('bill-1', 'org-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('rejects a pending_approval bill with a reason', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'pending_approval' }));
      await service.reject('bill-1', 'org-1', 'Missing documentation', 'approver-1');
      expect(prismaMock.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'rejected',
            rejectionReason: 'Missing documentation',
          }),
        }),
      );
    });

    it('throws BadRequestException when rejection reason is empty', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'pending_approval' }));
      await expect(service.reject('bill-1', 'org-1', '', 'approver-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markAsPaid', () => {
    it('marks an approved bill as paid', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'approved' }));
      await service.markAsPaid(
        'bill-1',
        'org-1',
        {
          paymentDate: new Date('2024-02-01'),
          paymentMethod: 'bank_transfer',
          reference: 'TXN-001',
        },
        'user-1',
      );
      expect(prismaMock.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'paid', paidMethod: 'bank_transfer' }),
        }),
      );
    });

    it('throws BadRequestException for invalid payment method', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'approved' }));
      await expect(
        service.markAsPaid('bill-1', 'org-1', { paymentDate: new Date(), paymentMethod: 'crypto' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when paying a non-approved bill', async () => {
      await expect(
        service.markAsPaid('bill-1', 'org-1', { paymentDate: new Date(), paymentMethod: 'cash' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('deletes a draft bill', async () => {
      await service.delete('bill-1', 'org-1');
      expect(prismaMock.bill.delete).toHaveBeenCalledWith({ where: { id: 'bill-1' } });
    });

    it('throws ForbiddenException when deleting non-draft bill', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'approved' }));
      await expect(service.delete('bill-1', 'org-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('status transitions', () => {
    it('enforces valid state machine: draft->pending_approval->approved->paid', async () => {
      // draft -> approved (invalid)
      await expect(service.updateStatus('bill-1', 'org-1', 'approved')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for paid bill status changes', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'paid' }));
      await expect(service.updateStatus('bill-1', 'org-1', 'draft')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows rejected bill to be re-submitted', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'rejected' }));
      await service.updateStatus('bill-1', 'org-1', 'pending_approval');
      expect(prismaMock.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'pending_approval' } }),
      );
    });
  });

  describe('BIS-82: expense integration', () => {
    it('calls billExpense.onApproved when a bill is approved', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'pending_approval' }));
      await service.approve('bill-1', 'org-1', 'approver-1');
      expect(expenseMock.onApproved).toHaveBeenCalledWith('bill-1');
    });

    it('calls billExpense.onPaid when a bill is marked as paid', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'approved' }));
      const paymentDate = new Date('2024-02-01');
      await service.markAsPaid(
        'bill-1',
        'org-1',
        { paymentDate, paymentMethod: 'bank_transfer' },
        'user-1',
      );
      expect(expenseMock.onPaid).toHaveBeenCalledWith('bill-1', paymentDate);
    });

    it('calls billExpense.onVoided when a bill is rejected', async () => {
      prismaMock.bill.findFirst.mockResolvedValue(makeMockBill({ status: 'pending_approval' }));
      await service.reject('bill-1', 'org-1', 'Missing docs', 'approver-1');
      expect(expenseMock.onVoided).toHaveBeenCalledWith('bill-1', 'Rejected: Missing docs');
    });

    it('calls billExpense.onVoided when a draft bill is deleted', async () => {
      await service.delete('bill-1', 'org-1');
      expect(expenseMock.onVoided).toHaveBeenCalledWith('bill-1', 'Bill deleted');
    });
  });
});
