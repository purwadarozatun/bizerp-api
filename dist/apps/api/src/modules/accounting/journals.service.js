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
exports.JournalsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let JournalsService = class JournalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, page = 1, pageSize = 25) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.journalEntry.findMany({
                where: { organizationId },
                include: { lines: { include: { account: true } } },
                orderBy: { date: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.journalEntry.count({ where: { organizationId } }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async create(organizationId, dto) {
        // Validate double-entry
        const totalDebit = dto.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        const totalCredit = dto.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new common_1.BadRequestException('Journal entry is not balanced: debits must equal credits');
        }
        const count = await this.prisma.journalEntry.count({ where: { organizationId } });
        const number = `JE-${String(count + 1).padStart(6, '0')}`;
        return this.prisma.journalEntry.create({
            data: {
                organizationId,
                number,
                date: dto.date,
                description: dto.description,
                reference: dto.reference,
                currency: dto.currency || 'USD',
                status: 'draft',
                lines: { create: dto.lines.map(l => ({ accountId: l.accountId, description: l.description, debit: l.debit || 0, credit: l.credit || 0 })) },
            },
            include: { lines: { include: { account: true } } },
        });
    }
    async post(id, organizationId) {
        const entry = await this.prisma.journalEntry.findFirst({ where: { id, organizationId } });
        if (!entry)
            throw new common_1.NotFoundException(`Journal entry ${id} not found`);
        if (entry.status !== 'draft')
            throw new common_1.BadRequestException('Only draft entries can be posted');
        return this.prisma.journalEntry.update({ where: { id }, data: { status: 'posted' } });
    }
    async void(id, organizationId) {
        const entry = await this.prisma.journalEntry.findFirst({ where: { id, organizationId } });
        if (!entry)
            throw new common_1.NotFoundException(`Journal entry ${id} not found`);
        if (entry.status === 'voided')
            throw new common_1.BadRequestException('Entry is already voided');
        return this.prisma.journalEntry.update({ where: { id }, data: { status: 'voided' } });
    }
};
exports.JournalsService = JournalsService;
exports.JournalsService = JournalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], JournalsService);
//# sourceMappingURL=journals.service.js.map