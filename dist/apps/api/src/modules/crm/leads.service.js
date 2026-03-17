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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, status, page = 1, pageSize = 25) {
        const where = {
            contact: { organizationId },
            ...(status ? { status } : {}),
        };
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.lead.findMany({
                where,
                include: { contact: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.lead.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: { contact: true },
        });
        if (!lead)
            throw new common_1.NotFoundException(`Lead ${id} not found`);
        return lead;
    }
    async create(data) {
        return this.prisma.lead.create({
            data,
            include: { contact: true },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.lead.update({ where: { id }, data, include: { contact: true } });
    }
    async convertToOpportunity(id) {
        const lead = await this.findOne(id);
        const opp = await this.prisma.opportunity.create({
            data: {
                contactId: lead.contactId,
                title: lead.title,
                value: lead.value,
                notes: lead.notes ?? undefined,
            },
            include: { contact: true },
        });
        await this.prisma.lead.update({ where: { id }, data: { status: 'qualified' } });
        return opp;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], LeadsService);
//# sourceMappingURL=leads.service.js.map