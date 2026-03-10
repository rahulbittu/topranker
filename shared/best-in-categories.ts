/**
 * Best In Categories — the core "Best X in City" sub-category system.
 * Constitution principles #3, #14, #47.
 *
 * "TopRanker is our brand. Best In is our format."
 *
 * Sprint 282: Restructured with cuisine-specific subcategories.
 * Each cuisine type has its own signature dishes/items.
 */

export interface BestInCategory {
  slug: string;           // "biryani", "chai", "tacos"
  displayName: string;    // "Biryani", "Chai", "Tacos"
  emoji: string;          // emojis for visual identity
  parentCategory: string; // maps to existing category system
  cuisine: string;        // "indian", "mexican", "japanese", "american", "universal"
  city: string;           // "Dallas" for now
  description: string;    // "Find the best biryani in Dallas"
  tags: string[];         // search tags: ["hyderabadi", "dum biryani", "chicken biryani"]
  isActive: boolean;
  sortOrder: number;
}

export const BEST_IN_CATEGORIES: BestInCategory[] = [
  // ── Indian Cuisine ───────────────────────────────────────
  { slug: "biryani", displayName: "Biryani", emoji: "\u{1F35A}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best biryani in Dallas, rated by real diners", tags: ["hyderabadi", "dum biryani", "chicken biryani", "goat biryani", "veg biryani"], isActive: true, sortOrder: 1 },
  { slug: "dosa", displayName: "Dosa", emoji: "\u{1FAD3}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best dosa in Dallas", tags: ["masala dosa", "paper dosa", "mysore dosa", "rava dosa", "onion dosa"], isActive: true, sortOrder: 2 },
  { slug: "butter-chicken", displayName: "Butter Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best butter chicken in Dallas", tags: ["murgh makhani", "tikka masala", "chicken curry"], isActive: true, sortOrder: 3 },
  { slug: "chai", displayName: "Chai", emoji: "\u2615", parentCategory: "cafe", cuisine: "indian", city: "Dallas", description: "Find the best chai in Dallas", tags: ["masala chai", "cutting chai", "karak", "adrak chai"], isActive: true, sortOrder: 4 },
  { slug: "samosa", displayName: "Samosa", emoji: "\u{1F95F}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best samosa in Dallas", tags: ["aloo samosa", "keema samosa", "samosa chaat"], isActive: true, sortOrder: 5 },
  { slug: "tandoori", displayName: "Tandoori", emoji: "\u{1F356}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best tandoori in Dallas", tags: ["tandoori chicken", "seekh kebab", "naan", "tandoori paneer"], isActive: true, sortOrder: 6 },
  { slug: "chaat", displayName: "Chaat", emoji: "\u{1F963}", parentCategory: "street_food", cuisine: "indian", city: "Dallas", description: "Find the best chaat in Dallas", tags: ["pani puri", "bhel puri", "dahi puri", "sev puri", "papdi chaat"], isActive: true, sortOrder: 7 },
  { slug: "thali", displayName: "Thali", emoji: "\u{1F371}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best thali in Dallas", tags: ["gujarati thali", "south indian thali", "rajasthani thali", "punjabi thali"], isActive: true, sortOrder: 8 },

  // ── Mexican Cuisine ──────────────────────────────────────
  { slug: "tacos", displayName: "Tacos", emoji: "\u{1F32E}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best tacos in Dallas", tags: ["street tacos", "al pastor", "carnitas", "birria", "barbacoa"], isActive: true, sortOrder: 10 },
  { slug: "burritos", displayName: "Burritos", emoji: "\u{1F32F}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best burritos in Dallas", tags: ["carne asada", "breakfast burrito", "wet burrito", "california burrito"], isActive: true, sortOrder: 11 },
  { slug: "enchiladas", displayName: "Enchiladas", emoji: "\u{1F336}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best enchiladas in Dallas", tags: ["cheese enchiladas", "mole", "verde", "suizas"], isActive: true, sortOrder: 12 },
  { slug: "queso", displayName: "Queso", emoji: "\u{1F9C0}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best queso in Dallas", tags: ["chile con queso", "queso fundido", "queso flameado"], isActive: true, sortOrder: 13 },
  { slug: "margaritas", displayName: "Margaritas", emoji: "\u{1F379}", parentCategory: "bar", cuisine: "mexican", city: "Dallas", description: "Find the best margaritas in Dallas", tags: ["frozen margarita", "top shelf", "spicy margarita", "mango"], isActive: true, sortOrder: 14 },
  { slug: "tamales", displayName: "Tamales", emoji: "\u{1FAD4}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best tamales in Dallas", tags: ["pork tamales", "chicken tamales", "sweet tamales", "rajas"], isActive: true, sortOrder: 15 },

  // ── Japanese Cuisine ─────────────────────────────────────
  { slug: "sushi", displayName: "Sushi", emoji: "\u{1F363}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best sushi in Dallas", tags: ["omakase", "nigiri", "sashimi", "rolls", "chirashi"], isActive: true, sortOrder: 20 },
  { slug: "ramen", displayName: "Ramen", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best ramen in Dallas", tags: ["tonkotsu", "miso", "shoyu", "spicy", "tsukemen"], isActive: true, sortOrder: 21 },
  { slug: "udon", displayName: "Udon", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best udon in Dallas", tags: ["tempura udon", "kitsune udon", "nabeyaki", "yaki udon"], isActive: true, sortOrder: 22 },
  { slug: "katsu", displayName: "Katsu", emoji: "\u{1F371}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best katsu in Dallas", tags: ["tonkatsu", "chicken katsu", "katsu curry", "katsu sando"], isActive: true, sortOrder: 23 },

  // ── Chinese Cuisine ──────────────────────────────────────
  { slug: "dim-sum", displayName: "Dim Sum", emoji: "\u{1F95F}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best dim sum in Dallas", tags: ["har gow", "siu mai", "char siu bao", "egg tart", "cheung fun"], isActive: true, sortOrder: 25 },
  { slug: "hot-pot", displayName: "Hot Pot", emoji: "\u{1FAD5}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best hot pot in Dallas", tags: ["sichuan hot pot", "mala", "shabu shabu", "mongolian"], isActive: true, sortOrder: 26 },
  { slug: "kung-pao", displayName: "Kung Pao", emoji: "\u{1F336}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best kung pao in Dallas", tags: ["kung pao chicken", "mapo tofu", "dan dan noodles"], isActive: true, sortOrder: 27 },
  { slug: "peking-duck", displayName: "Peking Duck", emoji: "\u{1F986}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best Peking duck in Dallas", tags: ["roast duck", "crispy duck", "duck pancakes"], isActive: true, sortOrder: 28 },

  // ── Vietnamese Cuisine ───────────────────────────────────
  { slug: "pho", displayName: "Pho", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best pho in Dallas", tags: ["pho bo", "pho ga", "bun bo hue", "pho tai"], isActive: true, sortOrder: 30 },
  { slug: "banh-mi", displayName: "Banh Mi", emoji: "\u{1F956}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best banh mi in Dallas", tags: ["pork banh mi", "grilled chicken", "tofu banh mi", "pate"], isActive: true, sortOrder: 31 },
  { slug: "bun-bo-hue", displayName: "Bun Bo Hue", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best bun bo hue in Dallas", tags: ["spicy beef noodle", "vermicelli", "lemongrass"], isActive: true, sortOrder: 32 },

  // ── Korean Cuisine ───────────────────────────────────────
  { slug: "korean-bbq", displayName: "Korean BBQ", emoji: "\u{1F969}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best Korean BBQ in Dallas", tags: ["galbi", "bulgogi", "samgyeopsal", "banchan"], isActive: true, sortOrder: 35 },
  { slug: "bibimbap", displayName: "Bibimbap", emoji: "\u{1F35A}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best bibimbap in Dallas", tags: ["dolsot bibimbap", "stone pot", "mixed rice"], isActive: true, sortOrder: 36 },
  { slug: "fried-chicken", displayName: "Fried Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best Korean fried chicken in Dallas", tags: ["korean fried", "yangnyeom", "dakgangjeong", "honey butter"], isActive: true, sortOrder: 37 },

  // ── Thai Cuisine ─────────────────────────────────────────
  { slug: "pad-thai", displayName: "Pad Thai", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "thai", city: "Dallas", description: "Find the best pad thai in Dallas", tags: ["shrimp pad thai", "chicken pad thai", "tofu pad thai"], isActive: true, sortOrder: 40 },
  { slug: "green-curry", displayName: "Green Curry", emoji: "\u{1F35B}", parentCategory: "restaurant", cuisine: "thai", city: "Dallas", description: "Find the best green curry in Dallas", tags: ["green curry", "red curry", "massaman", "panang"], isActive: true, sortOrder: 41 },
  { slug: "mango-sticky-rice", displayName: "Mango Sticky Rice", emoji: "\u{1F96D}", parentCategory: "dessert", cuisine: "thai", city: "Dallas", description: "Find the best mango sticky rice in Dallas", tags: ["khao niaow ma muang", "coconut cream", "sticky rice"], isActive: true, sortOrder: 42 },

  // ── Italian Cuisine ──────────────────────────────────────
  { slug: "pizza", displayName: "Pizza", emoji: "\u{1F355}", parentCategory: "pizza", cuisine: "italian", city: "Dallas", description: "Find the best pizza in Dallas", tags: ["neapolitan", "ny style", "deep dish", "wood fired", "margherita"], isActive: true, sortOrder: 45 },
  { slug: "pasta", displayName: "Pasta", emoji: "\u{1F35D}", parentCategory: "restaurant", cuisine: "italian", city: "Dallas", description: "Find the best pasta in Dallas", tags: ["carbonara", "cacio e pepe", "bolognese", "pesto", "amatriciana"], isActive: true, sortOrder: 46 },
  { slug: "tiramisu", displayName: "Tiramisu", emoji: "\u{1F370}", parentCategory: "dessert", cuisine: "italian", city: "Dallas", description: "Find the best tiramisu in Dallas", tags: ["classic tiramisu", "espresso", "mascarpone"], isActive: true, sortOrder: 47 },
  { slug: "gelato", displayName: "Gelato", emoji: "\u{1F366}", parentCategory: "dessert", cuisine: "italian", city: "Dallas", description: "Find the best gelato in Dallas", tags: ["pistachio", "stracciatella", "hazelnut", "artisan gelato"], isActive: true, sortOrder: 48 },

  // ── American / BBQ / Southern ────────────────────────────
  { slug: "bbq", displayName: "BBQ", emoji: "\u{1F525}", parentCategory: "bbq", cuisine: "american", city: "Dallas", description: "Find the best BBQ in Dallas", tags: ["brisket", "ribs", "pulled pork", "smoked", "texas bbq"], isActive: true, sortOrder: 50 },
  { slug: "burgers", displayName: "Burgers", emoji: "\u{1F354}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best burgers in Dallas", tags: ["smash burger", "wagyu", "double stack", "cheeseburger"], isActive: true, sortOrder: 51 },
  { slug: "wings", displayName: "Wings", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best wings in Dallas", tags: ["buffalo", "lemon pepper", "hot wings", "garlic parmesan"], isActive: true, sortOrder: 52 },
  { slug: "brisket", displayName: "Brisket", emoji: "\u{1F969}", parentCategory: "bbq", cuisine: "american", city: "Dallas", description: "Find the best brisket in Dallas", tags: ["texas brisket", "smoked brisket", "salt and pepper", "post oak"], isActive: true, sortOrder: 53 },
  { slug: "southern-fried-chicken", displayName: "Southern Fried Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best fried chicken in Dallas", tags: ["nashville hot", "southern", "buttermilk", "honey butter"], isActive: true, sortOrder: 54 },
  { slug: "mac-and-cheese", displayName: "Mac & Cheese", emoji: "\u{1F9C0}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best mac and cheese in Dallas", tags: ["baked mac", "smoked gouda", "truffle mac", "lobster mac"], isActive: true, sortOrder: 55 },

  // ── Mediterranean / Middle Eastern ───────────────────────
  { slug: "shawarma", displayName: "Shawarma", emoji: "\u{1F959}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best shawarma in Dallas", tags: ["chicken shawarma", "beef shawarma", "shawarma plate", "garlic sauce"], isActive: true, sortOrder: 60 },
  { slug: "falafel", displayName: "Falafel", emoji: "\u{1F9C6}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best falafel in Dallas", tags: ["falafel wrap", "falafel plate", "hummus", "tahini"], isActive: true, sortOrder: 61 },
  { slug: "hummus", displayName: "Hummus", emoji: "\u{1F963}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best hummus in Dallas", tags: ["classic hummus", "spicy hummus", "roasted garlic", "pita"], isActive: true, sortOrder: 62 },

  // ── Universal (Drinks & Desserts) ────────────────────────
  { slug: "coffee", displayName: "Coffee", emoji: "\u2615", parentCategory: "cafe", cuisine: "universal", city: "Dallas", description: "Find the best coffee in Dallas", tags: ["espresso", "cold brew", "pour over", "latte", "cortado"], isActive: true, sortOrder: 70 },
  { slug: "bubble-tea", displayName: "Bubble Tea", emoji: "\u{1F9CB}", parentCategory: "cafe", cuisine: "universal", city: "Dallas", description: "Find the best bubble tea in Dallas", tags: ["boba", "taro", "matcha", "brown sugar", "tiger milk"], isActive: true, sortOrder: 71 },
  { slug: "ice-cream", displayName: "Ice Cream", emoji: "\u{1F366}", parentCategory: "dessert", cuisine: "universal", city: "Dallas", description: "Find the best ice cream in Dallas", tags: ["gelato", "kulfi", "soft serve", "artisan", "rolled ice cream"], isActive: true, sortOrder: 72 },
  { slug: "brunch", displayName: "Brunch", emoji: "\u{1F95E}", parentCategory: "restaurant", cuisine: "universal", city: "Dallas", description: "Find the best brunch in Dallas", tags: ["mimosa", "eggs benedict", "french toast", "pancakes", "avocado toast"], isActive: true, sortOrder: 73 },
];

/** Returns all active categories sorted by sortOrder */
export function getActiveCategories(): BestInCategory[] {
  return BEST_IN_CATEGORIES
    .filter(c => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Returns active categories for a specific cuisine */
export function getCategoriesByCuisine(cuisine: string): BestInCategory[] {
  return BEST_IN_CATEGORIES
    .filter(c => c.isActive && c.cuisine === cuisine)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Returns all unique cuisine types */
export function getAvailableCuisines(): string[] {
  return [...new Set(BEST_IN_CATEGORIES.filter(c => c.isActive).map(c => c.cuisine))];
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
    c.cuisine.toLowerCase().includes(q) ||
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
export function getCategoryCount(): { total: number; active: number; cuisines: number } {
  return {
    total: BEST_IN_CATEGORIES.length,
    active: BEST_IN_CATEGORIES.filter(c => c.isActive).length,
    cuisines: getAvailableCuisines().length,
  };
}

/** Cuisine display metadata for UI */
export const CUISINE_DISPLAY: Record<string, { label: string; emoji: string }> = {
  indian: { label: "Indian", emoji: "\u{1F1EE}\u{1F1F3}" },
  mexican: { label: "Mexican", emoji: "\u{1F1F2}\u{1F1FD}" },
  japanese: { label: "Japanese", emoji: "\u{1F1EF}\u{1F1F5}" },
  chinese: { label: "Chinese", emoji: "\u{1F1E8}\u{1F1F3}" },
  vietnamese: { label: "Vietnamese", emoji: "\u{1F1FB}\u{1F1F3}" },
  korean: { label: "Korean", emoji: "\u{1F1F0}\u{1F1F7}" },
  thai: { label: "Thai", emoji: "\u{1F1F9}\u{1F1ED}" },
  italian: { label: "Italian", emoji: "\u{1F1EE}\u{1F1F9}" },
  american: { label: "American", emoji: "\u{1F1FA}\u{1F1F8}" },
  mediterranean: { label: "Mediterranean", emoji: "\u{1F3D6}" },
  universal: { label: "Popular", emoji: "\u2B50" },
};

// Sprint 306: Cuisine → dish leaderboard mapping for drill-down
export const CUISINE_DISH_MAP: Record<string, { slug: string; name: string; emoji: string }[]> = {
  indian: [
    { slug: "biryani", name: "Biryani", emoji: "🍛" },
    { slug: "dosa", name: "Dosa", emoji: "🫓" },
    { slug: "butter-chicken", name: "Butter Chicken", emoji: "🍗" },
    { slug: "samosa", name: "Samosa", emoji: "🥟" },
  ],
  mexican: [
    { slug: "taco", name: "Taco", emoji: "🌮" },
    { slug: "burrito", name: "Burrito", emoji: "🌯" },
    { slug: "enchilada", name: "Enchilada", emoji: "🫔" },
  ],
  japanese: [
    { slug: "ramen", name: "Ramen", emoji: "🍜" },
    { slug: "sushi", name: "Sushi", emoji: "🍣" },
  ],
  italian: [
    { slug: "pizza", name: "Pizza", emoji: "🍕" },
    { slug: "pasta", name: "Pasta", emoji: "🍝" },
  ],
  vietnamese: [
    { slug: "pho", name: "Pho", emoji: "🍲" },
    { slug: "banh-mi", name: "Banh Mi", emoji: "🥖" },
  ],
  american: [
    { slug: "burger", name: "Burger", emoji: "🍔" },
    { slug: "brisket", name: "Brisket", emoji: "🥩" },
    { slug: "wings", name: "Wings", emoji: "🍗" },
  ],
  mediterranean: [
    { slug: "kebab", name: "Kebab", emoji: "🥙" },
    { slug: "falafel", name: "Falafel", emoji: "🧆" },
  ],
  // Sprint 320: Chinese cuisine dish map
  chinese: [
    { slug: "dim-sum", name: "Dim Sum", emoji: "🥟" },
    { slug: "peking-duck", name: "Peking Duck", emoji: "🦆" },
    { slug: "hot-pot", name: "Hot Pot", emoji: "🫕" },
  ],
  // Sprint 316: Korean + Thai cuisine dish maps
  korean: [
    { slug: "korean-bbq", name: "Korean BBQ", emoji: "🥩" },
    { slug: "bibimbap", name: "Bibimbap", emoji: "🍚" },
    { slug: "fried-chicken", name: "Fried Chicken", emoji: "🍗" },
  ],
  thai: [
    { slug: "pad-thai", name: "Pad Thai", emoji: "🍜" },
    { slug: "green-curry", name: "Green Curry", emoji: "🍛" },
  ],
};
