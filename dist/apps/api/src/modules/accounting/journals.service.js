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
    async findAll(organizationId, referenceId, referenceType, page = 1, pageSize = 25) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const where = { organizationId };
        if (referenceId)
            where['referenceId'] = referenceId;
        if (referenceType)
            where['referenceType'] = referenceType;
        const [entries, total] = await Promise.all([
            this.prisma.journalEntry.findMany({
                where,
                include: { lines: { include: { account: true } } },
                orderBy: { date: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.journalEntry.count({ where }),
        ]);
        // Compute totalDebit and totalCredit for each entry
        const data = entries.map((entry) => {
            const lines = entry.lines;
            const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit), 0);
            const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit), 0);
            return {
                ...entry,
                entryNumber: entry.number,
                totalDebit,
                totalCredit,
            };
        });
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id, organizationId) {
        const entry = await this.prisma.journalEntry.findFirst({
            where: { id, organizationId },
            include: { lines: { include: { account: true } } },
        });
        if (!entry)
            throw new common_1.NotFoundException(`Journal entry ${id} not found`);
        return entry;
    }
    async create(organizationId, dto) {
        // Validate double-entry balance
        const totalDebit = dto.lines
            .filter((l) => l.type === 'DEBIT')
            .reduce((sum, l) => sum + l.amount, 0);
        const totalCredit = dto.lines
            .filter((l) => l.type === 'CREDIT')
            .reduce((sum, l) => sum + l.amount, 0);
        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new common_1.BadRequestException('Journal entry is not balanced: debits must equal credits');
        }
        if (dto.lines.length < 2) {
            throw new common_1.BadRequestException('Journal entry must have at least 2 lines');
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
                source: dto.source || 'MANUAL',
                referenceId: dto.referenceId,
                referenceType: dto.referenceType,
                createdByUserId: dto.createdByUserId,
                lines: {
                    create: dto.lines.map((l) => ({
                        accountId: l.accountId,
                        type: l.type,
                        amount: l.amount,
                        description: l.description,
                        debit: l.type === 'DEBIT' ? l.amount : 0,
                        credit: l.type === 'CREDIT' ? l.amount : 0,
                    })),
                },
            },
            include: { lines: { include: { account: true } } },
        });
    }
    async update(id, organizationId, dto) {
        const entry = await this.findOne(id, organizationId);
        if (entry.status !== 'draft') {
            throw new common_1.BadRequestException('Only draft journal entries can be edited');
        }
        const updateData = {};
        if (dto.date)
            updateData['date'] = dto.date;
        if (dto.description)
            updateData['description'] = dto.description;
        if (dto.reference !== undefined)
            updateData['reference'] = dto.reference;
        if (dto.currency)
            updateData['currency'] = dto.currency;
        if (dto.lines) {
            const totalDebit = dto.lines
                .filter((l) => l.type === 'DEBIT')
                .reduce((sum, l) => sum + l.amount, 0);
            const totalCredit = dto.lines
                .filter((l) => l.type === 'CREDIT')
                .reduce((sum, l) => sum + l.amount, 0);
            if (Math.abs(totalDebit - totalCredit) > 0.001) {
                throw new common_1.BadRequestException('Journal entry is not balanced: debits must equal credits');
            }
            updateData['lines'] = {
                deleteMany: {},
                create: dto.lines.map((l) => ({
                    accountId: l.accountId,
                    type: l.type,
                    amount: l.amount,
                    description: l.description,
                    debit: l.type === 'DEBIT' ? l.amount : 0,
                    credit: l.type === 'CREDIT' ? l.amount : 0,
                })),
            };
        }
        return this.prisma.journalEntry.update({
            where: { id },
            data: updateData,
            include: { lines: { include: { account: true } } },
        });
    }
    async post(id, organizationId) {
        const entry = await this.findOne(id, organizationId);
        if (entry.status !== 'draft') {
            throw new common_1.BadRequestException('Only draft entries can be posted');
        }
        return this.prisma.journalEntry.update({
            where: { id },
            data: { status: 'posted' },
            include: { lines: { include: { account: true } } },
        });
    }
    async void(id, organizationId, reason) {
        const entry = await this.findOne(id, organizationId);
        if (entry.status === 'voided') {
            throw new common_1.BadRequestException('Entry is already voided');
        }
        if (!reason || reason.trim().length === 0) {
            throw new common_1.BadRequestException('Void reason is required');
        }
        return this.prisma.journalEntry.update({
            where: { id },
            data: { status: 'voided', voidReason: reason },
            include: { lines: { include: { account: true } } },
        });
    }
    async delete(id, organizationId) {
        const entry = await this.findOne(id, organizationId);
        if (entry.status !== 'draft') {
            throw new common_1.ForbiddenException('Only draft journal entries can be deleted');
        }
        if (entry.source === 'SYSTEM') {
            throw new common_1.ForbiddenException('System-generated journal entries cannot be deleted. Use void instead.');
        }
        return this.prisma.journalEntry.delete({ where: { id } });
    }
    /**
     * Internal: create a journal entry from the auto-journal service (source=SYSTEM)
     */
    async createSystemEntry(organizationId, dto) {
        return this.create(organizationId, { ...dto, source: 'SYSTEM' });
    }
    /**
     * Create a reversal entry for a posted journal entry
     */
    async createReversal(id, organizationId, createdByUserId) {
        const entry = await this.findOne(id, organizationId);
        if (entry.status !== 'posted') {
            throw new common_1.BadRequestException('Only posted entries can be reversed');
        }
        const lines = entry.lines;
        const reversalLines = lines.map((l) => ({
            accountId: l.accountId,
            type: l.type === 'DEBIT' ? 'CREDIT' : 'DEBIT',
            amount: Number(l.amount),
            description: l.description || undefined,
        }));
        const count = await this.prisma.journalEntry.count({ where: { organizationId } });
        const number = `JE-${String(count + 1).padStart(6, '0')}`;
        return this.prisma.journalEntry.create({
            data: {
                organizationId,
                number,
                date: new Date(),
                description: `Reversal of ${entry.number}`,
                status: 'draft',
                source: entry.source,
                referenceId: entry.referenceId || undefined,
                referenceType: entry.referenceType || undefined,
                reversalOfId: entry.id,
                createdByUserId,
                lines: {
                    create: reversalLines.map((l) => ({
                        accountId: l.accountId,
                        type: l.type,
                        amount: l.amount,
                        description: l.description,
                        debit: l.type === 'DEBIT' ? l.amount : 0,
                        credit: l.type === 'CREDIT' ? l.amount : 0,
                    })),
                },
            },
            include: { lines: { include: { account: true } } },
        });
    }
};
exports.JournalsService = JournalsService;
exports.JournalsService = JournalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], JournalsService);
//# sourceMappingURL=journals.service.js.map