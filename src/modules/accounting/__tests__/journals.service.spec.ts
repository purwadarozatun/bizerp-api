import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { JournalsService } from '../journals.service';

// Minimal Prisma mock
function makePrismaMock() {
  return {
    journalEntry: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'je-1', ...data })),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      update: vi.fn(),
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
            { accountId: 'acc-1', debit: 100, credit: 0 },
            { accountId: 'acc-2', debit: 0, credit: 50 }, // unbalanced
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a balanced journal entry', async () => {
      const result = await service.create('org-1', {
        date: new Date('2026-03-01'),
        description: 'Cash sale',
        lines: [
          { accountId: 'cash', debit: 1000, credit: 0 },
          { accountId: 'revenue', debit: 0, credit: 1000 },
        ],
      });

      expect(prisma.journalEntry.create).toHaveBeenCalledOnce();
      expect(result).toHaveProperty('number', 'JE-000001');
    });
  });
});
