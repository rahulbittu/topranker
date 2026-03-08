/**
 * Featured Placements Storage — tracks active featured business placements.
 * Handles activation, expiry checking, and city-level queries.
 */
import { eq, and, gt, lte, desc } from "drizzle-orm";
import { featuredPlacements, type FeaturedPlacement } from "@shared/schema";
import { db } from "../db";

const FEATURED_DURATION_DAYS = 7;

export async function createFeaturedPlacement(params: {
  businessId: string;
  paymentId?: string;
  city: string;
}): Promise<FeaturedPlacement> {
  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const [placement] = await db
    .insert(featuredPlacements)
    .values({
      businessId: params.businessId,
      paymentId: params.paymentId || null,
      city: params.city,
      startsAt,
      expiresAt,
      status: "active",
    })
    .returning();
  return placement;
}

export async function getActiveFeaturedInCity(
  city: string,
): Promise<FeaturedPlacement[]> {
  const now = new Date();
  return db
    .select()
    .from(featuredPlacements)
    .where(
      and(
        eq(featuredPlacements.city, city),
        eq(featuredPlacements.status, "active"),
        gt(featuredPlacements.expiresAt, now),
      ),
    )
    .orderBy(desc(featuredPlacements.createdAt));
}

export async function getBusinessFeaturedStatus(
  businessId: string,
): Promise<FeaturedPlacement | null> {
  const now = new Date();
  const [placement] = await db
    .select()
    .from(featuredPlacements)
    .where(
      and(
        eq(featuredPlacements.businessId, businessId),
        eq(featuredPlacements.status, "active"),
        gt(featuredPlacements.expiresAt, now),
      ),
    )
    .orderBy(desc(featuredPlacements.createdAt))
    .limit(1);
  return placement ?? null;
}

export async function expireOldPlacements(): Promise<number> {
  const now = new Date();
  const result = await db
    .update(featuredPlacements)
    .set({ status: "expired" })
    .where(
      and(
        eq(featuredPlacements.status, "active"),
        lte(featuredPlacements.expiresAt, now),
      ),
    )
    .returning();
  return result.length;
}
