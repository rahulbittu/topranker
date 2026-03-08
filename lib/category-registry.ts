/**
 * Category Registry — Extensible Category Architecture
 * Owner: Marcus Chen (CTO) + Sage (Backend)
 *
 * Supports the CEO vision: "What if someone wants to find the best barber?
 * The best gym? Let users vote on what categories to add next."
 *
 * Architecture:
 * 1. Static categories (food verticals) — defined here, always available
 * 2. Dynamic categories — added via admin panel or user suggestions
 * 3. User-requested categories — "Suggest a Category" feature
 *
 * Each category has: slug, label, emoji, vertical, scoring rubric hints,
 * and at-a-glance info fields specific to the business type.
 */

export type CategoryVertical = "food" | "services" | "wellness" | "entertainment" | "retail";

export interface CategoryDefinition {
  slug: string;
  label: string;
  emoji: string;
  vertical: CategoryVertical;
  /** At-a-glance info fields shown on business cards */
  atAGlanceFields: string[];
  /** Placeholder for domain-specific scoring criteria */
  scoringHints: string[];
  /** Whether this category is active and visible */
  isActive: boolean;
}

// ─── Food Vertical (Current) ────────────────────────────────────
const FOOD_CATEGORIES: CategoryDefinition[] = [
  {
    slug: "restaurant", label: "Restaurants", emoji: "\u{1F37D}", vertical: "food",
    atAGlanceFields: ["priceRange", "cuisine", "neighborhood", "isOpenNow", "dineIn", "delivery"],
    scoringHints: ["food quality", "service", "ambiance", "value"],
    isActive: true,
  },
  {
    slug: "fast_food", label: "Fast Food", emoji: "\u{1F354}", vertical: "food",
    atAGlanceFields: ["priceRange", "driveThru", "isOpenNow", "avgWaitTime"],
    scoringHints: ["speed", "taste", "consistency", "value"],
    isActive: true,
  },
  {
    slug: "fine_dining", label: "Fine Dining", emoji: "\u{1F942}", vertical: "food",
    atAGlanceFields: ["priceRange", "dressCode", "reservationRequired", "michelin", "neighborhood"],
    scoringHints: ["cuisine mastery", "presentation", "service", "wine list", "ambiance"],
    isActive: true,
  },
  {
    slug: "cafe", label: "Cafes", emoji: "\u2615", vertical: "food",
    atAGlanceFields: ["priceRange", "wifi", "isOpenNow", "seating", "specialtyDrinks"],
    scoringHints: ["coffee quality", "pastries", "atmosphere", "wifi reliability"],
    isActive: true,
  },
  {
    slug: "bakery", label: "Bakeries", emoji: "\u{1F950}", vertical: "food",
    atAGlanceFields: ["priceRange", "specialties", "isOpenNow", "madeInHouse"],
    scoringHints: ["bread quality", "pastry variety", "freshness", "artisan factor"],
    isActive: true,
  },
  {
    slug: "street_food", label: "Street Food", emoji: "\u{1F32E}", vertical: "food",
    atAGlanceFields: ["priceRange", "isOpenNow", "cashOnly", "seating"],
    scoringHints: ["authenticity", "flavor", "portion size", "value"],
    isActive: true,
  },
  {
    slug: "bar", label: "Bars", emoji: "\u{1F37A}", vertical: "food",
    atAGlanceFields: ["priceRange", "happyHour", "isOpenNow", "liveMusic", "cocktailMenu"],
    scoringHints: ["drink quality", "atmosphere", "bartender skill", "music"],
    isActive: true,
  },
  {
    slug: "brewery", label: "Breweries", emoji: "\u{1F37B}", vertical: "food",
    atAGlanceFields: ["priceRange", "tapCount", "tours", "isOpenNow", "foodMenu"],
    scoringHints: ["beer variety", "flagship quality", "taproom vibe", "food pairing"],
    isActive: true,
  },
  {
    slug: "bubble_tea", label: "Bubble Tea", emoji: "\u{1F9CB}", vertical: "food",
    atAGlanceFields: ["priceRange", "customization", "isOpenNow"],
    scoringHints: ["tea quality", "toppings", "sweetness options", "presentation"],
    isActive: true,
  },
  {
    slug: "ice_cream", label: "Ice Cream", emoji: "\u{1F366}", vertical: "food",
    atAGlanceFields: ["priceRange", "flavors", "isOpenNow", "madeInHouse"],
    scoringHints: ["flavor creativity", "creaminess", "presentation", "freshness"],
    isActive: true,
  },
  {
    slug: "casual_dining", label: "Casual Dining", emoji: "\u{1F373}", vertical: "food",
    atAGlanceFields: ["priceRange", "cuisine", "neighborhood", "isOpenNow", "familyFriendly"],
    scoringHints: ["food quality", "portion size", "service", "value"],
    isActive: true,
  },
  {
    slug: "buffet", label: "Buffets", emoji: "\u{1F371}", vertical: "food",
    atAGlanceFields: ["priceRange", "cuisineTypes", "isOpenNow", "allYouCanEat"],
    scoringHints: ["variety", "freshness", "replenishment speed", "value"],
    isActive: true,
  },
  {
    slug: "brunch", label: "Brunch", emoji: "\u{1F95E}", vertical: "food",
    atAGlanceFields: ["priceRange", "bottomlessDrinks", "waitTime", "isOpenNow"],
    scoringHints: ["creativity", "drinks", "atmosphere", "value"],
    isActive: true,
  },
  {
    slug: "dessert_bar", label: "Dessert Bars", emoji: "\u{1F370}", vertical: "food",
    atAGlanceFields: ["priceRange", "specialties", "isOpenNow"],
    scoringHints: ["dessert quality", "presentation", "creativity", "portion size"],
    isActive: true,
  },
  {
    slug: "food_hall", label: "Food Halls", emoji: "\u{1F3EA}", vertical: "food",
    atAGlanceFields: ["vendorCount", "cuisineTypes", "isOpenNow", "seating"],
    scoringHints: ["vendor variety", "quality consistency", "atmosphere", "seating"],
    isActive: true,
  },
];

// ─── Future Verticals (Planned) ─────────────────────────────────
const SERVICES_CATEGORIES: CategoryDefinition[] = [
  {
    slug: "barber", label: "Barbers", emoji: "\u{1F488}", vertical: "services",
    atAGlanceFields: ["priceRange", "walkIn", "isOpenNow", "specialties"],
    scoringHints: ["cut quality", "consistency", "atmosphere", "wait time"],
    isActive: false,
  },
  {
    slug: "salon", label: "Hair Salons", emoji: "\u2702\uFE0F", vertical: "services",
    atAGlanceFields: ["priceRange", "appointmentRequired", "specialties", "isOpenNow"],
    scoringHints: ["styling skill", "product quality", "consultation", "atmosphere"],
    isActive: false,
  },
  {
    slug: "auto_mechanic", label: "Mechanics", emoji: "\u{1F527}", vertical: "services",
    atAGlanceFields: ["priceRange", "specialties", "warranty", "isOpenNow"],
    scoringHints: ["diagnostic accuracy", "price transparency", "turnaround time", "honesty"],
    isActive: false,
  },
  {
    slug: "dry_cleaner", label: "Dry Cleaners", emoji: "\u{1F455}", vertical: "services",
    atAGlanceFields: ["priceRange", "turnaround", "isOpenNow", "delivery"],
    scoringHints: ["cleaning quality", "turnaround time", "garment care", "pricing"],
    isActive: false,
  },
];

const WELLNESS_CATEGORIES: CategoryDefinition[] = [
  {
    slug: "gym", label: "Gyms", emoji: "\u{1F3CB}\uFE0F", vertical: "wellness",
    atAGlanceFields: ["priceRange", "equipment", "classes", "hours", "personalTrainers"],
    scoringHints: ["equipment quality", "cleanliness", "class variety", "crowd level"],
    isActive: false,
  },
  {
    slug: "yoga_studio", label: "Yoga Studios", emoji: "\u{1F9D8}", vertical: "wellness",
    atAGlanceFields: ["priceRange", "classTypes", "dropIn", "isOpenNow"],
    scoringHints: ["instructor quality", "studio atmosphere", "class variety", "community"],
    isActive: false,
  },
  {
    slug: "spa", label: "Spas", emoji: "\u{1F9D6}", vertical: "wellness",
    atAGlanceFields: ["priceRange", "services", "appointmentRequired", "isOpenNow"],
    scoringHints: ["treatment quality", "relaxation", "cleanliness", "staff professionalism"],
    isActive: false,
  },
];

const ENTERTAINMENT_CATEGORIES: CategoryDefinition[] = [
  {
    slug: "movie_theater", label: "Movie Theaters", emoji: "\u{1F3AC}", vertical: "entertainment",
    atAGlanceFields: ["priceRange", "screenTypes", "recliners", "foodMenu"],
    scoringHints: ["screen quality", "sound system", "seating comfort", "concessions"],
    isActive: false,
  },
  {
    slug: "bowling", label: "Bowling Alleys", emoji: "\u{1F3B3}", vertical: "entertainment",
    atAGlanceFields: ["priceRange", "lanes", "arcade", "foodMenu", "isOpenNow"],
    scoringHints: ["lane quality", "atmosphere", "food", "value"],
    isActive: false,
  },
];

// ─── Full Registry ──────────────────────────────────────────────
export const CATEGORY_REGISTRY: CategoryDefinition[] = [
  ...FOOD_CATEGORIES,
  ...SERVICES_CATEGORIES,
  ...WELLNESS_CATEGORIES,
  ...ENTERTAINMENT_CATEGORIES,
];

// ─── Helpers ────────────────────────────────────────────────────
export function getActiveCategories(): CategoryDefinition[] {
  return CATEGORY_REGISTRY.filter(c => c.isActive);
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORY_REGISTRY.find(c => c.slug === slug);
}

export function getCategoriesByVertical(vertical: CategoryVertical): CategoryDefinition[] {
  return CATEGORY_REGISTRY.filter(c => c.vertical === vertical);
}

export function getPlannedCategories(): CategoryDefinition[] {
  return CATEGORY_REGISTRY.filter(c => !c.isActive);
}

export function getVerticals(): CategoryVertical[] {
  return [...new Set(CATEGORY_REGISTRY.map(c => c.vertical))];
}

export const VERTICAL_LABELS: Record<CategoryVertical, { label: string; emoji: string }> = {
  food: { label: "Food & Drink", emoji: "\u{1F37D}" },
  services: { label: "Services", emoji: "\u{1F527}" },
  wellness: { label: "Health & Wellness", emoji: "\u{1F3CB}\uFE0F" },
  entertainment: { label: "Entertainment", emoji: "\u{1F3AC}" },
  retail: { label: "Shopping", emoji: "\u{1F6CD}\uFE0F" },
};

// ─── Category Suggestion (for user requests) ────────────────────
export interface CategorySuggestion {
  name: string;
  description: string;
  suggestedBy: string; // member ID
  suggestedAt: number;
  status: "pending" | "approved" | "rejected";
  vertical: CategoryVertical;
  voteCount: number;
}
