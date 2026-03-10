/**
 * Social Sharing Utility — Sprint 118
 * Deep link generation and URL parsing for social sharing.
 * Owner: Jasmine Taylor (Marketing)
 */

// Sprint 547: Aligned share domain from topranker.app → topranker.com (matches app.json deeplinks)
export const SHARE_DOMAINS = ["topranker.com", "www.topranker.com"] as const;

/**
 * Generate a shareable URL for a business, challenger match, or profile.
 */
export function getShareUrl(type: "business" | "challenger" | "profile", slug: string): string {
  return `https://topranker.com/${type}/${slug}`;
}

/**
 * Generate formatted share text for a business with its rating.
 */
export function getShareText(businessName: string, rating: number): string {
  return `Check out ${businessName} on TopRanker — rated ${rating.toFixed(1)}/5! https://topranker.com`;
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
 * Parse a TopRanker URL and extract the type and slug.
 * Returns null if the URL doesn't match expected patterns.
 */
export function getDeepLinkParams(url: string): { type: string; slug: string } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    // Sprint 547: Accept both topranker.com (primary) and topranker.app (legacy)
    if (host !== "topranker.com" && host !== "topranker.app") return null;

    // Expected format: /type/slug
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    return { type: segments[0], slug: segments[1] };
  } catch {
    return null;
  }
}
