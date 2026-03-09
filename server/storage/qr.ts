/**
 * QR Code Storage — Sprint 178
 * Track QR scan events and calculate conversion metrics.
 */
import { eq, count, and, gte, desc, sql } from "drizzle-orm";
import { qrScans, ratings } from "@shared/schema";
import { db } from "../db";

export async function recordQrScan(
  businessId: string,
  memberId: string | null,
): Promise<{ id: string }> {
  const [scan] = await db
    .insert(qrScans)
    .values({
      businessId,
      memberId: memberId || undefined,
    })
    .returning({ id: qrScans.id });
  return scan;
}

export async function getQrScanStats(businessId: string): Promise<{
  totalScans: number;
  uniqueMembers: number;
  conversions: number;
  conversionRate: number;
  last7Days: number;
  last30Days: number;
}> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total scans
  const [totalResult] = await db
    .select({ cnt: count() })
    .from(qrScans)
    .where(eq(qrScans.businessId, businessId));
  const totalScans = Number(totalResult?.cnt ?? 0);

  // Unique members (non-null memberId)
  const [uniqueResult] = await db
    .select({ cnt: sql<number>`count(distinct ${qrScans.memberId})` })
    .from(qrScans)
    .where(eq(qrScans.businessId, businessId));
  const uniqueMembers = Number(uniqueResult?.cnt ?? 0);

  // Conversions (scans where converted = true)
  const [conversionResult] = await db
    .select({ cnt: count() })
    .from(qrScans)
    .where(and(eq(qrScans.businessId, businessId), eq(qrScans.converted, true)));
  const conversions = Number(conversionResult?.cnt ?? 0);

  // Last 7 days
  const [weekResult] = await db
    .select({ cnt: count() })
    .from(qrScans)
    .where(and(eq(qrScans.businessId, businessId), gte(qrScans.scannedAt, sevenDaysAgo)));
  const last7Days = Number(weekResult?.cnt ?? 0);

  // Last 30 days
  const [monthResult] = await db
    .select({ cnt: count() })
    .from(qrScans)
    .where(and(eq(qrScans.businessId, businessId), gte(qrScans.scannedAt, thirtyDaysAgo)));
  const last30Days = Number(monthResult?.cnt ?? 0);

  const conversionRate = totalScans > 0 ? Math.round((conversions / totalScans) * 100) : 0;

  return { totalScans, uniqueMembers, conversions, conversionRate, last7Days, last30Days };
}

/**
 * Mark a QR scan as converted (user submitted a rating after scanning).
 * Called from rating submission when source is "qr_scan".
 */
export async function markQrScanConverted(scanId: string): Promise<void> {
  await db
    .update(qrScans)
    .set({ converted: true })
    .where(eq(qrScans.id, scanId));
}
