/**
 * Typography System — Sprint 104
 * Centralized font definitions for brand consistency.
 * Owner: Leo Hernandez (Design)
 */
export const TYPOGRAPHY = {
  // Display — Playfair Display for scores, headings, hero text
  display: {
    fontFamily: "PlayfairDisplay_900Black",
    hero: { fontSize: 32, fontWeight: "900" as const },
    heading: { fontSize: 24, fontWeight: "900" as const },
    score: { fontSize: 20, fontWeight: "900" as const },
    small: { fontSize: 17, fontWeight: "700" as const },
  },
  // UI — DM Sans for body, labels, buttons
  ui: {
    fontFamily: "DMSans_400Regular",
    body: { fontSize: 14, fontFamily: "DMSans_400Regular" },
    bodyBold: { fontSize: 14, fontFamily: "DMSans_700Bold" },
    label: { fontSize: 12, fontFamily: "DMSans_500Medium" },
    button: { fontSize: 15, fontFamily: "DMSans_700Bold" },
    caption: { fontSize: 11, fontFamily: "DMSans_400Regular" },
    small: { fontSize: 10, fontFamily: "DMSans_400Regular" },
  },
} as const;
