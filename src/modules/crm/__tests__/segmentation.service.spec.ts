import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SegmentationService } from '../segmentation.service';

function makePrismaMock() {
  return {
    contact: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'c-1', ...data })),
    },
  };
}

describe('SegmentationService', () => {
  let service: SegmentationService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new SegmentationService(prisma as never);
  });

  describe('getAllTags', () => {
    it('returns deduplicated sorted tags', async () => {
      prisma.contact.findMany.mockResolvedValue([
        { tags: ['vip', 'enterprise'] },
        { tags: ['vip', 'smb'] },
      ]);
      const tags = await service.getAllTags('org-1');
      expect(tags).toEqual(['enterprise', 'smb', 'vip']);
    });
  });

  describe('addTags', () => {
    it('merges new tags without duplicates', async () => {
      prisma.contact.findUnique.mockResolvedValue({ tags: ['existing'] });
      await service.addTags('c-1', ['new', 'existing']);
      const call = prisma.contact.update.mock.calls[0][0];
      expect(call.data.tags).toEqual(expect.arrayContaining(['existing', 'new']));
      expect(call.data.tags).toHaveLength(2);
    });
  });

  describe('removeTags', () => {
    it('removes specified tags', async () => {
      prisma.contact.findUnique.mockResolvedValue({ tags: ['vip', 'enterprise', 'smb'] });
      await service.removeTags('c-1', ['vip', 'smb']);
      const call = prisma.contact.update.mock.calls[0][0];
      expect(call.data.tags).toEqual(['enterprise']);
    });
  });
});
