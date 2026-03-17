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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let EmployeesService = class EmployeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, search, page = 1, pageSize = 25) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const where = {
            organizationId,
            ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { employeeNumber: { contains: search, mode: 'insensitive' } }] } : {}),
        };
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.employee.findMany({ where, skip, take: ps, orderBy: { lastName: 'asc' } }),
            this.prisma.employee.count({ where }),
        ]);
        const mapped = data.map((e) => ({ ...e, position: e.jobTitle, salary: e.baseSalary ? Number(e.baseSalary) : 0 }));
        return { data: mapped, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id, organizationId) {
        const emp = await this.prisma.employee.findFirst({ where: { id, organizationId }, include: { manager: true, reports: true } });
        if (!emp)
            throw new common_1.NotFoundException(`Employee ${id} not found`);
        return { ...emp, position: emp.jobTitle, salary: emp.baseSalary ? Number(emp.baseSalary) : 0 };
    }
    async create(organizationId, data) {
        return this.prisma.employee.create({ data: { ...data, organizationId } });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        return this.prisma.employee.update({ where: { id }, data });
    }
    async getOrgChart(organizationId) {
        return this.prisma.employee.findMany({
            where: { organizationId, status: 'active' },
            include: { manager: { select: { id: true, firstName: true, lastName: true } }, reports: { select: { id: true, firstName: true, lastName: true, jobTitle: true } } },
            orderBy: { lastName: 'asc' },
        });
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map