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
exports.OpportunitiesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let OpportunitiesService = class OpportunitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPipeline(organizationId) {
        const opps = await this.prisma.opportunity.findMany({
            where: { contact: { organizationId } },
            include: { contact: true },
            orderBy: { createdAt: 'desc' },
        });
        const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
        const pipeline = stages.map(stage => ({
            stage,
            opportunities: opps.filter(o => o.stage === stage),
            totalValue: opps.filter(o => o.stage === stage).reduce((s, o) => s + Number(o.value || 0), 0),
        }));
        return pipeline;
    }
    async create(data) {
        return this.prisma.opportunity.create({ data: { ...data }, include: { contact: true } });
    }
    async update(id, data) {
        const opp = await this.prisma.opportunity.findUnique({ where: { id } });
        if (!opp)
            throw new common_1.NotFoundException(`Opportunity ${id} not found`);
        return this.prisma.opportunity.update({ where: { id }, data });
    }
};
exports.OpportunitiesService = OpportunitiesService;
exports.OpportunitiesService = OpportunitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], OpportunitiesService);
//# sourceMappingURL=opportunities.service.js.map