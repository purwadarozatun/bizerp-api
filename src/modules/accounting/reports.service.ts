import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@bis/database';
import { roundMoney } from '@bis/shared';

export interface AgingBucket {
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  over90: number;
  total: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getProfitAndLoss(organizationId: string, from: Date, to: Date) {
    const lines = await this.prisma.journalLine.findMany({
      where: {
        account: { organizationId, type: { in: ['revenue', 'expense'] } },
        journalEntry: { status: 'posted', date: { gte: from, lte: to } },
      },
      include: { account: true },
    });

    const revenue: Record<string, { name: string; code: string; amount: number }> = {};
    const expenses: Record<string, { name: string; code: string; amount: number }> = {};

    for (const line of lines) {
      const net = Number(line.credit) - Number(line.debit);
      if (line.account.type === 'revenue') {
        if (!revenue[line.accountId]) revenue[line.accountId] = { name: line.account.name, code: line.account.code, amount: 0 };
        revenue[line.accountId].amount += net;
      } else {
        if (!expenses[line.accountId]) expenses[line.accountId] = { name: line.account.name, code: line.account.code, amount: 0 };
        expenses[line.accountId].amount += -net;
      }
    }

    const totalRevenue = roundMoney(Object.values(revenue).reduce((s, v) => s + v.amount, 0));
    const totalExpenses = roundMoney(Object.values(expenses).reduce((s, v) => s + v.amount, 0));

    return {
      period: { from, to },
      revenue: Object.values(revenue).sort((a, b) => a.code.localeCompare(b.code)),
      totalRevenue,
      expenses: Object.values(expenses).sort((a, b) => a.code.localeCompare(b.code)),
      totalExpenses,
      netIncome: roundMoney(totalRevenue - totalExpenses),
    };
  }

  async getBalanceSheet(organizationId: string, asOf: Date) {
    const lines = await this.prisma.journalLine.findMany({
      where: {
        account: { organizationId, type: { in: ['asset', 'liability', 'equity'] } },
        journalEntry: { status: 'posted', date: { lte: asOf } },
      },
      include: { account: true },
    });

    const assets: Record<string, { name: string; code: string; subtype: string | null; amount: number }> = {};
    const liabilities: Record<string, { name: string; code: string; subtype: string | null; amount: number }> = {};
    const equity: Record<string, { name: string; code: string; subtype: string | null; amount: number }> = {};

    for (const line of lines) {
      const net = Number(line.debit) - Number(line.credit);
      const bucket = line.account.type === 'asset' ? assets : line.account.type === 'liability' ? liabilities : equity;
      if (!bucket[line.accountId]) {
        bucket[line.accountId] = { name: line.account.name, code: line.account.code, subtype: line.account.subtype, amount: 0 };
      }
      bucket[line.accountId].amount += net;
    }

    const totalAssets = roundMoney(Object.values(assets).reduce((s, v) => s + v.amount, 0));
    const totalLiabilities = roundMoney(Object.values(liabilities).reduce((s, v) => s + v.amount, 0));
    const totalEquity = roundMoney(Object.values(equity).reduce((s, v) => s + v.amount, 0));

    return {
      asOf,
      assets: Object.values(assets).sort((a, b) => a.code.localeCompare(b.code)),
      totalAssets,
      liabilities: Object.values(liabilities).sort((a, b) => a.code.localeCompare(b.code)),
      totalLiabilities,
      equity: Object.values(equity).sort((a, b) => a.code.localeCompare(b.code)),
      totalEquity,
      liabilitiesAndEquity: roundMoney(totalLiabilities + totalEquity),
    };
  }

  async getCashFlow(organizationId: string, from: Date, to: Date) {
    // Indirect method: Net Income + adjustments
    const pl = await this.getProfitAndLoss(organizationId, from, to);

    // Operating activities: changes in AR, AP, inventory
    const [arChange, apChange] = await Promise.all([
      // AR: decrease in AR = cash inflow
      this.prisma.journalLine.aggregate({
        where: { account: { organizationId, subtype: 'current_asset', name: { contains: 'Receivable' } }, journalEntry: { status: 'posted', date: { gte: from, lte: to } } },
        _sum: { debit: true, credit: true },
      }),
      // AP: increase in AP = cash inflow
      this.prisma.journalLine.aggregate({
        where: { account: { organizationId, subtype: 'current_liability', name: { contains: 'Payable' } }, journalEntry: { status: 'posted', date: { gte: from, lte: to } } },
        _sum: { debit: true, credit: true },
      }),
    ]);

    const arMovement = roundMoney(Number(arChange._sum.credit || 0) - Number(arChange._sum.debit || 0));
    const apMovement = roundMoney(Number(apChange._sum.credit || 0) - Number(apChange._sum.debit || 0));

    const operatingCashFlow = roundMoney(pl.netIncome + arMovement + apMovement);

    return {
      period: { from, to },
      operating: {
        netIncome: pl.netIncome,
        adjustments: [
          { label: 'Change in Accounts Receivable', amount: arMovement },
          { label: 'Change in Accounts Payable', amount: apMovement },
        ],
        total: operatingCashFlow,
      },
      investing: {
        items: [],
        total: 0,
      },
      financing: {
        items: [],
        total: 0,
      },
      netCashChange: roundMoney(operatingCashFlow),
    };
  }

  async getArAging(organizationId: string, asOf?: Date) {
    const ref = asOf ?? new Date();
    const invoices = await this.prisma.invoice.findMany({
      where: { organizationId, status: { in: ['sent', 'partial', 'overdue'] } },
      include: { contact: true },
    });

    const rows = invoices.map((inv) => {
      const daysOverdue = Math.max(0, Math.floor((ref.getTime() - new Date(inv.dueDate).getTime()) / 86400000));
      const outstanding = roundMoney(Number(inv.total) - Number(inv.amountPaid));
      const bucket = this.agingBucket(daysOverdue, outstanding);
      return { id: inv.id, number: inv.number, contact: inv.contact.firstName || inv.contact.company || '', dueDate: inv.dueDate, daysOverdue, outstanding, ...bucket };
    });

    const empty: AgingBucket = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0, total: 0 };
    const totals: AgingBucket = rows.reduce((acc: AgingBucket, r) => ({
      current: roundMoney(acc.current + r.current),
      days1_30: roundMoney(acc.days1_30 + r.days1_30),
      days31_60: roundMoney(acc.days31_60 + r.days31_60),
      days61_90: roundMoney(acc.days61_90 + r.days61_90),
      over90: roundMoney(acc.over90 + r.over90),
      total: roundMoney(acc.total + r.total),
    }), empty);

    return { asOf: ref, rows, totals };
  }

  async getApAging(organizationId: string, asOf?: Date) {
    const ref = asOf ?? new Date();
    const bills = await this.prisma.bill.findMany({
      where: { organizationId, status: { in: ['received', 'partial', 'overdue'] } },
      include: { contact: true },
    });

    const rows = bills.map((bill) => {
      const daysOverdue = Math.max(0, Math.floor((ref.getTime() - new Date(bill.dueDate).getTime()) / 86400000));
      const outstanding = roundMoney(Number(bill.total) - Number(bill.amountPaid));
      const bucket = this.agingBucket(daysOverdue, outstanding);
      return { id: bill.id, number: bill.number, contact: bill.contact.firstName || bill.contact.company || '', dueDate: bill.dueDate, daysOverdue, outstanding, ...bucket };
    });

    const empty2: AgingBucket = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0, total: 0 };
    const totals: AgingBucket = rows.reduce((acc: AgingBucket, r) => ({
      current: roundMoney(acc.current + r.current),
      days1_30: roundMoney(acc.days1_30 + r.days1_30),
      days31_60: roundMoney(acc.days31_60 + r.days31_60),
      days61_90: roundMoney(acc.days61_90 + r.days61_90),
      over90: roundMoney(acc.over90 + r.over90),
      total: roundMoney(acc.total + r.total),
    }), empty2);

    return { asOf: ref, rows, totals };
  }

  private agingBucket(daysOverdue: number, amount: number): AgingBucket {
    if (daysOverdue === 0) return { current: amount, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0, total: amount };
    if (daysOverdue <= 30) return { current: 0, days1_30: amount, days31_60: 0, days61_90: 0, over90: 0, total: amount };
    if (daysOverdue <= 60) return { current: 0, days1_30: 0, days31_60: amount, days61_90: 0, over90: 0, total: amount };
    if (daysOverdue <= 90) return { current: 0, days1_30: 0, days31_60: 0, days61_90: amount, over90: 0, total: amount };
    return { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: amount, total: amount };
  }
}
