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
exports.SelfServiceService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let SelfServiceService = class SelfServiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(employeeId, organizationId) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, organizationId },
            include: {
                manager: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
            },
            // Exclude sensitive fields by selecting specific ones
        });
        if (!employee)
            throw new common_1.NotFoundException(`Employee ${employeeId} not found`);
        // Strip bank details from self-service view for security
        const { bankDetails: _bank, ...safeEmployee } = employee;
        return safeEmployee;
    }
    async getMyLeaveRequests(employeeId, page = 1, pageSize = 25) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.leaveRequest.findMany({
                where: { employeeId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: ps,
            }),
            this.prisma.leaveRequest.count({ where: { employeeId } }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async getLeaveBalance(employeeId) {
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const approved = await this.prisma.leaveRequest.findMany({
            where: { employeeId, status: 'approved', startDate: { gte: yearStart } },
        });
        const used = {};
        for (const req of approved) {
            used[req.type] = (used[req.type] || 0) + Number(req.days);
        }
        // Default allocations — in a full system these would come from policy config
        const allocations = {
            annual: 20,
            sick: 10,
            maternity: 90,
            paternity: 10,
            unpaid: 0,
        };
        return Object.entries(allocations).map(([type, alloc]) => ({
            type,
            allocated: alloc,
            used: used[type] || 0,
            remaining: Math.max(0, alloc - (used[type] || 0)),
        }));
    }
    async getMyTimeEntries(employeeId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const entries = await this.prisma.timeEntry.findMany({
            where: { employeeId, date: { gte: startDate, lte: endDate } },
            orderBy: { date: 'asc' },
        });
        const totalHours = entries.reduce((s, e) => s + Number(e.hours), 0);
        return { year, month, totalHours, entries };
    }
    async updateMyProfile(employeeId, organizationId, data) {
        const emp = await this.prisma.employee.findFirst({ where: { id: employeeId, organizationId } });
        if (!emp)
            throw new common_1.NotFoundException(`Employee ${employeeId} not found`);
        // Build update data with proper Prisma types
        const updateData = {};
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.address !== undefined)
            updateData.address = data.address;
        return this.prisma.employee.update({ where: { id: employeeId }, data: updateData });
    }
};
exports.SelfServiceService = SelfServiceService;
exports.SelfServiceService = SelfServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], SelfServiceService);
//# sourceMappingURL=self-service.service.js.map