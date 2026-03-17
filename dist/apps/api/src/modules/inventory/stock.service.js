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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let StockService = class StockService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStockLevels(organizationId) {
        return this.prisma.stockLevel.findMany({
            where: { product: { organizationId } },
            include: { product: true, warehouse: true },
        });
    }
    async getLowStock(organizationId) {
        const levels = await this.prisma.stockLevel.findMany({
            where: { product: { organizationId, trackInventory: true } },
            include: { product: true, warehouse: true },
        });
        return levels.filter(l => Number(l.quantity) <= l.product.reorderPoint);
    }
    async adjustStock(data) {
        await this.prisma.stockMovement.create({ data });
        const current = await this.prisma.stockLevel.upsert({
            where: { productId_warehouseId: { productId: data.productId, warehouseId: data.warehouseId } },
            update: { quantity: { increment: data.quantity } },
            create: { productId: data.productId, warehouseId: data.warehouseId, quantity: data.quantity },
        });
        return current;
    }
    async getMovements(productId, page = 1, pageSize = 50) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 50;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.stockMovement.findMany({ where: { productId }, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
            this.prisma.stockMovement.count({ where: { productId } }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], StockService);
//# sourceMappingURL=stock.service.js.map