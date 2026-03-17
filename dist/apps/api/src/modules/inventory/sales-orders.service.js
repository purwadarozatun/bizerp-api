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
exports.SalesOrdersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let SalesOrdersService = class SalesOrdersService {
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
            this.prisma.salesOrder.findMany({
                where,
                include: { contact: true, lines: { include: { product: true } } },
                orderBy: { date: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.salesOrder.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id, organizationId) {
        const so = await this.prisma.salesOrder.findFirst({
            where: { id, organizationId },
            include: { contact: true, lines: { include: { product: true } } },
        });
        if (!so)
            throw new common_1.NotFoundException(`Sales order ${id} not found`);
        return so;
    }
    async create(organizationId, data) {
        const count = await this.prisma.salesOrder.count({ where: { organizationId } });
        const number = `SO-${String(count + 1).padStart(6, '0')}`;
        const total = data.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
        return this.prisma.salesOrder.create({
            data: {
                organizationId,
                number,
                contactId: data.contactId,
                date: data.date,
                currency: data.currency || 'USD',
                notes: data.notes,
                total,
                lines: {
                    create: data.lines.map(l => ({
                        productId: l.productId,
                        description: l.description,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                        total: l.quantity * l.unitPrice,
                    })),
                },
            },
            include: { contact: true, lines: { include: { product: true } } },
        });
    }
    async fulfill(id, organizationId, warehouseId, fulfillments) {
        const so = await this.findOne(id, organizationId);
        if (so.status === 'fulfilled')
            throw new common_1.BadRequestException('Sales order already fully fulfilled');
        await this.prisma.$transaction(async (tx) => {
            for (const fulfillment of fulfillments) {
                const line = so.lines.find(l => l.id === fulfillment.lineId);
                if (!line)
                    throw new common_1.NotFoundException(`Line ${fulfillment.lineId} not found`);
                const newFulfilled = Number(line.fulfilled) + fulfillment.quantity;
                if (newFulfilled > Number(line.quantity)) {
                    throw new common_1.BadRequestException(`Cannot fulfill more than ordered for line ${fulfillment.lineId}`);
                }
                // Check stock availability
                const stockLevel = await tx.stockLevel.findUnique({
                    where: { productId_warehouseId: { productId: line.productId, warehouseId } },
                });
                if (!stockLevel || Number(stockLevel.quantity) < fulfillment.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${line.productId} in warehouse ${warehouseId}`);
                }
                await tx.salesOrderLine.update({
                    where: { id: fulfillment.lineId },
                    data: { fulfilled: newFulfilled },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: line.productId,
                        warehouseId,
                        type: 'sale',
                        quantity: -fulfillment.quantity,
                        reference: so.number,
                    },
                });
                await tx.stockLevel.update({
                    where: { productId_warehouseId: { productId: line.productId, warehouseId } },
                    data: { quantity: { decrement: fulfillment.quantity } },
                });
            }
            const updatedLines = await tx.salesOrderLine.findMany({ where: { salesOrderId: id } });
            const fullyFulfilled = updatedLines.every(l => Number(l.fulfilled) >= Number(l.quantity));
            const partiallyFulfilled = updatedLines.some(l => Number(l.fulfilled) > 0);
            await tx.salesOrder.update({
                where: { id },
                data: { status: fullyFulfilled ? 'fulfilled' : partiallyFulfilled ? 'partial' : so.status },
            });
        });
        return this.findOne(id, organizationId);
    }
    async updateStatus(id, organizationId, status) {
        await this.findOne(id, organizationId);
        const allowed = ['draft', 'confirmed', 'cancelled'];
        if (!allowed.includes(status))
            throw new common_1.BadRequestException(`Status ${status} is not valid`);
        return this.prisma.salesOrder.update({ where: { id }, data: { status } });
    }
};
exports.SalesOrdersService = SalesOrdersService;
exports.SalesOrdersService = SalesOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], SalesOrdersService);
//# sourceMappingURL=sales-orders.service.js.map