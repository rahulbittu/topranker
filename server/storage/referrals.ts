/**
 * Sprint 188: Referral tracking storage.
 * Tracks who referred whom and referral conversion status.
 */

import { eq, and, desc, count } from "drizzle-orm";
import { referrals, members, type Referral } from "@shared/schema";
import { db } from "../db";

/**
 * Create a referral record when a new user signs up with a referral code.
 */
export async function createReferral(
  referrerId: string,
  referredId: string,
  referralCode: string,
): Promise<Referral> {
  const [referral] = await db
    .insert(referrals)
    .values({
      referrerId,
      referredId,
      referralCode,
      status: "signed_up",
    })
    .returning();
  return referral;
}

/**
 * Look up a member by their referral code (username-based).
 * Returns the referrer's member ID or null if code is invalid.
 */
export async function resolveReferralCode(code: string): Promise<string | null> {
  if (!code || code.trim().length === 0) return null;

  // Referral codes are uppercase usernames
  const username = code.trim().toLowerCase();
  const [member] = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.username, username));

  return member?.id || null;
}

/**
 * Get referral stats for a member (as referrer).
 */
export async function getReferralStats(memberId: string): Promise<{
  totalReferred: number;
  activated: number;
  referrals: Array<{
    id: string;
    referredName: string;
    referredUsername: string;
    status: string;
    createdAt: Date;
  }>;
}> {
  const rows = await db
    .select({
      id: referrals.id,
      referredName: members.displayName,
      referredUsername: members.username,
      status: referrals.status,
      createdAt: referrals.createdAt,
    })
    .from(referrals)
    .innerJoin(members, eq(referrals.referredId, members.id))
    .where(eq(referrals.referrerId, memberId))
    .orderBy(desc(referrals.createdAt));

  const totalReferred = rows.length;
  const activated = rows.filter(r => r.status === "activated").length;

  return { totalReferred, activated, referrals: rows };
}

/**
 * Mark a referral as "activated" when the referred user submits their first rating.
 */
export async function activateReferral(referredId: string): Promise<void> {
  await db
    .update(referrals)
    .set({ status: "activated", activatedAt: new Date() })
    .where(and(eq(referrals.referredId, referredId), eq(referrals.status, "signed_up")));
}

/**
 * Check if a member was referred by someone.
 */
export async function getReferrerForMember(memberId: string): Promise<string | null> {
  const [ref] = await db
    .select({ referrerId: referrals.referrerId })
    .from(referrals)
    .where(eq(referrals.referredId, memberId));
  return ref?.referrerId || null;
}
