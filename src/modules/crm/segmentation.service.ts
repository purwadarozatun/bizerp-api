import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Injectable()
export class SegmentationService {
  constructor(private readonly prisma: PrismaClient) {}

  async getByTags(organizationId: string, tags: string[], matchAll = false) {
    const contacts = await this.prisma.contact.findMany({
      where: {
        organizationId,
        tags: matchAll
          ? { hasEvery: tags }
          : { hasSome: tags },
      },
      orderBy: { createdAt: 'desc' },
    });
    return contacts;
  }

  async getAllTags(organizationId: string): Promise<string[]> {
    const contacts = await this.prisma.contact.findMany({
      where: { organizationId },
      select: { tags: true },
    });
    const tagSet = new Set<string>();
    contacts.forEach(c => c.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }

  async addTags(contactId: string, tags: string[]) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId }, select: { tags: true } });
    if (!contact) return null;
    const merged = Array.from(new Set([...contact.tags, ...tags]));
    return this.prisma.contact.update({ where: { id: contactId }, data: { tags: merged } });
  }

  async removeTags(contactId: string, tags: string[]) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId }, select: { tags: true } });
    if (!contact) return null;
    const filtered = contact.tags.filter(t => !tags.includes(t));
    return this.prisma.contact.update({ where: { id: contactId }, data: { tags: filtered } });
  }
}
