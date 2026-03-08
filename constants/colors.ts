import { BRAND } from "./brand";

const AMBER = BRAND.colors.amber;
const AMBER_FAINT = "rgba(196, 154, 26, 0.08)";

const Colors = {
  // ── Brand aliases (re-exported from BRAND for convenience) ──
  brand: {
    amber:      BRAND.colors.amber,
    amberLight: BRAND.colors.amberLight,
    amberDark:  BRAND.colors.amberDark,
    amberFaint: AMBER_FAINT,
    amberGlow:  "rgba(196, 154, 26, 0.15)",
    navy:       BRAND.colors.navy,
    navyDark:   BRAND.colors.navyDark,
    ink:        BRAND.colors.ink,
    gold:       BRAND.colors.gold,
  },

  // ── Surfaces ──
  background: BRAND.colors.bg,
  surface: "#FFFFFF",
  surfaceRaised: "#F8F8F8",
  border: BRAND.colors.border,
  borderLight: BRAND.colors.border,

  // ── Accent ──
  gold: AMBER,
  goldFaint: AMBER_FAINT,
  goldLight: "#FDF6E8",

  silver: "#C0C0C0",
  bronze: "#AD8A56",

  // ── Text ──
  text: BRAND.colors.navy,
  textSecondary: BRAND.colors.gray,
  textTertiary: BRAND.colors.lightGray,

  // ── Status ──
  green: BRAND.colors.green,
  greenFaint: "rgba(52, 199, 89, 0.08)",
  red: BRAND.colors.red,
  redFaint: "rgba(255, 59, 48, 0.08)",

  blue: "#007AFF",
  blueFaint: "rgba(0, 122, 255, 0.08)",

  rankUp: BRAND.colors.green,
  rankDown: BRAND.colors.red,
  rankStable: BRAND.colors.lightGray,

  // ── Tab bar ──
  tint: AMBER,
  tabIconDefault: BRAND.colors.lightGray,
  tabIconSelected: AMBER,

  // ── Shadows ──
  shadow: "rgba(0,0,0,0.06)",
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
};

export default Colors;
