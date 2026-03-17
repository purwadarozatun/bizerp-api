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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let LeaveService = class LeaveService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, status, page = 1, pageSize = 25) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const where = { employee: { organizationId }, ...(status ? { status } : {}) };
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.leaveRequest.findMany({ where, include: { employee: true }, skip, take: ps, orderBy: { createdAt: 'desc' } }),
            this.prisma.leaveRequest.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async create(data) {
        return this.prisma.leaveRequest.create({ data: { ...data, status: 'pending' }, include: { employee: true } });
    }
    async updateStatus(id, status, notes) {
        const req = await this.prisma.leaveRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException(`Leave request ${id} not found`);
        return this.prisma.leaveRequest.update({ where: { id }, data: { status, notes } });
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], LeaveService);
//# sourceMappingURL=leave.service.js.map