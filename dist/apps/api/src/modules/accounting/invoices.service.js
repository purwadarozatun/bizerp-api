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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, status, page = 1, pageSize = 25) {
        const where = { organizationId, ...(status ? { status } : {}) };
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: { contact: true, lines: true },
                orderBy: { date: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id, organizationId) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, organizationId },
            include: { contact: true, lines: { include: { account: true, product: true } }, payments: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        return invoice;
    }
    async create(organizationId, data) {
        const count = await this.prisma.invoice.count({ where: { organizationId } });
        const number = `INV-${String(count + 1).padStart(6, '0')}`;
        const lines = data.lines.map(l => ({
            ...l,
            taxRate: l.taxRate || 0,
            total: l.quantity * l.unitPrice * (1 + (l.taxRate || 0)),
        }));
        const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
        const taxAmount = lines.reduce((s, l) => s + l.quantity * l.unitPrice * l.taxRate, 0);
        const total = subtotal + taxAmount;
        return this.prisma.invoice.create({
            data: {
                organizationId,
                number,
                contactId: data.contactId,
                date: data.date,
                dueDate: data.dueDate,
                currency: data.currency || 'USD',
                notes: data.notes,
                subtotal,
                taxAmount,
                total,
                lines: { create: lines },
            },
            include: { contact: true, lines: true },
        });
    }
    async updateStatus(id, organizationId, status) {
        await this.findOne(id, organizationId);
        return this.prisma.invoice.update({ where: { id }, data: { status } });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map