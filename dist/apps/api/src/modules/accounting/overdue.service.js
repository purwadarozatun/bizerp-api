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
var OverdueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverdueService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
/**
 * Marks sent/partial invoices and bills as overdue when their due date passes.
 * In production, call this via a BullMQ cron job (daily).
 */
let OverdueService = OverdueService_1 = class OverdueService {
    prisma;
    logger = new common_1.Logger(OverdueService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async markOverdueInvoices() {
        const result = await this.prisma.invoice.updateMany({
            where: {
                status: { in: ['sent', 'partial'] },
                dueDate: { lt: new Date() },
            },
            data: { status: 'overdue' },
        });
        this.logger.log(`Marked ${result.count} invoices as overdue`);
        return { invoicesMarked: result.count };
    }
    async markOverdueBills() {
        const result = await this.prisma.bill.updateMany({
            where: {
                status: { in: ['received', 'partial'] },
                dueDate: { lt: new Date() },
            },
            data: { status: 'overdue' },
        });
        this.logger.log(`Marked ${result.count} bills as overdue`);
        return { billsMarked: result.count };
    }
    async runAll() {
        const [invoices, bills] = await Promise.all([
            this.markOverdueInvoices(),
            this.markOverdueBills(),
        ]);
        return { ...invoices, ...bills };
    }
};
exports.OverdueService = OverdueService;
exports.OverdueService = OverdueService = OverdueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], OverdueService);
//# sourceMappingURL=overdue.service.js.map