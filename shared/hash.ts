/**
 * Shared deterministic string hash (DJB2 variant).
 *
 * Used by both client-side A/B testing (lib/ab-testing.ts) and
 * server-side experiment assignment (server/routes-experiments.ts).
 * Extracted to a single source of truth per Arch Audit #12 (N3).
 *
 * Returns a positive integer for consistent bucketing.
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}
