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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let PayrollService = class PayrollService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, page = 1, pageSize = 25) {
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.payroll.findMany({ where: { organizationId }, include: { lines: { include: { employee: true } } }, skip, take: ps, orderBy: { createdAt: 'desc' } }),
            this.prisma.payroll.count({ where: { organizationId } }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async create(organizationId, data) {
        // Auto-include all active employees
        const employees = await this.prisma.employee.findMany({
            where: { organizationId, status: 'active', baseSalary: { not: null } },
        });
        if (employees.length === 0)
            throw new common_1.BadRequestException('No active employees with salary configured');
        const lines = employees.map(emp => {
            const gross = Number(emp.baseSalary || 0);
            const tax = gross * 0.2; // Simplified 20% tax — configurable in prod
            const net = gross - tax;
            return { employeeId: emp.id, grossPay: gross, deductions: { tax, health: 0, retirement: 0 }, netPay: net };
        });
        const totalGross = lines.reduce((s, l) => s + l.grossPay, 0);
        const totalTax = lines.reduce((s, l) => s + l.deductions.tax, 0);
        const totalNet = lines.reduce((s, l) => s + l.netPay, 0);
        return this.prisma.payroll.create({
            data: {
                organizationId,
                ...data,
                currency: data.currency || 'USD',
                status: 'draft',
                totalGross,
                totalNet,
                totalTax,
                lines: { create: lines },
            },
            include: { lines: { include: { employee: true } } },
        });
    }
    async process(id, organizationId) {
        const payroll = await this.prisma.payroll.findFirst({ where: { id, organizationId } });
        if (!payroll)
            throw new common_1.BadRequestException('Payroll not found');
        if (payroll.status !== 'draft')
            throw new common_1.BadRequestException('Only draft payrolls can be processed');
        return this.prisma.payroll.update({ where: { id }, data: { status: 'completed' } });
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map