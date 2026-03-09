/**
 * Best In Categories — the core "Best X in City" sub-category system.
 * Constitution principles #3, #14, #47.
 *
 * "TopRanker is our brand. Best In is our format."
 */

export interface BestInCategory {
  slug: string;           // "biryani", "chai", "tacos"
  displayName: string;    // "Biryani", "Chai", "Tacos"
  emoji: string;          // emojis for visual identity
  parentCategory: string; // maps to existing category system
  city: string;           // "Dallas" for now
  description: string;    // "Find the best biryani in Dallas"
  tags: string[];         // search tags: ["hyderabadi", "dum biryani", "chicken biryani"]
  isActive: boolean;
  sortOrder: number;
}

export const BEST_IN_CATEGORIES: BestInCategory[] = [
  // Indian Food (Phase 1 — Indian Dallas First strategy)
  { slug: "biryani", displayName: "Biryani", emoji: "\u{1F35A}", parentCategory: "restaurant", city: "Dallas", description: "Find the best biryani in Dallas, rated by real diners", tags: ["hyderabadi", "dum biryani", "chicken biryani", "goat biryani"], isActive: true, sortOrder: 1 },
  { slug: "chai", displayName: "Chai", emoji: "\u2615", parentCategory: "cafe", city: "Dallas", description: "Find the best chai in Dallas", tags: ["masala chai", "cutting chai", "karak"], isActive: true, sortOrder: 2 },
  { slug: "dosa", displayName: "Dosa", emoji: "\u{1FAD3}", parentCategory: "restaurant", city: "Dallas", description: "Find the best dosa in Dallas", tags: ["masala dosa", "paper dosa", "mysore dosa", "rava dosa"], isActive: true, sortOrder: 3 },
  { slug: "butter-chicken", displayName: "Butter Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", city: "Dallas", description: "Find the best butter chicken in Dallas", tags: ["murgh makhani", "tikka masala"], isActive: true, sortOrder: 4 },

  // Universal Categories
  { slug: "tacos", displayName: "Tacos", emoji: "\u{1F32E}", parentCategory: "restaurant", city: "Dallas", description: "Find the best tacos in Dallas", tags: ["street tacos", "al pastor", "carnitas", "birria"], isActive: true, sortOrder: 5 },
  { slug: "bbq", displayName: "BBQ", emoji: "\u{1F525}", parentCategory: "bbq", city: "Dallas", description: "Find the best BBQ in Dallas", tags: ["brisket", "ribs", "pulled pork", "smoked"], isActive: true, sortOrder: 6 },
  { slug: "pizza", displayName: "Pizza", emoji: "\u{1F355}", parentCategory: "pizza", city: "Dallas", description: "Find the best pizza in Dallas", tags: ["neapolitan", "ny style", "deep dish", "wood fired"], isActive: true, sortOrder: 7 },
  { slug: "burgers", displayName: "Burgers", emoji: "\u{1F354}", parentCategory: "restaurant", city: "Dallas", description: "Find the best burgers in Dallas", tags: ["smash burger", "wagyu", "double stack"], isActive: true, sortOrder: 8 },
  { slug: "sushi", displayName: "Sushi", emoji: "\u{1F363}", parentCategory: "restaurant", city: "Dallas", description: "Find the best sushi in Dallas", tags: ["omakase", "nigiri", "sashimi", "rolls"], isActive: true, sortOrder: 9 },
  { slug: "pho", displayName: "Pho", emoji: "\u{1F35C}", parentCategory: "restaurant", city: "Dallas", description: "Find the best pho in Dallas", tags: ["pho bo", "pho ga", "bun bo hue"], isActive: true, sortOrder: 10 },
  { slug: "wings", displayName: "Wings", emoji: "\u{1F357}", parentCategory: "restaurant", city: "Dallas", description: "Find the best wings in Dallas", tags: ["buffalo", "korean", "lemon pepper", "hot wings"], isActive: true, sortOrder: 11 },
  { slug: "coffee", displayName: "Coffee", emoji: "\u2615", parentCategory: "cafe", city: "Dallas", description: "Find the best coffee in Dallas", tags: ["espresso", "cold brew", "pour over", "latte"], isActive: true, sortOrder: 12 },
  { slug: "ramen", displayName: "Ramen", emoji: "\u{1F35C}", parentCategory: "restaurant", city: "Dallas", description: "Find the best ramen in Dallas", tags: ["tonkotsu", "miso", "shoyu", "spicy"], isActive: true, sortOrder: 13 },
  { slug: "fried-chicken", displayName: "Fried Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", city: "Dallas", description: "Find the best fried chicken in Dallas", tags: ["nashville hot", "korean fried", "southern", "buttermilk"], isActive: true, sortOrder: 14 },
  { slug: "ice-cream", displayName: "Ice Cream", emoji: "\u{1F366}", parentCategory: "dessert", city: "Dallas", description: "Find the best ice cream in Dallas", tags: ["gelato", "kulfi", "soft serve", "artisan"], isActive: true, sortOrder: 15 },
];

/** Returns all active categories sorted by sortOrder */
export function getActiveCategories(): BestInCategory[] {
  return BEST_IN_CATEGORIES
    .filter(c => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Look up a single category by slug */
export function getCategoryBySlug(slug: string): BestInCategory | undefined {
  return BEST_IN_CATEGORIES.find(c => c.slug === slug);
}

/** Get all categories that share a parentCategory */
export function getCategoriesByParent(parentCategory: string): BestInCategory[] {
  return BEST_IN_CATEGORIES.filter(c => c.parentCategory === parentCategory);
}

/** Search categories by slug, displayName, or tags (case-insensitive) */
export function searchCategories(query: string): BestInCategory[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return BEST_IN_CATEGORIES.filter(c =>
    c.slug.toLowerCase().includes(q) ||
    c.displayName.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
}

/** Build a "Best X in City" title string */
export function getBestInTitle(slug: string, city?: string): string {
  const cat = getCategoryBySlug(slug);
  const name = cat ? cat.displayName : slug;
  const targetCity = city || (cat ? cat.city : "Dallas");
  return `Best ${name} in ${targetCity}`;
}

/** Summary counts */
export function getCategoryCount(): { total: number; active: number } {
  return {
    total: BEST_IN_CATEGORIES.length,
    active: BEST_IN_CATEGORIES.filter(c => c.isActive).length,
  };
}
