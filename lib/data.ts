export type Category = "Restaurants" | "Cafes" | "Street Food" | "Bars" | "Bakeries" | "Fast Food";

export const CATEGORIES: Category[] = ["Restaurants", "Cafes", "Street Food", "Bars", "Bakeries", "Fast Food"];

export type CredibilityTier = "new" | "regular" | "trusted" | "top";

export const TIER_DISPLAY_NAMES: Record<CredibilityTier, string> = {
  "new": "New Member",
  "regular": "Regular",
  "trusted": "Trusted",
  "top": "Top Reviewer",
};

export const TIER_WEIGHTS: Record<CredibilityTier, number> = {
  "new": 0.1,
  "regular": 0.35,
  "trusted": 0.70,
  "top": 1.0,
};

export const TIER_SCORE_RANGES: Record<CredibilityTier, { min: number; max: number }> = {
  "new": { min: 10, max: 99 },
  "regular": { min: 100, max: 299 },
  "trusted": { min: 300, max: 599 },
  "top": { min: 600, max: 1000 },
};

export const TIER_COLORS: Record<CredibilityTier, string> = {
  "new": "#556677",
  "regular": "#4A7FBB",
  "trusted": "#7B4EA8",
  "top": "#C9973A",
};

export function getVoteWeight(credibilityScore: number): number {
  if (credibilityScore >= 600) return 1.0;
  if (credibilityScore >= 300) return 0.70;
  if (credibilityScore >= 100) return 0.35;
  return 0.1;
}

export function getTemporalMultiplier(ratingAgeDays: number): number {
  if (ratingAgeDays <= 30) return 1.0;
  if (ratingAgeDays <= 90) return 0.85;
  if (ratingAgeDays <= 180) return 0.65;
  if (ratingAgeDays <= 365) return 0.45;
  return 0.25;
}

export interface CredibilityBreakdown {
  basePoints: number;
  ratingPoints: number;
  diversityBonus: number;
  ageBonus: number;
  varianceBonus: number;
  helpfulnessBonus: number;
  flagPenalty: number;
  totalScore: number;
}

export function calculateCredibilityScore(
  totalRatings: number,
  totalCategories: number,
  daysActive: number,
  ratingVariance: number,
  pioneerRate: number,
  flaggedCount: number
): CredibilityBreakdown {
  const basePoints = 10;
  const ratingPoints = Math.min(totalRatings * 2, 200);
  const diversityBonus = Math.min(totalCategories * 15, 100);
  const ageBonus = Math.min(daysActive * 0.5, 100);
  const varianceBonus = Math.min(ratingVariance * 50, 150);
  const helpfulnessBonus = Math.round(pioneerRate * 150);
  const flagPenalty = flaggedCount * 25;

  const raw = basePoints + ratingPoints + diversityBonus + ageBonus + varianceBonus + helpfulnessBonus - flagPenalty;
  const totalScore = Math.max(10, Math.min(1000, Math.round(raw)));

  return {
    basePoints,
    ratingPoints,
    diversityBonus,
    ageBonus,
    varianceBonus,
    helpfulnessBonus,
    flagPenalty,
    totalScore,
  };
}

export function getTierFromScore(
  score: number,
  totalRatings: number,
  totalCategories: number,
  daysActive: number,
  ratingVariance: number,
  activeFlagCount: number
): CredibilityTier {
  if (
    score >= 600 &&
    totalRatings >= 80 &&
    totalCategories >= 4 &&
    daysActive >= 90 &&
    ratingVariance >= 1.0 &&
    activeFlagCount === 0
  ) return "top";

  if (
    score >= 300 &&
    totalRatings >= 35 &&
    totalCategories >= 3 &&
    daysActive >= 45 &&
    ratingVariance >= 0.8
  ) return "trusted";

  if (
    score >= 100 &&
    totalRatings >= 10 &&
    totalCategories >= 2 &&
    daysActive >= 14
  ) return "regular";

  return "new";
}

export interface Rating {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userTier: CredibilityTier;
  food: number;
  value: number;
  service: number;
  wouldReturn: boolean;
  comment?: string;
  createdAt: number;
  rawScore: number;
  weight: number;
  weightedScore: number;
}

export interface Challenger {
  id: string;
  challengerId: string;
  challengerName: string;
  defenderId: string;
  defenderName: string;
  challengerVotes: number;
  defenderVotes: number;
  startDate: number;
  endDate: number;
  category: Category;
  city: string;
  recentComments: { userName: string; userTier: CredibilityTier; text: string; createdAt: number }[];
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  category: Category;
  weightedScore: number;
  rawAvgScore: number;
  rank: number;
  prevRank: number;
  rankDelta: number;
  ratingCount: number;
  isChallenger?: boolean;
  challengerId?: string;
  description: string;
  tags: string[];
  image?: any;
  priceRange?: string;
  hours?: string;
  phone?: string;
  address?: string;
  featuredDish?: string;
  isVerified?: boolean;
}

export interface TierRequirement {
  label: string;
  current: number;
  needed: number;
  met: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  city: string;
  tier: CredibilityTier;
  credibilityScore: number;
  credibilityBreakdown: CredibilityBreakdown;
  totalRatings: number;
  totalCategories: number;
  daysActive: number;
  ratingVariance: number;
  isFoundingMember: boolean;
  ratingHistory: { businessId: string; businessName: string; rawScore: number; weight: number; ratedAt: number }[];
  businessesHelpedUp: number;
}

export const MOCK_BUSINESSES: Business[] = [
  {
    id: "b1", name: "Spice Garden", slug: "spice-garden-dallas", neighborhood: "Uptown", city: "Dallas",
    category: "Restaurants", weightedScore: 4.72, rawAvgScore: 4.6, rank: 1, prevRank: 1, rankDelta: 0, ratingCount: 312,
    isChallenger: false,
    description: "Thirty years of perfecting North Indian cuisine. The lamb biryani here has a cult following — regulars drive 40 miles for it. Every spice freshly ground in-house each morning.",
    tags: ["Biryani", "Curry", "Fine Dining"],
    image: require("../assets/images/restaurants/spice-garden.png"),
    priceRange: "$$$", hours: "11:30am – 10:30pm", phone: "(214) 555-0192",
    address: "3821 Cedar Springs Rd, Uptown, Dallas",
    featuredDish: "Dum Pukht Lamb Biryani", isVerified: true
  },
  {
    id: "b2", name: "The Yard Kitchen", slug: "yard-kitchen-dallas", neighborhood: "Deep Ellum", city: "Dallas",
    category: "Restaurants", weightedScore: 4.59, rawAvgScore: 4.5, rank: 2, prevRank: 4, rankDelta: 2, ratingCount: 287,
    isChallenger: true, challengerId: "ch1",
    description: "Modern American comfort food that takes the concept seriously. The smash burger uses two beef blends and a proprietary bun recipe. Named Eater Dallas's Most Improved Restaurant two years running.",
    tags: ["Burgers", "Craft Beer", "Brunch"],
    image: require("../assets/images/restaurants/yard-kitchen.png"),
    priceRange: "$$", hours: "10am – 12am", phone: "(214) 555-0348",
    address: "2922 Commerce St, Deep Ellum, Dallas",
    featuredDish: "Double Smash Burger with bone marrow aioli"
  },
  {
    id: "b3", name: "Cuchara Cocina", slug: "cuchara-cocina-dallas", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Restaurants", weightedScore: 4.53, rawAvgScore: 4.4, rank: 3, prevRank: 2, rankDelta: -1, ratingCount: 241,
    isChallenger: false,
    description: "Mexico City street food elevated for a sit-down experience. The mezcal program is exceptional — 60+ selections curated by a certified agave sommelier. Come for the tlayudas, stay for the mezcal flights.",
    tags: ["Mexican", "Tacos", "Mezcal"],
    image: require("../assets/images/restaurants/cuchara.png"),
    priceRange: "$$", hours: "5pm – 11pm", phone: "(214) 555-0774",
    address: "408 W 8th St, Bishop Arts, Dallas",
    featuredDish: "Oaxacan Tlayuda with black beans and quesillo"
  },
  {
    id: "b4", name: "Seoul Food", slug: "seoul-food-dallas", neighborhood: "Oak Lawn", city: "Dallas",
    category: "Restaurants", weightedScore: 4.45, rawAvgScore: 4.3, rank: 4, prevRank: 3, rankDelta: -1, ratingCount: 198,
    isChallenger: false,
    description: "Authentic Korean BBQ with a tableside experience that converts first-timers into devotees. The galbi-jjim short rib is marinated for 72 hours. Their japchae is handmade daily by the owner's mother.",
    tags: ["Korean", "BBQ", "Ramen"],
    image: require("../assets/images/restaurants/seoul-food.png"),
    priceRange: "$$$", hours: "11am – 11pm", phone: "(214) 555-0229",
    address: "2826 Oak Lawn Ave, Oak Lawn, Dallas",
    featuredDish: "72-Hour Galbi-Jjim Short Rib"
  },
  {
    id: "b5", name: "Pappadeaux Seafood", slug: "pappadeaux-dallas", neighborhood: "North Dallas", city: "Dallas",
    category: "Restaurants", weightedScore: 4.37, rawAvgScore: 4.2, rank: 5, prevRank: 5, rankDelta: 0, ratingCount: 445,
    isChallenger: false,
    description: "Texas institution since 1976. The crawfish étouffée recipe hasn't changed in 40 years. Live Gulf seafood flown in daily — the whole bronzed fish is their signature move.",
    tags: ["Seafood", "Cajun", "Lobster"],
    image: require("../assets/images/restaurants/pappadeaux.png"),
    priceRange: "$$$", hours: "11am – 10pm", phone: "(214) 555-0511",
    address: "10433 Lombardy Ln, North Dallas, Dallas",
    featuredDish: "Crawfish Étouffée over dirty rice"
  },
  {
    id: "b6", name: "Lucia", slug: "lucia-dallas", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Restaurants", weightedScore: 4.31, rawAvgScore: 4.1, rank: 6, prevRank: 7, rankDelta: 1, ratingCount: 167,
    isChallenger: false,
    description: "Chef David Uygur's intimate Italian-inspired dining room seats just 32. The pasta is made from heritage wheat milled on-site. Reservations open 60 days in advance and disappear in hours.",
    tags: ["Italian", "Pasta", "Wine"],
    image: require("../assets/images/restaurants/lucia.png"),
    priceRange: "$$$$", hours: "6pm – 9:30pm (Tue–Sat)", phone: "(214) 555-0666",
    address: "408 W 8th St, Bishop Arts, Dallas",
    featuredDish: "Hand-rolled tagliatelle with black truffle and parmesan"
  },
  {
    id: "b7", name: "Khao Noodle Shop", slug: "khao-noodle-dallas", neighborhood: "Lowest Greenville", city: "Dallas",
    category: "Restaurants", weightedScore: 4.27, rawAvgScore: 4.1, rank: 7, prevRank: 6, rankDelta: -1, ratingCount: 154,
    isChallenger: false,
    description: "Chef Anchana Friedman brings Northern Thai street food with zero compromise on authenticity. The khao soi broth simmers for 14 hours. Only 42 seats. No reservations — arrive early.",
    tags: ["Thai", "Noodles", "Authentic"],
    image: require("../assets/images/restaurants/khao-noodle.png"),
    priceRange: "$$", hours: "11am – 3pm, 5pm – 9pm (Wed–Sun)", phone: "(214) 555-0887",
    address: "4812 Bryan St, Lowest Greenville, Dallas",
    featuredDish: "Northern Thai Khao Soi with crispy noodles"
  },
  {
    id: "b8", name: "Mirador", slug: "mirador-dallas", neighborhood: "Highland Park", city: "Dallas",
    category: "Restaurants", weightedScore: 4.21, rawAvgScore: 4.0, rank: 8, prevRank: 9, rankDelta: 1, ratingCount: 209,
    isChallenger: false,
    description: "Elevated Mexican cuisine on a rooftop terrace with panoramic views of the Dallas skyline. The tableside guacamole has 22 ingredients. Sommelier-curated tequila and mezcal program with over 200 selections.",
    tags: ["Mexican", "Fine Dining", "Rooftop"],
    image: require("../assets/images/restaurants/mirador.png"),
    priceRange: "$$$$", hours: "5pm – 12am", phone: "(214) 555-0133",
    address: "4100 Maple Ave, Highland Park, Dallas",
    featuredDish: "Rooftop Tableside Guacamole + Duck Mole Negro"
  },
  {
    id: "b9", name: "Pecan Lodge", slug: "pecan-lodge-dallas", neighborhood: "Deep Ellum", city: "Dallas",
    category: "Restaurants", weightedScore: 4.19, rawAvgScore: 4.0, rank: 9, prevRank: 8, rankDelta: -1, ratingCount: 523,
    isChallenger: false,
    description: "The most decorated BBQ joint in Dallas history. Justin and Diane Fourton's brisket is legendary — it's been voted best in Texas three times. The jalapeño cheddar sausage is made in-house every morning. Expect a line.",
    tags: ["BBQ", "Brisket", "Texas"],
    image: require("../assets/images/restaurants/pecan-lodge.png"),
    priceRange: "$$", hours: "11am – 3pm (Mon–Fri), 11am – 5pm (Sat–Sun)", phone: "(214) 555-0948",
    address: "2702 Main St, Deep Ellum, Dallas",
    featuredDish: "18-hour Oak-smoked USDA Prime Brisket"
  },
  {
    id: "b10", name: "Fearing's", slug: "fearings-dallas", neighborhood: "Uptown", city: "Dallas",
    category: "Restaurants", weightedScore: 4.15, rawAvgScore: 3.9, rank: 10, prevRank: 10, rankDelta: 0, ratingCount: 178,
    isChallenger: false,
    description: "Dean Fearing's flagship inside the Ritz-Carlton. The man who invented 'Southwest Cuisine' and still does it better than anyone else. The tortilla soup is a national treasure. Ask for the bar seats.",
    tags: ["Southwest", "Fine Dining", "Steakhouse"],
    image: require("../assets/images/restaurants/fearings.png"),
    priceRange: "$$$$", hours: "6:30am – 11pm", phone: "(214) 555-0220",
    address: "2121 McKinney Ave, Uptown, Dallas",
    featuredDish: "Dean's Tortilla Soup + Antelope Medallion"
  },

  {
    id: "c1", name: "White Rock Coffee", slug: "white-rock-coffee-dallas", neighborhood: "East Dallas", city: "Dallas",
    category: "Cafes", weightedScore: 4.61, rawAvgScore: 4.5, rank: 1, prevRank: 2, rankDelta: 1, ratingCount: 267,
    isChallenger: false,
    description: "East Dallas's beloved neighborhood roaster since 2007. Five locations, still independently owned. The seasonal single-origin filter changes every three weeks. Their oat milk cortado is what the other cafes are trying to replicate.",
    tags: ["Specialty Coffee", "Community", "Local"],
    image: require("../assets/images/cafes/white-rock.png"),
    priceRange: "$", hours: "6am – 7pm", phone: "(214) 555-0371",
    address: "7519 Greenville Ave, East Dallas, Dallas",
    featuredDish: "Seasonal Single-Origin Pour-Over"
  },
  {
    id: "c2", name: "Oak Cliff Coffee Roasters", slug: "oak-cliff-coffee-dallas", neighborhood: "Oak Cliff", city: "Dallas",
    category: "Cafes", weightedScore: 4.52, rawAvgScore: 4.4, rank: 2, prevRank: 1, rankDelta: -1, ratingCount: 198,
    isChallenger: true, challengerId: "ch2",
    description: "Micro-roastery with direct relationships at origin. Their roaster, Santiago, visits farm partners in Ethiopia and Colombia twice a year. Every bag has a harvest date and producer name. Currently roasting an Ethiopia Yirgacheffe natural that's stopping people in their tracks.",
    tags: ["Pour Over", "Single Origin", "Roastery"],
    image: require("../assets/images/cafes/oak-cliff.png"),
    priceRange: "$$", hours: "7am – 5pm", phone: "(214) 555-0445",
    address: "1440 W Jefferson Blvd, Oak Cliff, Dallas",
    featuredDish: "Ethiopia Yirgacheffe Natural Process"
  },
  {
    id: "c3", name: "Houndstooth Coffee", slug: "houndstooth-dallas", neighborhood: "Uptown", city: "Dallas",
    category: "Cafes", weightedScore: 4.44, rawAvgScore: 4.3, rank: 3, prevRank: 3, rankDelta: 0, ratingCount: 312,
    isChallenger: false,
    description: "Austin-born specialty coffee that mastered the expansion without losing quality. Their barista training program is considered the best in Dallas — 45 hours before your first solo shift. The cortado-to-flat-white ratio they maintain is obsessively consistent.",
    tags: ["Specialty", "Espresso", "Latte Art"],
    image: require("../assets/images/cafes/houndstooth.png"),
    priceRange: "$", hours: "6:30am – 7pm", phone: "(214) 555-0512",
    address: "1900 N Henderson Ave, Uptown, Dallas",
    featuredDish: "Honey Lavender Latte"
  },
  {
    id: "c4", name: "Cultivar Coffee", slug: "cultivar-coffee-dallas", neighborhood: "Trinity Groves", city: "Dallas",
    category: "Cafes", weightedScore: 4.31, rawAvgScore: 4.1, rank: 4, prevRank: 5, rankDelta: 1, ratingCount: 143,
    isChallenger: false,
    description: "Founded by a veteran of the specialty coffee industry with 20 years at origin. They source only Rainforest Alliance and Fair Trade certified beans. Their cold brew is a 22-hour slow drip — no shortcuts.",
    tags: ["Farm Direct", "Cold Brew", "Sustainable"],
    priceRange: "$$", hours: "7am – 6pm", phone: "(214) 555-0688",
    address: "330 W Commerce St, Trinity Groves, Dallas",
    featuredDish: "22-Hour Slow Drip Cold Brew"
  },
  {
    id: "c5", name: "Thunderbird Station", slug: "thunderbird-station-dallas", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Cafes", weightedScore: 4.25, rawAvgScore: 4.0, rank: 5, prevRank: 4, rankDelta: -1, ratingCount: 189,
    isChallenger: false,
    description: "All-day cafe in a converted 1940s filling station. The rotating seasonal menu changes completely every 12 weeks. Their breakfast toast program has achieved something rare — it became a destination in its own right.",
    tags: ["All-Day", "Breakfast", "Brunch"],
    priceRange: "$", hours: "7am – 5pm", phone: "(214) 555-0733",
    address: "316 W 7th St, Bishop Arts, Dallas",
    featuredDish: "Seasonal Heritage Grain Toast with cultured butter"
  },

  {
    id: "sf1", name: "Trompo", slug: "trompo-dallas", neighborhood: "West Dallas", city: "Dallas",
    category: "Street Food", weightedScore: 4.68, rawAvgScore: 4.6, rank: 1, prevRank: 1, rankDelta: 0, ratingCount: 408,
    isChallenger: false,
    description: "The trompo — a vertical rotating spit of achiote-marinated pork — is the soul of this operation. Brothers Rafael and Luis Castellanos learned from their grandfather in Guadalajara. The pineapple crown is ceremonially swapped every two hours.",
    tags: ["Tacos", "Al Pastor", "Authentic"],
    image: require("../assets/images/street-food/trompo.png"),
    priceRange: "$", hours: "9am – 4pm (Tue–Sun)", phone: "(214) 555-0855",
    address: "4800 Singleton Blvd, West Dallas, Dallas",
    featuredDish: "Al Pastor Tacos with fresh pineapple"
  },
  {
    id: "sf2", name: "Nammi Truck", slug: "nammi-truck-dallas", neighborhood: "Various", city: "Dallas",
    category: "Street Food", weightedScore: 4.46, rawAvgScore: 4.3, rank: 2, prevRank: 3, rankDelta: 1, ratingCount: 234,
    isChallenger: false,
    description: "The most-followed food truck in Dallas. Chi Nguyen's bánh mì uses a custom-baked baguette delivered fresh each morning from a Vietnamese bakery in Garland. The lemongrass pork is marinated overnight. Location updated daily on their social.",
    tags: ["Vietnamese", "Banh Mi", "Pho"],
    image: require("../assets/images/street-food/nammi.png"),
    priceRange: "$", hours: "11am – 2pm (Mon–Sat)", phone: "(214) 555-0910",
    address: "Various locations (follow for updates)",
    featuredDish: "Lemongrass Pork Bánh Mì"
  },
  {
    id: "sf3", name: "Jimmy's Food Store", slug: "jimmys-food-store-dallas", neighborhood: "East Dallas", city: "Dallas",
    category: "Street Food", weightedScore: 4.38, rawAvgScore: 4.2, rank: 3, prevRank: 2, rankDelta: -1, ratingCount: 178,
    isChallenger: false,
    description: "Italian deli and neighborhood institution since 1966. Three generations of the Cerchione family still behind the counter. The muffuletta is the city's finest — Central Grocery olive salad imported weekly from New Orleans.",
    tags: ["Italian", "Deli", "Sandwiches"],
    priceRange: "$", hours: "9am – 6pm (Mon–Sat)", phone: "(214) 555-0965",
    address: "4901 Bryan St, East Dallas, Dallas",
    featuredDish: "Muffuletta with imported Central Grocery olive salad"
  },
  {
    id: "sf4", name: "La Nueva Fresh & Hot", slug: "la-nueva-dallas", neighborhood: "Oak Cliff", city: "Dallas",
    category: "Street Food", weightedScore: 4.26, rawAvgScore: 4.0, rank: 4, prevRank: 6, rankDelta: 2, ratingCount: 312,
    isChallenger: false,
    description: "Family tortilleria and taqueria that has operated out of the same Oak Cliff corner since 1989. Every tortilla hand-pressed to order on a Comal their grandmother brought from Oaxaca. The breakfast tacos start at 5am — the line starts at 4:45.",
    tags: ["Tacos", "Tortilleria", "Breakfast"],
    priceRange: "$", hours: "5am – 2pm (Mon–Sat)", phone: "(214) 555-0104",
    address: "2802 W Jefferson Blvd, Oak Cliff, Dallas",
    featuredDish: "Hand-pressed Chorizo Breakfast Taco"
  },
  {
    id: "sf5", name: "Barbec's", slug: "barbecs-dallas", neighborhood: "North Oak Cliff", city: "Dallas",
    category: "Street Food", weightedScore: 4.19, rawAvgScore: 3.9, rank: 5, prevRank: 5, rankDelta: 0, ratingCount: 267,
    isChallenger: false,
    description: "Old-school Texas drive-in serving since 1948. The onion rings are hand-battered and fried in beef tallow — same recipe for 76 years. The chocolate malt has been on the menu since opening day. A time capsule you can eat.",
    tags: ["Drive-In", "Burgers", "Milkshakes"],
    priceRange: "$", hours: "10:30am – 9pm", phone: "(214) 555-0177",
    address: "3502 Maple Ave, North Oak Cliff, Dallas",
    featuredDish: "Beef Tallow Onion Rings + Chocolate Malt"
  },

  {
    id: "bar1", name: "Parliament", slug: "parliament-dallas", neighborhood: "Oak Lawn", city: "Dallas",
    category: "Bars", weightedScore: 4.57, rawAvgScore: 4.4, rank: 1, prevRank: 1, rankDelta: 0, ratingCount: 345,
    isChallenger: false,
    description: "The standard-bearer for Dallas cocktail culture. Located in a restored 1920s Victorian, every cocktail is built around the vessel it's served in. The bartenders are trained mixologists — minimum 3 years experience required. The Beekeepers Negroni ages for 14 days in oak.",
    tags: ["Cocktails", "Craft", "Speakeasy"],
    image: require("../assets/images/bars/parliament.png"),
    priceRange: "$$$", hours: "5pm – 2am", phone: "(214) 555-0289",
    address: "1419 Turtle Creek Blvd, Oak Lawn, Dallas",
    featuredDish: "Beekeeper's Negroni (14-day oak-aged)"
  },
  {
    id: "bar2", name: "Midnight Rambler", slug: "midnight-rambler-dallas", neighborhood: "Downtown", city: "Dallas",
    category: "Bars", weightedScore: 4.49, rawAvgScore: 4.3, rank: 2, prevRank: 2, rankDelta: 0, ratingCount: 287,
    isChallenger: true, challengerId: "ch1",
    description: "Subterranean hotel bar that has produced three of Dallas's most-acclaimed bartenders. The ice program alone has four different cuts and clarifications. Their Manhattan uses a rye whiskey collaboration they distilled with a Kentucky distillery exclusively.",
    tags: ["Hotel Bar", "Craft Cocktails", "Upscale"],
    image: require("../assets/images/bars/midnight-rambler.png"),
    priceRange: "$$$", hours: "4pm – 1am", phone: "(214) 555-0354",
    address: "1530 Main St, Downtown, Dallas",
    featuredDish: "Proprietary Dallas Manhattan (exclusive rye blend)"
  },
  {
    id: "bar3", name: "The People's Last Stand", slug: "peoples-last-stand-dallas", neighborhood: "Deep Ellum", city: "Dallas",
    category: "Bars", weightedScore: 4.36, rawAvgScore: 4.1, rank: 3, prevRank: 4, rankDelta: 1, ratingCount: 198,
    isChallenger: false,
    description: "The city's best beer selection — 98 taps of rotating craft, wild fermentation, and vintage bottles. The vintage program has Westvleteren 12 available by the bottle. The cheeseburger is quietly one of the best in the city.",
    tags: ["Craft Beer", "Vintage", "Burgers"],
    priceRange: "$$", hours: "2pm – 2am", phone: "(214) 555-0421",
    address: "2928 Elm St, Deep Ellum, Dallas",
    featuredDish: "98-tap rotating craft selection"
  },
  {
    id: "bar4", name: "Stirr", slug: "stirr-dallas", neighborhood: "Deep Ellum", city: "Dallas",
    category: "Bars", weightedScore: 4.23, rawAvgScore: 4.0, rank: 4, prevRank: 3, rankDelta: -1, ratingCount: 223,
    isChallenger: false,
    description: "Four-floor rooftop entertainment complex with the best view of the Dallas skyline from street level. Each floor has a different bar concept — craft cocktail lounge on ground floor, rooftop tiki bar on the top. The tuna poke nachos are the MVP.",
    tags: ["Rooftop", "Cocktails", "Views"],
    priceRange: "$$", hours: "4pm – 2am (Mon–Fri), 12pm – 2am (Sat–Sun)", phone: "(214) 555-0533",
    address: "2816 Commerce St, Deep Ellum, Dallas",
    featuredDish: "Tuna Poke Nachos + Rooftop Sunset Cocktail"
  },
  {
    id: "bar5", name: "Flying Saucer", slug: "flying-saucer-dallas", neighborhood: "Uptown", city: "Dallas",
    category: "Bars", weightedScore: 4.12, rawAvgScore: 3.9, rank: 5, prevRank: 5, rankDelta: 0, ratingCount: 412,
    isChallenger: false,
    description: "Two floors, 75 rotating beers on tap, and the famous UFO Club which rewards loyal drinkers with a personalized plate on the ceiling when they complete 200 different beers. An institution.",
    tags: ["Beer", "Draught", "Institution"],
    priceRange: "$$", hours: "11am – 2am", phone: "(214) 555-0622",
    address: "2711 McKinney Ave, Uptown, Dallas",
    featuredDish: "75-tap rotating craft selection"
  },

  {
    id: "bak1", name: "Emporium Pies", slug: "emporium-pies-dallas", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Bakeries", weightedScore: 4.76, rawAvgScore: 4.7, rank: 1, prevRank: 1, rankDelta: 0, ratingCount: 512,
    isChallenger: false,
    description: "The crown jewel of Dallas bakeries. Anna Pies and her team make every filling from scratch using seasonal Texas produce. The Drunken Nut pie — Maker's Mark, chocolate, and toasted pecans — has been featured in Bon Appétit. Lines wrap around the block on weekend mornings.",
    tags: ["Pies", "Seasonal", "Handcrafted"],
    image: require("../assets/images/bakeries/emporium-pies.png"),
    priceRange: "$$", hours: "10am – 9pm (Mon–Thu), 10am – 10pm (Fri–Sat)", phone: "(214) 555-0745",
    address: "314 N Bishop Ave, Bishop Arts, Dallas",
    featuredDish: "Drunken Nut Pie (Maker's Mark + chocolate + TX pecans)"
  },
  {
    id: "bak2", name: "Crossroads Deli & Bakery", slug: "crossroads-deli-dallas", neighborhood: "Henderson Ave", city: "Dallas",
    category: "Bakeries", weightedScore: 4.40, rawAvgScore: 4.2, rank: 2, prevRank: 3, rankDelta: 1, ratingCount: 198,
    isChallenger: false,
    description: "Authentic New York-style Jewish deli and bakery run by fourth-generation baker Marcus Feldman who trained at Russ & Daughters on the Lower East Side. The everything bagels are kettle-boiled and wood-fired. Smoked salmon flown in from Alaska weekly.",
    tags: ["Bagels", "Pastries", "NYC-Style"],
    image: require("../assets/images/bakeries/crossroads.png"),
    priceRange: "$", hours: "6am – 3pm", phone: "(214) 555-0811",
    address: "1722 N Henderson Ave, Henderson Ave, Dallas",
    featuredDish: "Wood-fired Everything Bagel with Alaskan lox"
  },
  {
    id: "bak3", name: "La Casita Bakeshop", slug: "la-casita-dallas", neighborhood: "Oak Cliff", city: "Dallas",
    category: "Bakeries", weightedScore: 4.32, rawAvgScore: 4.1, rank: 3, prevRank: 2, rankDelta: -1, ratingCount: 287,
    isChallenger: false,
    description: "Pan dulce and Mexican pastries baked before dawn every day. Griselda Morales has been shaping conchas by hand since 4am for 28 years. The horchata tres leches cake has a four-day waitlist on weekends.",
    tags: ["Pan Dulce", "Mexican", "Conchas"],
    priceRange: "$", hours: "5am – 2pm", phone: "(214) 555-0882",
    address: "3305 W Davis St, Oak Cliff, Dallas",
    featuredDish: "Horchata Tres Leches Cake"
  },
  {
    id: "bak4", name: "Bisous Bisous Pâtisserie", slug: "bisous-bisous-dallas", neighborhood: "Uptown", city: "Dallas",
    category: "Bakeries", weightedScore: 4.24, rawAvgScore: 4.0, rank: 4, prevRank: 5, rankDelta: 1, ratingCount: 167,
    isChallenger: false,
    description: "Classically trained French pâtissier Julie Myrtille trained under Alain Ducasse before opening this tiny jewel box patisserie in Uptown. The croissants require 72 hours of lamination. Only 40 are made daily. Sold out by 9am on weekdays.",
    tags: ["French", "Croissants", "Pastry"],
    priceRange: "$$", hours: "7am – 6pm (Tue–Sat)", phone: "(214) 555-0956",
    address: "4208 Oak Lawn Ave, Uptown, Dallas",
    featuredDish: "72-hour laminated Butter Croissant"
  },
  {
    id: "bak5", name: "Empire Baking Company", slug: "empire-baking-dallas", neighborhood: "East Dallas", city: "Dallas",
    category: "Bakeries", weightedScore: 4.11, rawAvgScore: 3.9, rank: 5, prevRank: 4, rankDelta: -1, ratingCount: 334,
    isChallenger: false,
    description: "Serious artisan bread bakers since 1992. The sourdough starter is 30 years old and named 'Harold.' Whole grain milling on-site. The Saturday loaf — a miche-style country bread — sells out within 45 minutes of opening.",
    tags: ["Sourdough", "Artisan Bread", "Whole Grain"],
    priceRange: "$", hours: "7am – 6pm", phone: "(214) 555-1022",
    address: "5450 W Lovers Ln, East Dallas, Dallas",
    featuredDish: "Saturday Miche (30-year-old starter sourdough)"
  },

  {
    id: "ff1", name: "Raising Cane's", slug: "raising-canes-dallas", neighborhood: "Uptown", city: "Dallas",
    category: "Fast Food", weightedScore: 4.42, rawAvgScore: 4.3, rank: 1, prevRank: 1, rankDelta: 0, ratingCount: 534,
    isChallenger: false,
    description: "The chicken finger empire that does one thing and does it perfectly. The Cane's sauce recipe is locked in a vault. Three tenders, Texas toast, crinkle-cut fries — the combo hasn't changed since 1996.",
    tags: ["Chicken", "Drive-Thru", "Quick"],
    priceRange: "$", hours: "10am – 12am", phone: "(214) 555-1100",
    address: "2720 McKinney Ave, Uptown, Dallas",
    featuredDish: "Box Combo with extra Cane's Sauce"
  },
  {
    id: "ff2", name: "Whataburger", slug: "whataburger-dallas", neighborhood: "North Dallas", city: "Dallas",
    category: "Fast Food", weightedScore: 4.35, rawAvgScore: 4.2, rank: 2, prevRank: 2, rankDelta: 0, ratingCount: 612,
    isChallenger: false,
    description: "The Texas fast food institution since 1950. The Patty Melt on Texas toast at 2am is a rite of passage. The honey butter chicken biscuit before 11am will change your morning forever.",
    tags: ["Burgers", "Texas", "Drive-Thru"],
    priceRange: "$", hours: "24 hours", phone: "(214) 555-1145",
    address: "10220 Coit Rd, North Dallas, Dallas",
    featuredDish: "Patty Melt on Texas Toast"
  },
  {
    id: "ff3", name: "In-N-Out Burger", slug: "in-n-out-dallas", neighborhood: "Far North Dallas", city: "Dallas",
    category: "Fast Food", weightedScore: 4.28, rawAvgScore: 4.1, rank: 3, prevRank: 4, rankDelta: 1, ratingCount: 478,
    isChallenger: false,
    description: "California's gift to Texas. The animal-style burger with its signature spread ignited Dallas when the first location opened. Fresh potatoes cut in-store daily. The secret menu is an open secret everyone participates in.",
    tags: ["Burgers", "California", "Fresh"],
    priceRange: "$", hours: "10:30am – 1am", phone: "(214) 555-1190",
    address: "7940 N Central Expy, Far North Dallas, Dallas",
    featuredDish: "Double-Double Animal Style"
  },
  {
    id: "ff4", name: "Chick-fil-A", slug: "chick-fil-a-dallas", neighborhood: "Oak Lawn", city: "Dallas",
    category: "Fast Food", weightedScore: 4.20, rawAvgScore: 4.0, rank: 4, prevRank: 3, rankDelta: -1, ratingCount: 389,
    isChallenger: false,
    description: "The drive-thru line wraps the block but moves faster than any fast food operation in the city. The original chicken sandwich with pickles on a buttered bun remains the gold standard of fast food chicken.",
    tags: ["Chicken", "Sandwiches", "Drive-Thru"],
    priceRange: "$", hours: "6:30am – 10pm (Mon–Sat)", phone: "(214) 555-1230",
    address: "3450 Oak Lawn Ave, Oak Lawn, Dallas",
    featuredDish: "Original Chicken Sandwich"
  },
  {
    id: "ff5", name: "Torchy's Tacos", slug: "torchys-dallas", neighborhood: "Deep Ellum", city: "Dallas",
    category: "Fast Food", weightedScore: 4.14, rawAvgScore: 3.9, rank: 5, prevRank: 5, rankDelta: 0, ratingCount: 345,
    isChallenger: false,
    description: "Austin-born taco chain that brought the craft taco to the fast-casual space. The Trailer Park taco — fried chicken, green chiles, lettuce, cheese on a flour tortilla — is their calling card. The Queso is legendary.",
    tags: ["Tacos", "Tex-Mex", "Fast Casual"],
    priceRange: "$", hours: "7am – 10pm", phone: "(214) 555-1275",
    address: "2801 Commerce St, Deep Ellum, Dallas",
    featuredDish: "Trailer Park Taco (trashy or classy)"
  },
];

export const MOCK_CHALLENGER: Challenger = {
  id: "ch1",
  challengerId: "b2",
  challengerName: "The Yard Kitchen",
  defenderId: "b1",
  defenderName: "Spice Garden",
  challengerVotes: 1847,
  defenderVotes: 2234,
  startDate: Date.now() - (12 * 24 * 60 * 60 * 1000),
  endDate: Date.now() + (18 * 24 * 60 * 60 * 1000),
  category: "Restaurants",
  city: "Dallas",
  recentComments: [
    { userName: "Marcus T.", userTier: "top", text: "Yard Kitchen has been on fire this month. Three visits in a row and the consistency is remarkable for a place moving this fast.", createdAt: Date.now() - 3600000 },
    { userName: "Priya R.", userTier: "trusted", text: "Spice Garden still has the edge on overall depth of flavour. Thirty years of refinement versus two years of momentum. Not ready to hand over that crown.", createdAt: Date.now() - 7200000 },
    { userName: "Elena S.", userTier: "top", text: "This is the most genuinely competitive challenge Dallas has seen in years. Both restaurants are operating at elite level right now. Whoever wins deserves it.", createdAt: Date.now() - 14400000 },
    { userName: "James K.", userTier: "trusted", text: "The Yard Kitchen's service has improved dramatically since hiring their new floor manager. That was always the gap. Tough call now.", createdAt: Date.now() - 28800000 },
    { userName: "Sofia A.", userTier: "regular", text: "Visited both last weekend specifically for this challenge. Spice Garden's lamb biryani is still the better dish. But Yard Kitchen has the better all-round experience.", createdAt: Date.now() - 36000000 },
    { userName: "David P.", userTier: "trusted", text: "Spice Garden has handled the pressure of this challenge beautifully. If anything, the team seems to be cooking better knowing they're being watched.", createdAt: Date.now() - 54000000 },
  ]
};

export const MOCK_CHALLENGER_2: Challenger = {
  id: "ch2",
  challengerId: "c2",
  challengerName: "Oak Cliff Coffee Roasters",
  defenderId: "c1",
  defenderName: "White Rock Coffee",
  challengerVotes: 934,
  defenderVotes: 1102,
  startDate: Date.now() - (5 * 24 * 60 * 60 * 1000),
  endDate: Date.now() + (25 * 24 * 60 * 60 * 1000),
  category: "Cafes",
  city: "Dallas",
  recentComments: [
    { userName: "Sofia A.", userTier: "top", text: "Oak Cliff's new Ethiopia natural process is genuinely stunning — floral, complex, clean. They're making a serious case here.", createdAt: Date.now() - 1800000 },
    { userName: "Ben W.", userTier: "trusted", text: "White Rock has been the community heartbeat for this city for 17 years. That institutional depth doesn't show up in a single cup comparison. This is their title to lose.", createdAt: Date.now() - 5400000 },
    { userName: "Maya L.", userTier: "top", text: "Two completely different philosophies of what a coffee shop should be. Oak Cliff is the future. White Rock is the soul. This vote is basically asking which you value more.", createdAt: Date.now() - 18000000 },
    { userName: "Tom R.", userTier: "regular", text: "Just voted for Oak Cliff. The quality gap is real. Their sourcing is on another level.", createdAt: Date.now() - 28800000 },
  ]
};

export const MOCK_RATINGS: Rating[] = [
  { id: "r1", businessId: "b1", userId: "u2", userName: "Marcus T.", userTier: "top", food: 5, value: 4, service: 5, wouldReturn: true, comment: "The lamb biryani here is genuinely world-class. I've had it in London and Hyderabad — this stands up.", createdAt: Date.now() - 86400000, rawScore: 4.67, weight: 1.0, weightedScore: 4.67 },
  { id: "r2", businessId: "b1", userId: "u3", userName: "Priya R.", userTier: "trusted", food: 5, value: 4, service: 4, wouldReturn: true, comment: "Consistent every single time. That's the rarest quality in this city.", createdAt: Date.now() - 172800000, rawScore: 4.33, weight: 0.70, weightedScore: 3.03 },
  { id: "r3", businessId: "b1", userId: "u4", userName: "Elena S.", userTier: "top", food: 4, value: 5, service: 5, wouldReturn: true, comment: "For the quality you're getting, the price is genuinely remarkable. Best value fine dining in Dallas.", createdAt: Date.now() - 259200000, rawScore: 4.67, weight: 1.0, weightedScore: 4.67 },
  { id: "r4", businessId: "b1", userId: "u5", userName: "James K.", userTier: "trusted", food: 5, value: 3, service: 4, wouldReturn: true, comment: "Slightly pricier than I'd like but the quality justifies it. The naan alone is worth the trip.", createdAt: Date.now() - 345600000, rawScore: 4.0, weight: 0.70, weightedScore: 2.80 },
  { id: "r5", businessId: "b1", userId: "u6", userName: "Sofia A.", userTier: "regular", food: 5, value: 4, service: 4, wouldReturn: true, comment: "Spice levels are tuned perfectly. They ask, they listen, they deliver.", createdAt: Date.now() - 432000000, rawScore: 4.33, weight: 0.35, weightedScore: 1.52 },
  { id: "r6", businessId: "b1", userId: "u7", userName: "David P.", userTier: "trusted", food: 5, value: 4, service: 5, wouldReturn: true, comment: "My go-to recommendation for anyone visiting Dallas who wants one truly special meal.", createdAt: Date.now() - 518400000, rawScore: 4.67, weight: 0.70, weightedScore: 3.27 },
  { id: "r7", businessId: "b2", userId: "u2", userName: "Marcus T.", userTier: "top", food: 4, value: 5, service: 5, wouldReturn: true, comment: "The smash burger is executed flawlessly. Bone marrow aioli is the right call every time.", createdAt: Date.now() - 129600000, rawScore: 4.67, weight: 1.0, weightedScore: 4.67 },
  { id: "r8", businessId: "b2", userId: "u8", userName: "Nina K.", userTier: "trusted", food: 4, value: 4, service: 4, wouldReturn: true, comment: "Brunch on a Saturday was a 45-minute wait but genuinely worth every minute.", createdAt: Date.now() - 216000000, rawScore: 4.0, weight: 0.70, weightedScore: 2.80 },
  { id: "r9", businessId: "bak1", userId: "u9", userName: "Claire B.", userTier: "top", food: 5, value: 4, service: 5, wouldReturn: true, comment: "The Drunken Nut pie is not of this world. I ordered two so I'd have one for the drive home.", createdAt: Date.now() - 43200000, rawScore: 4.67, weight: 1.0, weightedScore: 4.67 },
  { id: "r10", businessId: "bak1", userId: "u3", userName: "Priya R.", userTier: "trusted", food: 5, value: 5, service: 4, wouldReturn: true, comment: "Worth every penny. The seasonal strawberry pie in summer changed my life.", createdAt: Date.now() - 172800000, rawScore: 4.67, weight: 0.70, weightedScore: 3.27 },
];

export const MOCK_USER: UserProfile = {
  id: "u1",
  name: "Alex Chen",
  username: "alexchen",
  city: "Dallas",
  tier: "regular",
  credibilityScore: 142,
  credibilityBreakdown: {
    basePoints: 10,
    ratingPoints: 16,
    diversityBonus: 30,
    ageBonus: 7,
    varianceBonus: 45,
    helpfulnessBonus: 34,
    flagPenalty: 0,
    totalScore: 142,
  },
  totalRatings: 8,
  totalCategories: 2,
  daysActive: 15,
  ratingVariance: 0.9,
  isFoundingMember: false,
  ratingHistory: [
    { businessId: "c1", businessName: "White Rock Coffee", rawScore: 4.33, weight: 0.35, ratedAt: Date.now() - 86400000 },
    { businessId: "sf1", businessName: "Trompo", rawScore: 5.0, weight: 0.35, ratedAt: Date.now() - 172800000 },
    { businessId: "b3", businessName: "Cuchara Cocina", rawScore: 4.0, weight: 0.35, ratedAt: Date.now() - 259200000 },
    { businessId: "bar1", businessName: "Parliament", rawScore: 4.67, weight: 0.35, ratedAt: Date.now() - 345600000 },
    { businessId: "bak1", businessName: "Emporium Pies", rawScore: 5.0, weight: 0.35, ratedAt: Date.now() - 432000000 },
    { businessId: "b4", businessName: "Seoul Food", rawScore: 3.67, weight: 0.10, ratedAt: Date.now() - 518400000 },
    { businessId: "c3", businessName: "Houndstooth Coffee", rawScore: 4.33, weight: 0.10, ratedAt: Date.now() - 604800000 },
    { businessId: "b7", businessName: "Khao Noodle Shop", rawScore: 4.67, weight: 0.10, ratedAt: Date.now() - 691200000 },
  ],
  businessesHelpedUp: 3,
};

export function getBusinessesByCategory(category: Category): Business[] {
  return MOCK_BUSINESSES.filter(b => b.category === category).sort((a, b) => a.rank - b.rank);
}

export function getBusinessById(id: string): Business | undefined {
  return MOCK_BUSINESSES.find(b => b.id === id);
}

export function getRatingsByBusiness(businessId: string): Rating[] {
  return MOCK_RATINGS.filter(r => r.businessId === businessId);
}

export function getChallengerById(id: string): Challenger | undefined {
  return [MOCK_CHALLENGER, MOCK_CHALLENGER_2].find(c => c.id === id);
}

export function getTrendingBusinesses(): Business[] {
  return [...MOCK_BUSINESSES]
    .filter(b => b.rankDelta > 0)
    .sort((a, b) => b.rankDelta - a.rankDelta)
    .slice(0, 4);
}

export function getAllChallenges(): Challenger[] {
  return [MOCK_CHALLENGER, MOCK_CHALLENGER_2];
}

export function getTierRequirements(
  tier: CredibilityTier,
  credibilityScore: number,
  totalRatings: number,
  totalCategories: number,
  daysActive: number,
  ratingVariance: number,
  activeFlagCount: number
): { nextTier: CredibilityTier | null; requirements: TierRequirement[] } {
  if (tier === "new") {
    return {
      nextTier: "regular",
      requirements: [
        { label: "Credibility score ≥ 100", current: credibilityScore, needed: 100, met: credibilityScore >= 100 },
        { label: "10+ ratings", current: totalRatings, needed: 10, met: totalRatings >= 10 },
        { label: "2+ categories", current: totalCategories, needed: 2, met: totalCategories >= 2 },
        { label: "14+ days active", current: daysActive, needed: 14, met: daysActive >= 14 },
      ],
    };
  }
  if (tier === "regular") {
    return {
      nextTier: "trusted",
      requirements: [
        { label: "Credibility score ≥ 300", current: credibilityScore, needed: 300, met: credibilityScore >= 300 },
        { label: "35+ ratings", current: totalRatings, needed: 35, met: totalRatings >= 35 },
        { label: "3+ categories", current: totalCategories, needed: 3, met: totalCategories >= 3 },
        { label: "45+ days active", current: daysActive, needed: 45, met: daysActive >= 45 },
        { label: "Rating variance ≥ 0.8", current: Math.round(ratingVariance * 100) / 100, needed: 0.8, met: ratingVariance >= 0.8 },
      ],
    };
  }
  if (tier === "trusted") {
    return {
      nextTier: "top",
      requirements: [
        { label: "Credibility score ≥ 600", current: credibilityScore, needed: 600, met: credibilityScore >= 600 },
        { label: "80+ ratings", current: totalRatings, needed: 80, met: totalRatings >= 80 },
        { label: "4+ categories", current: totalCategories, needed: 4, met: totalCategories >= 4 },
        { label: "90+ days active", current: daysActive, needed: 90, met: daysActive >= 90 },
        { label: "Rating variance ≥ 1.0", current: Math.round(ratingVariance * 100) / 100, needed: 1.0, met: ratingVariance >= 1.0 },
        { label: "No active flags", current: activeFlagCount, needed: 0, met: activeFlagCount === 0 },
      ],
    };
  }
  return { nextTier: null, requirements: [] };
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatCountdown(endDate: number): { days: number; hours: number; minutes: number } {
  const diff = Math.max(0, endDate - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
}
