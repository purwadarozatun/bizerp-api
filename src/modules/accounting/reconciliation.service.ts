import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

type ReconciliationStatus = 'reconciled' | 'unreconciled' | 'discrepancy' | 'pending';

interface ReconciliationRecord {
  documentId: string;
  documentNumber: string;
  documentType: 'INVOICE' | 'BILL';
  documentDate: Date;
  totalAmount: number;
  currency: string;
  journalEntryCount: number;
  journalAmount: number;
  status: ReconciliationStatus;
  discrepancyAmount: number;
  contactName: string | null;
  flaggedAt: Date | null;
  flagReason: string | null;
  lastCheckedAt: Date | null;
}

@Injectable()
export class ReconciliationService {
  constructor(private readonly prisma: PrismaClient) {}

  private computeStatus(
    documentAmount: number,
    journalAmount: number,
    hasDraft: boolean,
  ): ReconciliationStatus {
    if (journalAmount === 0 && !hasDraft) return 'unreconciled';
    if (hasDraft && journalAmount === 0) return 'pending';
    if (Math.abs(documentAmount - journalAmount) < 0.01) return 'reconciled';
    return 'discrepancy';
  }

  async findAll(
    organizationId: string,
    filters: {
      documentType?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      amountMin?: number;
      amountMax?: number;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = filters.page && +filters.page > 0 ? +filters.page : 1;
    const pageSize = filters.pageSize && +filters.pageSize > 0 ? +filters.pageSize : 25;

    // Fetch invoices and bills in parallel
    const [invoices, bills] = await Promise.all([
      !filters.documentType || filters.documentType === 'INVOICE'
        ? this.prisma.invoice.findMany({
            where: {
              organizationId,
              ...(filters.dateFrom || filters.dateTo
                ? {
                    date: {
                      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
                      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
                    },
                  }
                : {}),
              ...(filters.amountMin !== undefined ? { total: { gte: filters.amountMin } } : {}),
              ...(filters.amountMax !== undefined ? { total: { lte: filters.amountMax } } : {}),
            },
            include: { contact: true },
          })
        : Promise.resolve([]),

      !filters.documentType || filters.documentType === 'BILL'
        ? this.prisma.bill.findMany({
            where: {
              organizationId,
              ...(filters.dateFrom || filters.dateTo
                ? {
                    date: {
                      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
                      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
                    },
                  }
                : {}),
              ...(filters.amountMin !== undefined ? { total: { gte: filters.amountMin } } : {}),
              ...(filters.amountMax !== undefined ? { total: { lte: filters.amountMax } } : {}),
            },
            include: { contact: true },
          })
        : Promise.resolve([]),
    ]);

    // Fetch journal entries for all documents
    const allDocIds = [
      ...invoices.map((i) => ({ id: i.id, type: 'INVOICE' as const })),
      ...bills.map((b) => ({ id: b.id, type: 'BILL' as const })),
    ];

    if (allDocIds.length === 0) {
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Fetch journal entries and flags in parallel
    const [journalEntries, flags] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: {
          organizationId,
          referenceId: { in: allDocIds.map((d) => d.id) },
        },
        include: { lines: true },
      }),
      this.prisma.reconciliationFlag.findMany({
        where: {
          organizationId,
          documentId: { in: allDocIds.map((d) => d.id) },
          status: 'UNDER_REVIEW',
        },
        orderBy: { flaggedAt: 'desc' },
      }),
    ]);

    // Build a map: documentId -> { postedAmount, hasDraft, jeCount }
    const jeMap = new Map<string, { postedAmount: number; hasDraft: boolean; jeCount: number }>();
    for (const je of journalEntries) {
      if (!je.referenceId) continue;
      const existing = jeMap.get(je.referenceId) ?? {
        postedAmount: 0,
        hasDraft: false,
        jeCount: 0,
      };
      existing.jeCount += 1;
      if (je.status === 'posted') {
        // Sum all DEBIT lines as the journal amount for this document
        const debitTotal = je.lines
          .filter((l: { type: string }) => l.type === 'DEBIT')
          .reduce((sum: number, l: { amount: unknown }) => sum + Number(l.amount), 0);
        existing.postedAmount += debitTotal;
      } else if (je.status === 'draft') {
        existing.hasDraft = true;
      }
      jeMap.set(je.referenceId, existing);
    }

    // Build flag map: documentId -> most recent active flag
    const flagMap = new Map<string, { flaggedAt: Date; note: string }>();
    for (const flag of flags) {
      if (!flagMap.has(flag.documentId)) {
        flagMap.set(flag.documentId, { flaggedAt: flag.flaggedAt, note: flag.note });
      }
    }

    // Build reconciliation records
    const records: ReconciliationRecord[] = [
      ...invoices.map((inv) => {
        const je = jeMap.get(inv.id) ?? { postedAmount: 0, hasDraft: false, jeCount: 0 };
        const docAmount = Number(inv.total);
        const status = this.computeStatus(docAmount, je.postedAmount, je.hasDraft);
        const contact = inv.contact as {
          firstName?: string;
          lastName?: string;
          company?: string;
        } | null;
        const flag = flagMap.get(inv.id) ?? null;
        return {
          documentId: inv.id,
          documentNumber: inv.number,
          documentType: 'INVOICE' as const,
          documentDate: inv.date,
          totalAmount: docAmount,
          currency: (inv as { currency?: string }).currency ?? 'USD',
          journalEntryCount: je.jeCount,
          journalAmount: je.postedAmount,
          status,
          discrepancyAmount: Math.abs(docAmount - je.postedAmount),
          contactName: contact
            ? contact.company || `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
            : null,
          flaggedAt: flag ? flag.flaggedAt : null,
          flagReason: flag ? flag.note : null,
          lastCheckedAt: null,
        };
      }),
      ...bills.map((bill) => {
        const je = jeMap.get(bill.id) ?? { postedAmount: 0, hasDraft: false, jeCount: 0 };
        const docAmount = Number(bill.total);
        const status = this.computeStatus(docAmount, je.postedAmount, je.hasDraft);
        const contact = bill.contact as {
          firstName?: string;
          lastName?: string;
          company?: string;
        } | null;
        const flag = flagMap.get(bill.id) ?? null;
        return {
          documentId: bill.id,
          documentNumber: bill.number,
          documentType: 'BILL' as const,
          documentDate: bill.date,
          totalAmount: docAmount,
          currency: (bill as { currency?: string }).currency ?? 'USD',
          journalEntryCount: je.jeCount,
          journalAmount: je.postedAmount,
          status,
          discrepancyAmount: Math.abs(docAmount - je.postedAmount),
          contactName: contact
            ? contact.company || `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
            : null,
          flaggedAt: flag ? flag.flaggedAt : null,
          flagReason: flag ? flag.note : null,
          lastCheckedAt: null,
        };
      }),
    ];

    // Filter by status if requested
    const filtered = filters.status ? records.filter((r) => r.status === filters.status) : records;

    // Sort by date desc
    filtered.sort((a, b) => b.documentDate.getTime() - a.documentDate.getTime());

    const total = filtered.length;
    const skip = (page - 1) * pageSize;
    const paged = filtered.slice(skip, skip + pageSize);

    return { data: paged, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getSummary(organizationId: string) {
    const [invoices, bills] = await Promise.all([
      this.prisma.invoice.findMany({ where: { organizationId } }),
      this.prisma.bill.findMany({ where: { organizationId } }),
    ]);

    const allDocIds = [...invoices.map((i) => i.id), ...bills.map((b) => b.id)];

    const journalEntries = await this.prisma.journalEntry.findMany({
      where: {
        organizationId,
        referenceId: { in: allDocIds },
        status: 'posted',
      },
      include: { lines: true },
    });

    const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0);
    const totalBilled = bills.reduce((s, b) => s + Number(b.total), 0);

    // Total journaled = sum of all DEBIT lines in posted entries
    const totalJournaled = journalEntries.reduce((s, je) => {
      const debit = je.lines
        .filter((l: { type: string }) => l.type === 'DEBIT')
        .reduce((ls: number, l: { amount: unknown }) => ls + Number(l.amount), 0);
      return s + debit;
    }, 0);

    const totalDiscrepancyValue = Math.abs(totalInvoiced + totalBilled - totalJournaled);

    return {
      totalInvoiced,
      totalBilled,
      totalJournaled,
      totalDiscrepancyValue,
    };
  }

  async flagDiscrepancy(
    documentId: string,
    documentTypeHint: string | undefined,
    organizationId: string,
    note: string,
    userId: string,
    userRole: string,
  ) {
    if (!['accountant', 'admin', 'owner'].includes(userRole)) {
      throw new ForbiddenException('Only Accountant role can flag discrepancies');
    }

    // Auto-detect documentType if not provided, or verify the provided value
    let documentType: string;
    if (documentTypeHint === 'INVOICE') {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: documentId, organizationId },
      });
      if (!invoice) throw new NotFoundException(`Invoice ${documentId} not found`);
      documentType = 'INVOICE';
    } else if (documentTypeHint === 'BILL') {
      const bill = await this.prisma.bill.findFirst({
        where: { id: documentId, organizationId },
      });
      if (!bill) throw new NotFoundException(`Bill ${documentId} not found`);
      documentType = 'BILL';
    } else {
      // Auto-detect: try invoice first, then bill
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: documentId, organizationId },
      });
      if (invoice) {
        documentType = 'INVOICE';
      } else {
        const bill = await this.prisma.bill.findFirst({
          where: { id: documentId, organizationId },
        });
        if (!bill) throw new NotFoundException(`Document ${documentId} not found`);
        documentType = 'BILL';
      }
    }

    return this.prisma.reconciliationFlag.create({
      data: {
        documentId,
        documentType,
        organizationId,
        note: note || '',
        flaggedByUserId: userId,
        status: 'UNDER_REVIEW',
      },
    });
  }

  async getDocumentReconciliationStatus(
    documentId: string,
    documentType: 'INVOICE' | 'BILL',
    organizationId: string,
  ) {
    // Get the document
    let documentAmount = 0;
    if (documentType === 'INVOICE') {
      const inv = await this.prisma.invoice.findFirst({
        where: { id: documentId, organizationId },
      });
      if (!inv) throw new NotFoundException(`Invoice ${documentId} not found`);
      documentAmount = Number(inv.total);
    } else {
      const bill = await this.prisma.bill.findFirst({ where: { id: documentId, organizationId } });
      if (!bill) throw new NotFoundException(`Bill ${documentId} not found`);
      documentAmount = Number(bill.total);
    }

    const journalEntries = await this.prisma.journalEntry.findMany({
      where: { organizationId, referenceId: documentId, referenceType: documentType },
      include: { lines: true },
    });

    let postedAmount = 0;
    let hasDraft = false;
    for (const je of journalEntries) {
      if (je.status === 'posted') {
        postedAmount += je.lines
          .filter((l: { type: string }) => l.type === 'DEBIT')
          .reduce((s: number, l: { amount: unknown }) => s + Number(l.amount), 0);
      } else if (je.status === 'draft') {
        hasDraft = true;
      }
    }

    const status = this.computeStatus(documentAmount, postedAmount, hasDraft);

    return {
      documentId,
      documentType,
      documentAmount,
      journalAmount: postedAmount,
      status,
      discrepancyAmount: Math.abs(documentAmount - postedAmount),
    };
  }
}
