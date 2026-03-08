/**
 * Payments Storage — audit trail for all payment transactions.
 */
import { eq, and, desc } from "drizzle-orm";
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
