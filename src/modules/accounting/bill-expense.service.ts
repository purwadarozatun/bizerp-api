import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

/**
 * BillExpenseService
 *
 * Manages the accounting expense entry lifecycle that mirrors a Bill's status:
 *   approved  → creates a pending expense entry
 *   paid      → marks expense as completed
 *   rejected  → voids the expense entry (if one exists)
 *   deleted   → voids the expense entry (if one exists)
 */
@Injectable()
export class BillExpenseService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Called when a bill is approved.
   * Creates a pending expense entry linked to the bill.
   */
  async onApproved(billId: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
    });
    if (!bill) return;

    // Idempotent: don't create a second entry if one already exists
    const existing = await this.prisma.billExpense.findUnique({ where: { billId } });
    if (existing) return existing;

    return this.prisma.billExpense.create({
      data: {
        billId,
        organizationId: bill.organizationId,
        category: bill.expenseCategory,
        amount: bill.total,
        status: 'pending',
        description: `Bill ${bill.number}${bill.notes ? ` — ${bill.notes}` : ''}`,
        referenceNo: bill.referenceNo ?? bill.number,
        expenseDate: bill.date,
      },
    });
  }

  /**
   * Called when a bill is marked as paid.
   * Updates the linked expense entry to completed.
   */
  async onPaid(billId: string, completedAt: Date) {
    const expense = await this.prisma.billExpense.findUnique({ where: { billId } });
    if (!expense || expense.status === 'voided') return;

    return this.prisma.billExpense.update({
      where: { billId },
      data: { status: 'completed', completedAt },
    });
  }

  /**
   * Called when a bill is rejected or deleted.
   * Voids the linked expense entry if one exists.
   */
  async onVoided(billId: string, reason: string) {
    const expense = await this.prisma.billExpense.findUnique({ where: { billId } });
    if (!expense || expense.status === 'voided') return;

    return this.prisma.billExpense.update({
      where: { billId },
      data: { status: 'voided', voidedAt: new Date(), voidReason: reason },
    });
  }

  /**
   * Returns all bill-sourced expense entries for the organization.
   * Supports optional status filter.
   */
  async findAll(organizationId: string, status?: string) {
    const where: Record<string, unknown> = { organizationId };
    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      where['status'] = { in: statuses };
    }

    return this.prisma.billExpense.findMany({
      where,
      include: { bill: { include: { contact: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
