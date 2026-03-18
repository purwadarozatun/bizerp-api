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
export declare class BillExpenseService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    /**
     * Called when a bill is approved.
     * Creates a pending expense entry linked to the bill.
     */
    onApproved(billId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string | null;
        status: string;
        voidReason: string | null;
        referenceNo: string | null;
        billId: string;
        category: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        expenseDate: Date;
        completedAt: Date | null;
        voidedAt: Date | null;
    } | undefined>;
    /**
     * Called when a bill is marked as paid.
     * Updates the linked expense entry to completed.
     */
    onPaid(billId: string, completedAt: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string | null;
        status: string;
        voidReason: string | null;
        referenceNo: string | null;
        billId: string;
        category: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        expenseDate: Date;
        completedAt: Date | null;
        voidedAt: Date | null;
    } | undefined>;
    /**
     * Called when a bill is rejected or deleted.
     * Voids the linked expense entry if one exists.
     */
    onVoided(billId: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string | null;
        status: string;
        voidReason: string | null;
        referenceNo: string | null;
        billId: string;
        category: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        expenseDate: Date;
        completedAt: Date | null;
        voidedAt: Date | null;
    } | undefined>;
    /**
     * Returns all bill-sourced expense entries for the organization.
     * Supports optional status filter.
     */
    findAll(organizationId: string, status?: string): Promise<({
        bill: {
            contact: {
                id: string;
                address: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                email: string | null;
                firstName: string | null;
                lastName: string | null;
                type: string;
                notes: string | null;
                company: string | null;
                phone: string | null;
                website: string | null;
                tags: string[];
                isCustomer: boolean;
                isVendor: boolean;
            };
        } & {
            number: string;
            id: string;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            date: Date;
            status: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            contactId: string;
            dueDate: Date;
            notes: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            expenseCategory: string | null;
            referenceNo: string | null;
            rejectionReason: string | null;
            paidAt: Date | null;
            paidMethod: string | null;
            paidReference: string | null;
            paidNotes: string | null;
            approvedAt: Date | null;
            approvedById: string | null;
            submittedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        description: string | null;
        status: string;
        voidReason: string | null;
        referenceNo: string | null;
        billId: string;
        category: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        expenseDate: Date;
        completedAt: Date | null;
        voidedAt: Date | null;
    })[]>;
}
//# sourceMappingURL=bill-expense.service.d.ts.map