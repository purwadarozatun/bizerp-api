import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

/**
 * Marks sent/partial invoices and bills as overdue when their due date passes.
 * In production, call this via a BullMQ cron job (daily).
 */
@Injectable()
export class OverdueService {
  private readonly logger = new Logger(OverdueService.name);

  constructor(private readonly prisma: PrismaClient) {}

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
}
