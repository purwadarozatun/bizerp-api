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
exports.PaystubService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let PaystubService = class PaystubService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPaystub(payrollId, employeeId, organizationId) {
        const payroll = await this.prisma.payroll.findFirst({
            where: { id: payrollId, organizationId },
        });
        if (!payroll)
            throw new common_1.NotFoundException(`Payroll ${payrollId} not found`);
        const line = await this.prisma.payrollLine.findFirst({
            where: { payrollId, employeeId },
            include: {
                employee: true,
                payroll: true,
            },
        });
        if (!line)
            throw new common_1.NotFoundException(`Pay stub for employee ${employeeId} not found in payroll ${payrollId}`);
        const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
        const deductions = line.deductions;
        return { payroll, line, employee: line.employee, organization: org, deductions };
    }
    async generateHtml(payrollId, employeeId, organizationId) {
        const data = await this.getPaystub(payrollId, employeeId, organizationId);
        const { employee, payroll, line, organization, deductions } = data;
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: payroll.currency }).format(amount);
        const deductionRows = Object.entries(deductions)
            .filter(([, v]) => Number(v) > 0)
            .map(([k, v]) => `<tr><td>${k.charAt(0).toUpperCase() + k.slice(1)}</td><td>${formatCurrency(Number(v))}</td></tr>`)
            .join('');
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pay Stub - ${employee.firstName} ${employee.lastName}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company { font-size: 20px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
    th { background: #f5f5f5; }
    .total { font-weight: bold; background: #e8f4e8; }
    .section-title { font-weight: bold; margin: 20px 0 8px; font-size: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">${organization?.name || 'Company'}</div>
      <div>Pay Period: ${payroll.period}</div>
      <div>Pay Date: ${new Date(payroll.payDate).toLocaleDateString()}</div>
    </div>
    <div>
      <div><strong>Employee:</strong> ${employee.firstName} ${employee.lastName}</div>
      <div><strong>Employee #:</strong> ${employee.employeeNumber}</div>
      <div><strong>Job Title:</strong> ${employee.jobTitle}</div>
      ${employee.department ? `<div><strong>Department:</strong> ${employee.department}</div>` : ''}
    </div>
  </div>

  <div class="section-title">Earnings</div>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>Base Salary</td><td>${formatCurrency(Number(line.grossPay))}</td></tr>
      <tr class="total"><td>Gross Pay</td><td>${formatCurrency(Number(line.grossPay))}</td></tr>
    </tbody>
  </table>

  <div class="section-title">Deductions</div>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      ${deductionRows}
    </tbody>
  </table>

  <table>
    <tbody>
      <tr class="total">
        <td>Net Pay</td>
        <td>${formatCurrency(Number(line.netPay))}</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
    }
    async listByEmployee(employeeId, organizationId) {
        const lines = await this.prisma.payrollLine.findMany({
            where: { employeeId, payroll: { organizationId, status: 'completed' } },
            include: { payroll: true },
            orderBy: { payroll: { payDate: 'desc' } },
        });
        return lines.map(l => ({
            payrollId: l.payrollId,
            period: l.payroll.period,
            payDate: l.payroll.payDate,
            grossPay: Number(l.grossPay),
            netPay: Number(l.netPay),
            currency: l.payroll.currency,
        }));
    }
};
exports.PaystubService = PaystubService;
exports.PaystubService = PaystubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], PaystubService);
//# sourceMappingURL=paystub.service.js.map