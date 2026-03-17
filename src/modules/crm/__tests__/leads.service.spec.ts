import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { LeadsService } from '../leads.service';

function makePrismaMock() {
  return {
    lead: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'lead-1', ...data, contact: {} })),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'lead-1', ...data })),
    },
    opportunity: {
      create: vi.fn().mockResolvedValue({ id: 'opp-1', contact: {} }),
    },
  };
}

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new LeadsService(prisma as never);
  });

  describe('create', () => {
    it('creates a lead', async () => {
      await service.create({ contactId: 'c-1', title: 'Big Deal', source: 'web', value: 5000 });
      expect(prisma.lead.create).toHaveBeenCalledOnce();
      const call = prisma.lead.create.mock.calls[0][0];
      expect(call.data.title).toBe('Big Deal');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for missing lead', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('convertToOpportunity', () => {
    it('converts a lead and marks it qualified', async () => {
      prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1', contactId: 'c-1', title: 'Deal', value: 1000, notes: null });
      const opp = await service.convertToOpportunity('lead-1');
      expect(prisma.opportunity.create).toHaveBeenCalledOnce();
      expect(prisma.lead.update).toHaveBeenCalledWith({ where: { id: 'lead-1' }, data: { status: 'qualified' } });
      expect(opp.id).toBe('opp-1');
    });
  });
});
