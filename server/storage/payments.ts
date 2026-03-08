/**
 * Payments Storage — audit trail for all payment transactions.
 */
import { eq, and, desc, sql, count, sum } from "drizzle-orm";
import { payments, type Payment } from "@shared/schema";
import { db } from "../db";

export async function createPaymentRecord(params: {
  memberId: string;
  businessId?: string;
  type: string;
  amount: number;
  currency?: string;
  stripePaymentIntentId?: string;
  status: string;
  metadata?: Record<string, string>;
}): Promise<Payment> {
  const [payment] = await db
    .insert(payments)
    .values({
      memberId: params.memberId,
      businessId: params.businessId || null,
      type: params.type,
      amount: params.amount,
      currency: params.currency || "usd",
      stripePaymentIntentId: params.stripePaymentIntentId || null,
      status: params.status,
      metadata: params.metadata || null,
    })
    .returning();
  return payment;
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);
  return payment ?? null;
}

export async function updatePaymentStatus(
  id: string,
  status: string,
): Promise<Payment | null> {
  const [updated] = await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, id))
    .returning();
  return updated ?? null;
}

export async function updatePaymentStatusByStripeId(
  stripePaymentIntentId: string,
  status: string,
): Promise<Payment | null> {
  const [updated] = await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
    .returning();
  return updated ?? null;
}

export async function getMemberPayments(
  memberId: string,
  limit: number = 20,
): Promise<Payment[]> {
  return db
    .select()
    .from(payments)
    .where(eq(payments.memberId, memberId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function getBusinessPayments(
  businessId: string,
  limit: number = 20,
): Promise<Payment[]> {
  return db
    .select()
    .from(payments)
    .where(eq(payments.businessId, businessId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

/**
 * Aggregated revenue metrics for the admin dashboard.
 * Counts and sums payments grouped by type and status.
 */
export async function getRevenueMetrics() {
  // Revenue by type (only succeeded payments count as revenue)
  const byTypeRows = await db
    .select({
      type: payments.type,
      count: count(),
      revenue: sum(payments.amount),
    })
    .from(payments)
    .where(eq(payments.status, "succeeded"))
    .groupBy(payments.type);

  // Active subscriptions (succeeded, not cancelled/refunded)
  const [activeRow] = await db
    .select({ count: count() })
    .from(payments)
    .where(
      and(
        eq(payments.status, "succeeded"),
      ),
    );

  // Cancelled payments
  const [cancelledRow] = await db
    .select({ count: count() })
    .from(payments)
    .where(eq(payments.status, "cancelled"));

  // Build the byType map with known payment types
  const typeMap: Record<string, { count: number; revenue: number }> = {
    challenger_entry: { count: 0, revenue: 0 },
    dashboard_pro: { count: 0, revenue: 0 },
    featured_placement: { count: 0, revenue: 0 },
  };

  let totalRevenue = 0;
  for (const row of byTypeRows) {
    const rev = Number(row.revenue) || 0;
    const cnt = Number(row.count) || 0;
    typeMap[row.type] = { count: cnt, revenue: rev };
    totalRevenue += rev;
  }

  return {
    totalRevenue,
    byType: typeMap,
    activeSubscriptions: activeRow?.count ?? 0,
    cancelledPayments: cancelledRow?.count ?? 0,
  };
}
