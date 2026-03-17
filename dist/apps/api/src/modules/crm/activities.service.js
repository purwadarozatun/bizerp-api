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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let ActivitiesService = class ActivitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, type, contactId, page = 1, pageSize = 25) {
        const where = {
            contact: { organizationId },
            ...(type ? { type } : {}),
            ...(contactId ? { contactId } : {}),
        };
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.activity.findMany({
                where,
                include: { contact: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.activity.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id) {
        const activity = await this.prisma.activity.findUnique({
            where: { id },
            include: { contact: true },
        });
        if (!activity)
            throw new common_1.NotFoundException(`Activity ${id} not found`);
        return activity;
    }
    async create(data) {
        return this.prisma.activity.create({ data, include: { contact: true } });
    }
    async complete(id) {
        await this.findOne(id);
        return this.prisma.activity.update({
            where: { id },
            data: { completedAt: new Date() },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.activity.update({ where: { id }, data });
    }
    async getTimeline(contactId) {
        const [activities, leads, opportunities] = await Promise.all([
            this.prisma.activity.findMany({ where: { contactId }, orderBy: { createdAt: 'desc' } }),
            this.prisma.lead.findMany({ where: { contactId }, orderBy: { createdAt: 'desc' } }),
            this.prisma.opportunity.findMany({ where: { contactId }, orderBy: { createdAt: 'desc' } }),
        ]);
        const timeline = [
            ...activities.map(a => ({ type: 'activity', date: a.createdAt, data: a })),
            ...leads.map(l => ({ type: 'lead', date: l.createdAt, data: l })),
            ...opportunities.map(o => ({ type: 'opportunity', date: o.createdAt, data: o })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime());
        return timeline;
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map