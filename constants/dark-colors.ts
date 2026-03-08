/**
 * Dark Mode Colors — Sprint 110 / Normalized Sprint 113
 * Dark theme palette that preserves brand identity.
 * Matches the structure of constants/colors.ts for theme swapping.
 * Owner: Leo Hernandez (Design)
 */
import { BRAND } from "./brand";

const AMBER = BRAND.colors.amber;

/** Raw dark palette (original Sprint 110 export) */
export const DARK_COLORS = {
  background: "#0D1117",
  surface: "#161B22",
  surfaceElevated: "#1C2128",
  text: "#E6EDF3",
  textSecondary: "#8B949E",
  textTertiary: "#484F58",
  amber: BRAND.colors.amber,
  amberLight: "#D4A824",
  amberFaint: "rgba(196, 154, 26, 0.15)",
  border: "#30363D",
  borderFaint: "#21262D",
  success: "#3FB950",
  error: "#F85149",
  warning: "#D29922",
  gold: BRAND.colors.gold,
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  card: "#161B22",
  cardBorder: "#30363D",
  tabBarBackground: "#0D1117",
  tabBarBorder: "#21262D",
} as const;

/** Normalized dark colors — matches Colors shape from colors.ts */
export const darkColors = {
  brand: {
    amber: AMBER,
    amberLight: "#D4A824",
    amberDark: BRAND.colors.amberDark,
    amberFaint: "rgba(196, 154, 26, 0.15)",
    amberGlow: "rgba(196, 154, 26, 0.20)",
    navy: BRAND.colors.navy,
    navyDark: "#060D16",
    ink: "#E6EDF3",
    gold: BRAND.colors.gold,
  },
  background: "#0D1117",
  surface: "#161B22",
  surfaceRaised: "#1C2128",
  border: "#30363D",
  borderLight: "#21262D",
  gold: AMBER,
  goldFaint: "rgba(196, 154, 26, 0.15)",
  goldLight: "#1C2128",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  text: "#E6EDF3",
  textSecondary: "#8B949E",
  textTertiary: "#484F58",
  green: "#3FB950",
  greenFaint: "rgba(63, 185, 80, 0.12)",
  red: "#F85149",
  redFaint: "rgba(248, 81, 73, 0.12)",
  blue: "#58A6FF",
  blueFaint: "rgba(88, 166, 255, 0.12)",
  rankUp: "#3FB950",
  rankDown: "#F85149",
  rankStable: "#484F58",
  tint: AMBER,
  tabIconDefault: "#484F58",
  tabIconSelected: AMBER,
  shadow: "rgba(0,0,0,0.30)",
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 5,
  },
};
