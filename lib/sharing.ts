/**
 * Social Sharing Utility — Sprint 118
 * Deep link generation and URL parsing for social sharing.
 * Owner: Jasmine Taylor (Marketing)
 */

export const SHARE_DOMAINS = ["topranker.app", "www.topranker.app"] as const;

/**
 * Generate a shareable URL for a business, challenger match, or profile.
 */
export function getShareUrl(type: "business" | "challenger" | "profile", slug: string): string {
  return `https://topranker.app/${type}/${slug}`;
}

/**
 * Generate formatted share text for a business with its rating.
 */
export function getShareText(businessName: string, rating: number): string {
  return `Check out ${businessName} on TopRanker — rated ${rating.toFixed(1)}/5! https://topranker.app`;
}

/**
 * Parse a TopRanker URL and extract the type and slug.
 * Returns null if the URL doesn't match expected patterns.
 */
export function getDeepLinkParams(url: string): { type: string; slug: string } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "topranker.app") return null;

    // Expected format: /type/slug
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    return { type: segments[0], slug: segments[1] };
  } catch {
    return null;
  }
}
