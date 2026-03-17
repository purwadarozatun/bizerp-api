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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let WarehousesService = class WarehousesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId) {
        return this.prisma.warehouse.findMany({
            where: { organizationId, isActive: true },
            include: {
                _count: { select: { stockLevels: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id, organizationId) {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id, organizationId },
            include: {
                stockLevels: {
                    include: { product: true },
                    where: { quantity: { gt: 0 } },
                },
            },
        });
        if (!warehouse)
            throw new common_1.NotFoundException(`Warehouse ${id} not found`);
        return warehouse;
    }
    async create(organizationId, data) {
        return this.prisma.warehouse.create({
            data: { ...data, organizationId },
        });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        return this.prisma.warehouse.update({
            where: { id },
            data,
        });
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map