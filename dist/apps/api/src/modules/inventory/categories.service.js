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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.productCategory.findMany({
            include: {
                children: true,
                _count: { select: { products: true } },
            },
            where: { parentId: null },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
            include: { children: true, products: { take: 10 } },
        });
        if (!category)
            throw new common_1.NotFoundException(`Category ${id} not found`);
        return category;
    }
    async create(data) {
        if (data.parentId) {
            const parent = await this.prisma.productCategory.findUnique({ where: { id: data.parentId } });
            if (!parent)
                throw new common_1.NotFoundException(`Parent category ${data.parentId} not found`);
        }
        return this.prisma.productCategory.create({ data, include: { parent: true } });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.productCategory.update({ where: { id }, data });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map