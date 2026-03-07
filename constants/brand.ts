// ─────────────────────────────────────────────────────────────
// TopRanker Brand System
// Drop this file into: constants/brand.ts
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  colors: {
    amber:       "#C49A1A",  // Primary accent — CTAs, icons, highlights
    amberLight:  "#F0C84A",  // Hover states, gradients
    amberDark:   "#9A7510",  // Pressed states, shadows
    navy:        "#0D1B2A",  // Dark surfaces, headers
    ink:         "#111111",  // Primary text
    dark:        "#1C1C1E",  // Cards on dark bg
    gray:        "#636366",  // Secondary text
    lightGray:   "#8E8E93",  // Placeholder, muted
    border:      "#E5E5EA",  // Dividers, outlines
    bg:          "#F7F6F3",  // App background (warm bone)
    green:       "#34C759",  // OPEN status
    red:         "#FF3B30",  // CLOSED status
    gold:        "#FFD700",  // #1 champion, medals
  },

  fonts: {
    display: "'Playfair Display', serif",   // Headlines, scores, names
    sans:    "'DM Sans', sans-serif",       // UI, body, buttons
  },

  tagline: "Where your rankings matter.",
};

// ─────────────────────────────────────────────────────────────
// Mark: Leaderboard Bars (recommended mark)
// Three bars = instant rankings. Crown dot = #1 champion.
// ─────────────────────────────────────────────────────────────
export const MARK_SVG_PATHS = {
  // Use this to embed inline anywhere
  leaderboard: `
    <rect x="2" y="28" width="11" height="16" rx="2.5"/>
    <rect x="18.5" y="10" width="11" height="34" rx="2.5"/>
    <rect x="35" y="20" width="11" height="24" rx="2.5"/>
    <circle cx="24" cy="5" r="3.5"/>
  `,
};

export const BRAND_MARK_VIEWBOX = "0 0 48 48";
