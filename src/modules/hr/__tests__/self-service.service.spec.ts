import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelfServiceService } from '../self-service.service';

function makePrismaMock() {
  return {
    employee: {
      findFirst: vi.fn(),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'emp-1', ...data })),
    },
    leaveRequest: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    timeEntry: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  };
}

describe('SelfServiceService', () => {
  let service: SelfServiceService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new SelfServiceService(prisma as never);
  });

  describe('getLeaveBalance', () => {
    it('returns balances with no usage when no approved requests', async () => {
      prisma.leaveRequest.findMany.mockResolvedValue([]);
      const balances = await service.getLeaveBalance('emp-1');
      const annual = balances.find(b => b.type === 'annual');
      expect(annual).toBeDefined();
      expect(annual?.allocated).toBe(20);
      expect(annual?.used).toBe(0);
      expect(annual?.remaining).toBe(20);
    });

    it('reduces balance when leave is used', async () => {
      prisma.leaveRequest.findMany.mockResolvedValue([
        { type: 'annual', days: '5', status: 'approved' },
        { type: 'sick', days: '2', status: 'approved' },
      ]);
      const balances = await service.getLeaveBalance('emp-1');
      const annual = balances.find(b => b.type === 'annual');
      const sick = balances.find(b => b.type === 'sick');
      expect(annual?.remaining).toBe(15);
      expect(sick?.remaining).toBe(8);
    });
  });

  describe('getMyTimeEntries', () => {
    it('sums hours for the month', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([
        { id: 't1', hours: '8', date: new Date('2026-03-01') },
        { id: 't2', hours: '7.5', date: new Date('2026-03-02') },
      ]);
      const result = await service.getMyTimeEntries('emp-1', 2026, 3);
      expect(result.totalHours).toBe(15.5);
    });
  });
});
