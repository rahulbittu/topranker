import { BRAND } from "./brand";

const Colors = {
  background: BRAND.colors.bg,
  surface: "#FFFFFF",
  surfaceRaised: "#F8F8F8",
  border: BRAND.colors.border,
  borderLight: BRAND.colors.border,

  gold: BRAND.colors.amber,
  goldDim: BRAND.colors.amberDark,
  goldFaint: "rgba(196, 154, 26, 0.08)",
  goldLight: "#FDF6E8",

  silver: "#AAAAAA",
  bronze: "#CCCCCC",

  text: BRAND.colors.ink,
  textSecondary: BRAND.colors.gray,
  textTertiary: BRAND.colors.lightGray,

  green: BRAND.colors.green,
  greenBright: BRAND.colors.green,
  greenFaint: "rgba(52, 199, 89, 0.08)",
  red: BRAND.colors.red,
  redBright: BRAND.colors.red,
  redFaint: "rgba(255, 59, 48, 0.08)",

  blue: BRAND.colors.gray,
  blueFaint: "rgba(99, 99, 102, 0.08)",

  rankUp: BRAND.colors.green,
  rankDown: BRAND.colors.red,
  rankStable: BRAND.colors.lightGray,

  tierNew: BRAND.colors.lightGray,
  tierRegular: BRAND.colors.gray,
  tierTrusted: BRAND.colors.dark,
  tierTop: BRAND.colors.amber,

  tint: BRAND.colors.amber,
  tabIconDefault: "#CCCCCC",
  tabIconSelected: BRAND.colors.ink,

  shadow: "rgba(0,0,0,0.06)",
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
};

export default Colors;
