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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, search, page = 1, pageSize = 25) {
        const where = {
            organizationId,
            isActive: true,
            ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }] } : {}),
        };
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({ where, include: { stockLevels: { include: { warehouse: true } } }, skip, take: ps, orderBy: { name: 'asc' } }),
            this.prisma.product.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id, organizationId) {
        const product = await this.prisma.product.findFirst({
            where: { id, organizationId },
            include: { stockLevels: { include: { warehouse: true } }, category: true },
        });
        if (!product)
            throw new common_1.NotFoundException(`Product ${id} not found`);
        return product;
    }
    async create(organizationId, data) {
        return this.prisma.product.create({ data: { ...data, organizationId }, include: { category: true } });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        return this.prisma.product.update({ where: { id }, data });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], ProductsService);
//# sourceMappingURL=products.service.js.map