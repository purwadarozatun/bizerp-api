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
exports.TimeTrackingService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let TimeTrackingService = class TimeTrackingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, employeeId, startDate, endDate, page = 1, pageSize = 50) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 50;
        const where = {
            employee: { organizationId },
            ...(employeeId ? { employeeId } : {}),
            ...(startDate || endDate
                ? { date: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } }
                : {}),
        };
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.timeEntry.findMany({
                where,
                include: { employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } } },
                orderBy: { date: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.timeEntry.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async create(data) {
        return this.prisma.timeEntry.create({
            data,
            include: { employee: true },
        });
    }
    async update(id, data) {
        const entry = await this.prisma.timeEntry.findUnique({ where: { id } });
        if (!entry)
            throw new common_1.NotFoundException(`Time entry ${id} not found`);
        return this.prisma.timeEntry.update({ where: { id }, data });
    }
    async getSummary(organizationId, employeeId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const entries = await this.prisma.timeEntry.findMany({
            where: { employeeId, employee: { organizationId }, date: { gte: startDate, lte: endDate } },
            orderBy: { date: 'asc' },
        });
        const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);
        return { employeeId, year, month, totalHours, entries };
    }
};
exports.TimeTrackingService = TimeTrackingService;
exports.TimeTrackingService = TimeTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], TimeTrackingService);
//# sourceMappingURL=time-tracking.service.js.map