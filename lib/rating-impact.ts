/**
 * Tracks recent rating impact for "Your Rating Moved This" banner.
 * In-memory store with 60-second TTL. No persistence needed —
 * impact is only meaningful immediately after rating.
 *
 * Sprint 157 — core loop consequence visibility
 */

interface RatingImpact {
  businessSlug: string;
  prevRank: number;
  newRank: number;
  timestamp: number;
}

const IMPACT_TTL_MS = 60_000; // 60 seconds
const recentImpacts = new Map<string, RatingImpact>();

export function setRatingImpact(slug: string, prevRank: number, newRank: number) {
  recentImpacts.set(slug, {
    businessSlug: slug,
    prevRank,
    newRank,
    timestamp: Date.now(),
  });
}

export function getRatingImpact(slug: string): RatingImpact | null {
  const impact = recentImpacts.get(slug);
  if (!impact) return null;
  if (Date.now() - impact.timestamp > IMPACT_TTL_MS) {
    recentImpacts.delete(slug);
    return null;
  }
  return impact;
}

export function clearRatingImpact(slug: string) {
  recentImpacts.delete(slug);
}
