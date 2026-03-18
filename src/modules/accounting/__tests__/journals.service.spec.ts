import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { JournalsService } from '../journals.service';

// Minimal Prisma mock
function makePrismaMock() {
  return {
    journalEntry: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'je-1',
          ...data,
          lines:
            data.lines?.create?.map((l: Record<string, unknown>) => ({
              id: 'jl-1',
              ...l,
              account: { id: l.accountId, name: 'Test Account', code: '1000' },
            })) ?? [],
        }),
      ),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('JournalsService', () => {
  let service: JournalsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new JournalsService(prisma as never);
  });

  describe('create', () => {
    it('rejects unbalanced entries', async () => {
      await expect(
        service.create('org-1', {
          date: new Date(),
          description: 'Test',
          lines: [
            { accountId: 'acc-1', type: 'DEBIT', amount: 100 },
            { accountId: 'acc-2', type: 'CREDIT', amount: 50 }, // unbalanced
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects entries with fewer than 2 lines', async () => {
      await expect(
        service.create('org-1', {
          date: new Date(),
          description: 'Test',
          lines: [{ accountId: 'acc-1', type: 'DEBIT', amount: 100 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a balanced journal entry', async () => {
      const result = await service.create('org-1', {
        date: new Date('2026-03-01'),
        description: 'Cash sale',
        lines: [
          { accountId: 'cash', type: 'DEBIT', amount: 1000 },
          { accountId: 'revenue', type: 'CREDIT', amount: 1000 },
        ],
      });

      expect(prisma.journalEntry.create).toHaveBeenCalledOnce();
      expect(result).toHaveProperty('number', 'JE-000001');
    });

    it('creates entry with referenceId and referenceType', async () => {
      await service.create('org-1', {
        date: new Date('2026-03-01'),
        description: 'Invoice JE',
        referenceId: 'inv-1',
        referenceType: 'INVOICE',
        source: 'SYSTEM',
        lines: [
          { accountId: 'ar', type: 'DEBIT', amount: 1000 },
          { accountId: 'revenue', type: 'CREDIT', amount: 1000 },
        ],
      });

      const createCall = prisma.journalEntry.create.mock.calls[0][0];
      expect(createCall.data.referenceId).toBe('inv-1');
      expect(createCall.data.referenceType).toBe('INVOICE');
      expect(createCall.data.source).toBe('SYSTEM');
    });
  });

  describe('post', () => {
    it('rejects posting non-draft entries', async () => {
      prisma.journalEntry.findFirst.mockResolvedValue({
        id: 'je-1',
        status: 'posted',
        source: 'MANUAL',
        lines: [],
      });
      await expect(service.post('je-1', 'org-1')).rejects.toThrow(BadRequestException);
    });

    it('posts a draft entry', async () => {
      prisma.journalEntry.findFirst.mockResolvedValue({
        id: 'je-1',
        status: 'draft',
        source: 'MANUAL',
        lines: [],
      });
      prisma.journalEntry.update.mockResolvedValue({ id: 'je-1', status: 'posted', lines: [] });
      await service.post('je-1', 'org-1');
      expect(prisma.journalEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'posted' }) }),
      );
    });
  });

  describe('void', () => {
    it('requires a void reason', async () => {
      prisma.journalEntry.findFirst.mockResolvedValue({
        id: 'je-1',
        status: 'posted',
        source: 'MANUAL',
        lines: [],
      });
      await expect(service.void('je-1', 'org-1', '')).rejects.toThrow(BadRequestException);
    });

    it('voids an entry with reason', async () => {
      prisma.journalEntry.findFirst.mockResolvedValue({
        id: 'je-1',
        status: 'posted',
        source: 'MANUAL',
        lines: [],
      });
      prisma.journalEntry.update.mockResolvedValue({ id: 'je-1', status: 'voided', lines: [] });
      await service.void('je-1', 'org-1', 'Mistake in amounts');
      expect(prisma.journalEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'voided', voidReason: 'Mistake in amounts' }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('blocks deletion of system entries', async () => {
      prisma.journalEntry.findFirst.mockResolvedValue({
        id: 'je-1',
        status: 'draft',
        source: 'SYSTEM',
        lines: [],
      });
      await expect(service.delete('je-1', 'org-1')).rejects.toThrow(ForbiddenException);
    });

    it('blocks deletion of posted entries', async () => {
      prisma.journalEntry.findFirst.mockResolvedValue({
        id: 'je-1',
        status: 'posted',
        source: 'MANUAL',
        lines: [],
      });
      await expect(service.delete('je-1', 'org-1')).rejects.toThrow(ForbiddenException);
    });

    it('allows deleting draft manual entries', async () => {
      prisma.journalEntry.findFirst.mockResolvedValue({
        id: 'je-1',
        status: 'draft',
        source: 'MANUAL',
        lines: [],
      });
      prisma.journalEntry.delete.mockResolvedValue({ id: 'je-1' });
      await service.delete('je-1', 'org-1');
      expect(prisma.journalEntry.delete).toHaveBeenCalledWith({ where: { id: 'je-1' } });
    });
  });
});
