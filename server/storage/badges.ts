/**
 * Badge Storage — CRUD for earned member badges
 * Owner: Sage (Backend Engineer #2)
 *
 * Persists earned badges in the member_badges table.
 * Enables badge counts, leaderboard badge display, and share-by-link.
 */
import { eq, and, count, desc } from "drizzle-orm";
import { memberBadges, members, type MemberBadge } from "@shared/schema";
import { db } from "../db";

/**
 * Get all badges earned by a member
 */
export async function getMemberBadges(memberId: string): Promise<MemberBadge[]> {
  return db
    .select()
    .from(memberBadges)
    .where(eq(memberBadges.memberId, memberId))
    .orderBy(memberBadges.earnedAt);
}

/**
 * Get count of badges earned by a member
 */
export async function getMemberBadgeCount(memberId: string): Promise<number> {
  const [result] = await db
    .select({ cnt: count() })
    .from(memberBadges)
    .where(eq(memberBadges.memberId, memberId));
  return Number(result?.cnt ?? 0);
}

/**
 * Record a newly earned badge. Ignores duplicates (unique constraint).
 */
export async function awardBadge(
  memberId: string,
  badgeId: string,
  badgeFamily: string,
): Promise<MemberBadge | null> {
  try {
    const [badge] = await db
      .insert(memberBadges)
      .values({ memberId, badgeId, badgeFamily })
      .onConflictDoNothing()
      .returning();
    return badge ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if a member has a specific badge
 */
export async function hasBadge(memberId: string, badgeId: string): Promise<boolean> {
  const [result] = await db
    .select({ cnt: count() })
    .from(memberBadges)
    .where(and(eq(memberBadges.memberId, memberId), eq(memberBadges.badgeId, badgeId)));
  return Number(result?.cnt ?? 0) > 0;
}

/**
 * Get badge IDs earned by a member (lighter than full records)
 */
export async function getEarnedBadgeIds(memberId: string): Promise<string[]> {
  const rows = await db
    .select({ badgeId: memberBadges.badgeId })
    .from(memberBadges)
    .where(eq(memberBadges.memberId, memberId));
  return rows.map(r => r.badgeId);
}

/**
 * Badge leaderboard — top members ranked by badge count
 */
export async function getBadgeLeaderboard(limit: number = 20) {
  return db
    .select({
      memberId: memberBadges.memberId,
      displayName: members.displayName,
      username: members.username,
      avatarUrl: members.avatarUrl,
      credibilityTier: members.credibilityTier,
      badgeCount: count(memberBadges.id),
    })
    .from(memberBadges)
    .innerJoin(members, eq(memberBadges.memberId, members.id))
    .groupBy(memberBadges.memberId, members.displayName, members.username, members.avatarUrl, members.credibilityTier)
    .orderBy(desc(count(memberBadges.id)))
    .limit(limit);
}
