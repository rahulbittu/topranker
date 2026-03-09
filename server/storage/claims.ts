/**
 * Claims & Flags Storage — Admin review for business claims and rating flags
 * Owner: Sage (Backend Engineer #2) + Priya (RBAC Lead)
 */
import { eq, and, count, desc } from "drizzle-orm";
import {
  businessClaims, ratingFlags, businesses, members, ratings,
  type BusinessClaim, type RatingFlag,
} from "@shared/schema";
import { db } from "../db";

// ── Business Claims ──────────────────────────────────────────────

export async function submitClaim(
  businessId: string,
  memberId: string,
  verificationMethod: string,
): Promise<BusinessClaim> {
  const [claim] = await db
    .insert(businessClaims)
    .values({ businessId, memberId, verificationMethod })
    .returning();
  return claim;
}

export async function getClaimByMemberAndBusiness(
  memberId: string,
  businessId: string,
): Promise<BusinessClaim | undefined> {
  const [claim] = await db
    .select()
    .from(businessClaims)
    .where(
      and(
        eq(businessClaims.memberId, memberId),
        eq(businessClaims.businessId, businessId),
      ),
    );
  return claim;
}

export async function getPendingClaims() {
  return db
    .select({
      id: businessClaims.id,
      businessId: businessClaims.businessId,
      businessName: businesses.name,
      memberId: businessClaims.memberId,
      memberName: members.displayName,
      verificationMethod: businessClaims.verificationMethod,
      status: businessClaims.status,
      submittedAt: businessClaims.submittedAt,
    })
    .from(businessClaims)
    .leftJoin(businesses, eq(businessClaims.businessId, businesses.id))
    .leftJoin(members, eq(businessClaims.memberId, members.id))
    .where(eq(businessClaims.status, "pending"))
    .orderBy(desc(businessClaims.submittedAt));
}

export async function reviewClaim(
  id: string,
  status: "approved" | "rejected",
  reviewedBy: string,
) {
  const [updated] = await db
    .update(businessClaims)
    .set({ status, reviewedAt: new Date() })
    .where(eq(businessClaims.id, id))
    .returning();

  if (!updated) return null;

  // On approval, transfer ownership to the claiming member (Sprint 173)
  if (status === "approved" && updated.businessId && updated.memberId) {
    await db
      .update(businesses)
      .set({
        ownerId: updated.memberId,
        isClaimed: true,
        claimedAt: new Date(),
      })
      .where(eq(businesses.id, updated.businessId));
  }

  return updated;
}

export async function getClaimCount() {
  const [result] = await db
    .select({ cnt: count() })
    .from(businessClaims)
    .where(eq(businessClaims.status, "pending"));
  return Number(result?.cnt ?? 0);
}

// ── Rating Flags ────────────────────────────────────────────────

export async function getPendingFlags() {
  return db
    .select({
      id: ratingFlags.id,
      ratingId: ratingFlags.ratingId,
      flaggerName: members.displayName,
      explanation: ratingFlags.explanation,
      aiFraudProbability: ratingFlags.aiFraudProbability,
      status: ratingFlags.status,
      createdAt: ratingFlags.createdAt,
    })
    .from(ratingFlags)
    .leftJoin(members, eq(ratingFlags.flaggerId, members.id))
    .where(eq(ratingFlags.status, "pending"))
    .orderBy(desc(ratingFlags.createdAt));
}

export async function reviewFlag(
  id: string,
  status: "confirmed" | "dismissed",
  reviewedBy: string,
) {
  const [updated] = await db
    .update(ratingFlags)
    .set({ status, reviewedBy, reviewedAt: new Date() })
    .where(eq(ratingFlags.id, id))
    .returning();
  return updated ?? null;
}

export async function getFlagCount() {
  const [result] = await db
    .select({ cnt: count() })
    .from(ratingFlags)
    .where(eq(ratingFlags.status, "pending"));
  return Number(result?.cnt ?? 0);
}
