"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentationService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let SegmentationService = class SegmentationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByTags(organizationId, tags, matchAll = false) {
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
    async getAllTags(organizationId) {
        const contacts = await this.prisma.contact.findMany({
            where: { organizationId },
            select: { tags: true },
        });
        const tagSet = new Set();
        contacts.forEach(c => c.tags.forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }
    async addTags(contactId, tags) {
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId }, select: { tags: true } });
        if (!contact)
            return null;
        const merged = Array.from(new Set([...contact.tags, ...tags]));
        return this.prisma.contact.update({ where: { id: contactId }, data: { tags: merged } });
    }
    async removeTags(contactId, tags) {
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId }, select: { tags: true } });
        if (!contact)
            return null;
        const filtered = contact.tags.filter(t => !tags.includes(t));
        return this.prisma.contact.update({ where: { id: contactId }, data: { tags: filtered } });
    }
};
exports.SegmentationService = SegmentationService;
exports.SegmentationService = SegmentationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], SegmentationService);
//# sourceMappingURL=segmentation.service.js.map