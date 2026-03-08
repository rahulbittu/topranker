// TopRanker Brand System

export const BRAND = {
  colors: {
    amber:      "#C49A1A",
    amberLight: "#F0C84A",
    amberDark:  "#9A7510",
    navy:       "#0D1B2A",
    navyDark:   "#162940",
    ink:        "#111111",
    dark:       "#1C1C1E",
    gray:       "#636366",
    lightGray:  "#8E8E93",
    border:     "#E5E5EA",
    bg:         "#F7F6F3",
    green:      "#34C759",
    red:        "#FF3B30",
    gold:       "#FFD700",
  },
  tagline: "Where your rankings matter.",
};

export const CATEGORY_LABELS: Record<string, string> = {
  all:           "All",
  restaurants:   "Restaurants",
  restaurant:    "Restaurants",
  fast_food:     "Fast Food",
  fine_dining:   "Fine Dining",
  casual_dining: "Casual Dining",
  cafes:         "Cafes",
  cafe:          "Cafes",
  bakeries:      "Bakeries",
  bakery:        "Bakeries",
  street_food:   "Street Food",
  bars:          "Bars",
  bar:           "Bars",
  brewery:       "Breweries",
  breweries:     "Breweries",
  bubble_tea:    "Bubble Tea",
  ice_cream:     "Ice Cream",
  buffet:        "Buffets",
  buffets:       "Buffets",
  brunch:        "Brunch",
  dessert_bar:   "Dessert Bars",
  food_hall:     "Food Halls",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  all:           "\u2728",
  restaurants:   "\u{1F37D}",
  restaurant:    "\u{1F37D}",
  fast_food:     "\u{1F354}",
  fine_dining:   "\u{1F942}",
  casual_dining: "\u{1F373}",
  cafes:         "\u2615",
  cafe:          "\u2615",
  bakeries:      "\u{1F950}",
  bakery:        "\u{1F950}",
  street_food:   "\u{1F32E}",
  bars:          "\u{1F37A}",
  bar:           "\u{1F37A}",
  brewery:       "\u{1F37B}",
  breweries:     "\u{1F37B}",
  bubble_tea:    "\u{1F9CB}",
  ice_cream:     "\u{1F366}",
  buffet:        "\u{1F371}",
  buffets:       "\u{1F371}",
  brunch:        "\u{1F95E}",
  dessert_bar:   "\u{1F370}",
  food_hall:     "\u{1F3EA}",
};

export function getCategoryDisplay(slug: string): { emoji: string; label: string } {
  const normalized = slug?.toLowerCase().trim() || "";
  return {
    emoji: CATEGORY_EMOJI[normalized] || "\u{1F37D}",
    label: CATEGORY_LABELS[normalized] || slug,
  };
}

export function getRankDisplay(rank: number): string {
  if (rank === 1) return "\u{1F947}";
  if (rank === 2) return "\u{1F948}";
  if (rank === 3) return "\u{1F949}";
  return `#${rank}`;
}
