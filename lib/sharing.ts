/**
 * Social Sharing Utility — Sprint 118
 * Deep link generation and URL parsing for social sharing.
 * Owner: Jasmine Taylor (Marketing)
 */

// Sprint 547: Aligned share domain from topranker.app → topranker.com (matches app.json deeplinks)
export const SHARE_DOMAINS = ["topranker.com", "www.topranker.com", "topranker.io", "www.topranker.io"] as const;

// Sprint 742: Centralized share base URL — always production, never changes per environment
export const SHARE_BASE_URL = "https://topranker.com" as const;

/**
 * Generate a shareable URL for a business, challenger match, or profile.
 */
export function getShareUrl(type: "business" | "challenger" | "profile" | "share", slug: string): string {
  return `${SHARE_BASE_URL}/${type}/${slug}`;
}

/**
 * Generate formatted share text for a business with its rating.
 */
export function getShareText(businessName: string, rating: number): string {
  return `Check out ${businessName} on TopRanker — rated ${rating.toFixed(1)}/5! ${SHARE_BASE_URL}`;
}

/**
 * Copy a shareable URL to clipboard with haptic + alert feedback.
 * Returns true if successful, false if clipboard is unavailable.
 */
export async function copyShareLink(
  url: string,
  label?: string,
): Promise<boolean> {
  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(url);
    const { Alert } = await import("react-native");
    Alert.alert("Link Copied", label ? `${label} link copied to clipboard!` : "Link copied to clipboard!");
    return true;
  } catch {
    return false;
  }
}

/**
 * Sprint 539: Share directly to WhatsApp with pre-filled text.
 * Uses wa.me universal link which works on both iOS and Android.
 */
export async function shareToWhatsApp(text: string): Promise<boolean> {
  try {
    const { Linking } = await import("react-native");
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    // Fallback: try whatsapp:// scheme
    const fallback = `whatsapp://send?text=${encoded}`;
    await Linking.openURL(fallback);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sprint 539: Generate WhatsApp-optimized "Best In" share text.
 * Designed for controversy-driven engagement in WhatsApp groups.
 */
export function getBestInShareText(
  dishOrCategory: string,
  city: string,
  businessName: string,
  rank: number,
  url: string,
): string {
  const emoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🔥";
  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
  if (rank === 1) {
    return `${emoji} Best ${dishOrCategory} in ${cityTitle} is ${businessName}!\n\nAgree or disagree? Check the live ranking:\n${url}`;
  }
  return `${emoji} ${businessName} is #${rank} for ${dishOrCategory} in ${cityTitle}\n\nThink they should be higher? Rate them:\n${url}`;
}

/**
 * Sprint 539: Generate share text for a dish leaderboard.
 */
export function getDishLeaderboardShareText(
  dishName: string,
  city: string,
  entryCount: number,
  url: string,
): string {
  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
  return `🍽️ Best ${dishName} in ${cityTitle} — ${entryCount} spots ranked!\n\nWho's your pick? See the full ranking:\n${url}`;
}

/**
 * Sprint 608: Generate post-rating share text for WhatsApp.
 * "Best [dish] in [city]" format — controversy-driven engagement.
 */
export function getRatingShareText(
  businessName: string,
  dishName: string | null,
  city: string,
  rank: number,
  url: string,
): string {
  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
  const emoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🔥";
  if (dishName) {
    return `${emoji} I just rated ${businessName} for ${dishName} in ${cityTitle}!\n\nThink you know better? Rate it yourself:\n${url}`;
  }
  return `${emoji} I just rated ${businessName} in ${cityTitle}!\n\nAgree or disagree? Rate it yourself:\n${url}`;
}

/**
 * Sprint 646: Generate profile share text.
 */
export function getProfileShareText(
  displayName: string,
  ratingCount: number,
  tier: string,
): string {
  const tierTitle = tier.charAt(0).toUpperCase() + tier.slice(1);
  return `🏆 ${displayName} is a ${tierTitle} Judge on TopRanker with ${ratingCount} rating${ratingCount !== 1 ? "s" : ""}!\n\nJoin and rate your favorite spots:\n${SHARE_BASE_URL}`;
}

/**
 * Sprint 644: Generate WhatsApp-optimized search share text.
 * "Best [query] in [city]" format for controversy-driven engagement.
 */
export function getSearchShareText(
  query: string,
  city: string,
  resultCount: number,
  url: string,
): string {
  const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
  if (query.trim()) {
    return `🔍 Best "${query}" in ${cityTitle} — ${resultCount} spot${resultCount !== 1 ? "s" : ""} ranked!\n\nSee the live ranking:\n${url}`;
  }
  return `🔍 Top restaurants in ${cityTitle} — ${resultCount} spots ranked!\n\nSee the live ranking:\n${url}`;
}

/**
 * Parse a TopRanker URL and extract the type and slug.
 * Returns null if the URL doesn't match expected patterns.
 */
export function getDeepLinkParams(url: string): { type: string; slug: string } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    // Sprint 547: Accept topranker.com (primary) and topranker.app (legacy)
    // Sprint 731: Accept topranker.io (custom domain)
    if (host !== "topranker.com" && host !== "topranker.app" && host !== "topranker.io") return null;

    // Expected format: /type/slug
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    return { type: segments[0], slug: segments[1] };
  } catch {
    return null;
  }
}
