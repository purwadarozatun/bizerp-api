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
exports.InventoryReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let InventoryReportsService = class InventoryReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStockReport(organizationId) {
        const stockLevels = await this.prisma.stockLevel.findMany({
            where: { product: { organizationId } },
            include: {
                product: { include: { category: true } },
                warehouse: true,
            },
            orderBy: [{ product: { name: 'asc' } }, { warehouse: { name: 'asc' } }],
        });
        return stockLevels.map(sl => ({
            product: sl.product,
            warehouse: sl.warehouse,
            quantity: Number(sl.quantity),
            value: Number(sl.quantity) * Number(sl.product.costPrice),
        }));
    }
    async getLowStockReport(organizationId) {
        const stockLevels = await this.prisma.stockLevel.findMany({
            where: { product: { organizationId, trackInventory: true } },
            include: { product: true, warehouse: true },
        });
        return stockLevels
            .filter(sl => Number(sl.quantity) <= sl.product.reorderPoint)
            .map(sl => ({
            product: sl.product,
            warehouse: sl.warehouse,
            currentQuantity: Number(sl.quantity),
            reorderPoint: sl.product.reorderPoint,
            deficit: sl.product.reorderPoint - Number(sl.quantity),
        }));
    }
    async getMovementHistory(organizationId, productId, startDate, endDate, page = 1, pageSize = 50) {
        const where = { product: { organizationId } };
        if (productId)
            where['productId'] = productId;
        if (startDate || endDate) {
            where['createdAt'] = {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
            };
        }
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 50;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.stockMovement.findMany({
                where,
                include: { product: true, warehouse: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.stockMovement.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async getValuation(organizationId, method = 'average') {
        const products = await this.prisma.product.findMany({
            where: { organizationId, trackInventory: true, isActive: true },
            include: {
                stockLevels: true,
                movements: { orderBy: { createdAt: 'asc' }, where: { unitCost: { not: null } } },
            },
        });
        const valuations = products.map(product => {
            const totalQuantity = product.stockLevels.reduce((s, sl) => s + Number(sl.quantity), 0);
            const valuedCost = this.calculateValuation(product.movements, totalQuantity, method);
            return {
                product: { id: product.id, sku: product.sku, name: product.name },
                totalQuantity,
                valuationMethod: method,
                unitCost: totalQuantity > 0 ? valuedCost / totalQuantity : Number(product.costPrice),
                totalValue: valuedCost,
            };
        });
        const grandTotal = valuations.reduce((s, v) => s + v.totalValue, 0);
        return { valuations, grandTotal, method };
    }
    calculateValuation(movements, currentQty, method) {
        const purchases = movements
            .filter(m => m.type === 'purchase' && m.unitCost != null)
            .map(m => ({ qty: Number(m.quantity), cost: Number(m.unitCost), date: m.createdAt }));
        if (purchases.length === 0)
            return 0;
        if (method === 'average') {
            const totalCost = purchases.reduce((s, p) => s + p.qty * p.cost, 0);
            const totalQty = purchases.reduce((s, p) => s + p.qty, 0);
            const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
            return currentQty * avgCost;
        }
        // Build inventory layers
        const layers = purchases.map(p => ({ qty: p.qty, cost: p.cost }));
        if (method === 'fifo') {
            return this.valueLayers(layers, currentQty);
        }
        // LIFO — reverse layers
        return this.valueLayers([...layers].reverse(), currentQty);
    }
    valueLayers(layers, targetQty) {
        let remaining = targetQty;
        let totalValue = 0;
        for (const layer of layers) {
            if (remaining <= 0)
                break;
            const used = Math.min(remaining, layer.qty);
            totalValue += used * layer.cost;
            remaining -= used;
        }
        return totalValue;
    }
};
exports.InventoryReportsService = InventoryReportsService;
exports.InventoryReportsService = InventoryReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], InventoryReportsService);
//# sourceMappingURL=inventory-reports.service.js.map