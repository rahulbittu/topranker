/**
 * Dark Mode Colors — Sprint 110
 * Dark theme palette that preserves brand identity.
 * Owner: Leo Hernandez (Design)
 */
import { BRAND } from "./brand";

export const DARK_COLORS = {
  // Surfaces
  background: "#0D1117",
  surface: "#161B22",
  surfaceElevated: "#1C2128",

  // Text
  text: "#E6EDF3",
  textSecondary: "#8B949E",
  textTertiary: "#484F58",

  // Brand (amber stays consistent across themes)
  amber: BRAND.colors.amber,
  amberLight: "#D4A824",
  amberFaint: "rgba(196, 154, 26, 0.15)",

  // Borders
  border: "#30363D",
  borderFaint: "#21262D",

  // Feedback
  success: "#3FB950",
  error: "#F85149",
  warning: "#D29922",

  // Medals (same as light — metallic colors work on dark)
  gold: BRAND.colors.gold,
  silver: "#C0C0C0",
  bronze: "#CD7F32",

  // Cards
  card: "#161B22",
  cardBorder: "#30363D",

  // Tab bar
  tabBarBackground: "#0D1117",
  tabBarBorder: "#21262D",
} as const;
