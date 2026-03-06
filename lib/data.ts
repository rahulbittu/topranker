export type Category = "Restaurants" | "Cafes" | "Street Food" | "Bars" | "Bakeries";

export const CATEGORIES: Category[] = ["Restaurants", "Cafes", "Street Food", "Bars", "Bakeries"];

export type CredibilityTier = "New Member" | "Regular" | "Trusted" | "Top Reviewer";

export const TIER_WEIGHTS: Record<CredibilityTier, number> = {
  "New Member": 0.5,
  "Regular": 1.0,
  "Trusted": 1.5,
  "Top Reviewer": 2.0,
};

export const TIER_COLORS: Record<CredibilityTier, string> = {
  "New Member": "#888888",
  "Regular": "#60A5FA",
  "Trusted": "#A78BFA",
  "Top Reviewer": "#F5C518",
};

export interface Rating {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userTier: CredibilityTier;
  food?: number;
  value?: number;
  service?: number;
  wouldReturn?: boolean;
  comment?: string;
  createdAt: number;
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
  neighborhood: string;
  city: string;
  category: Category;
  score: number;
  rank: number;
  prevRank: number;
  ratingCount: number;
  isChallenger?: boolean;
  challengerId?: string;
  description: string;
  tags: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  tier: CredibilityTier;
  ratingsSubmitted: number;
  categoriesCovered: string[];
  joinedAt: number;
  ratingHistory: { businessId: string; businessName: string; score: number; ratedAt: number }[];
  businessesHelpedUp: number;
}

export const MOCK_BUSINESSES: Business[] = [
  {
    id: "b1", name: "Spice Garden", neighborhood: "Uptown", city: "Dallas",
    category: "Restaurants", score: 94.2, rank: 1, prevRank: 1, ratingCount: 312,
    isChallenger: false, description: "Legendary North Indian cuisine with 30-year legacy",
    tags: ["Biryani", "Curry", "Fine Dining"]
  },
  {
    id: "b2", name: "The Yard Kitchen", neighborhood: "Deep Ellum", city: "Dallas",
    category: "Restaurants", score: 91.8, rank: 2, prevRank: 4, ratingCount: 287,
    isChallenger: true, challengerId: "ch1", description: "Modern American comfort food",
    tags: ["Burgers", "Craft Beer", "Brunch"]
  },
  {
    id: "b3", name: "Cuchara Cocina", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Restaurants", score: 90.5, rank: 3, prevRank: 2, ratingCount: 241,
    isChallenger: false, description: "Authentic Mexican antojitos and mescal",
    tags: ["Mexican", "Tacos", "Mezcal"]
  },
  {
    id: "b4", name: "Seoul Food", neighborhood: "Oak Lawn", city: "Dallas",
    category: "Restaurants", score: 88.9, rank: 4, prevRank: 3, ratingCount: 198,
    isChallenger: false, description: "Korean BBQ and street food classics",
    tags: ["Korean", "BBQ", "Ramen"]
  },
  {
    id: "b5", name: "Pappadeaux Seafood", neighborhood: "North Dallas", city: "Dallas",
    category: "Restaurants", score: 87.3, rank: 5, prevRank: 5, ratingCount: 445,
    isChallenger: false, description: "Texas Gulf seafood at its finest",
    tags: ["Seafood", "Cajun", "Lobster"]
  },
  {
    id: "b6", name: "Lucia", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Restaurants", score: 86.1, rank: 6, prevRank: 7, ratingCount: 167,
    isChallenger: false, description: "Italian-inspired with Texas ingredients",
    tags: ["Italian", "Pasta", "Wine"]
  },
  {
    id: "b7", name: "Khao Noodle Shop", neighborhood: "Lowest Greenville", city: "Dallas",
    category: "Restaurants", score: 85.4, rank: 7, prevRank: 6, ratingCount: 154,
    isChallenger: false, description: "Northern Thai noodles, no-frills perfection",
    tags: ["Thai", "Noodles", "Authentic"]
  },
  {
    id: "b8", name: "Mirador", neighborhood: "Highland Park", city: "Dallas",
    category: "Restaurants", score: 84.2, rank: 8, prevRank: 9, ratingCount: 209,
    isChallenger: false, description: "Mexican elevated fine dining with skyline views",
    tags: ["Mexican", "Fine Dining", "Rooftop"]
  },
  {
    id: "b9", name: "Pecan Lodge", neighborhood: "Deep Ellum", city: "Dallas",
    category: "Restaurants", score: 83.7, rank: 9, prevRank: 8, ratingCount: 523,
    isChallenger: false, description: "The definitive Texas BBQ experience",
    tags: ["BBQ", "Brisket", "Texas"]
  },
  {
    id: "b10", name: "Fearing's", neighborhood: "Uptown", city: "Dallas",
    category: "Restaurants", score: 82.9, rank: 10, prevRank: 10, ratingCount: 178,
    isChallenger: false, description: "Dean Fearing's Southwest-inspired fine dining",
    tags: ["Southwest", "Fine Dining", "Steakhouse"]
  },
  {
    id: "c1", name: "White Rock Coffee", neighborhood: "East Dallas", city: "Dallas",
    category: "Cafes", score: 92.1, rank: 1, prevRank: 2, ratingCount: 267,
    isChallenger: false, description: "Community roaster and Dallas institution",
    tags: ["Specialty Coffee", "Community", "Local"]
  },
  {
    id: "c2", name: "Oak Cliff Coffee Roasters", neighborhood: "Oak Cliff", city: "Dallas",
    category: "Cafes", score: 90.3, rank: 2, prevRank: 1, ratingCount: 198,
    isChallenger: true, challengerId: "ch2", description: "Single-origin micro-roaster",
    tags: ["Pour Over", "Single Origin", "Roastery"]
  },
  {
    id: "c3", name: "Houndstooth Coffee", neighborhood: "Uptown", city: "Dallas",
    category: "Cafes", score: 88.7, rank: 3, prevRank: 3, ratingCount: 312,
    isChallenger: false, description: "Austin-born specialty coffee chain",
    tags: ["Specialty", "Espresso", "Latte Art"]
  },
  {
    id: "c4", name: "Cultivar Coffee", neighborhood: "Trinity Groves", city: "Dallas",
    category: "Cafes", score: 86.2, rank: 4, prevRank: 5, ratingCount: 143,
    isChallenger: false, description: "Farm-direct relationships, exceptional sourcing",
    tags: ["Farm Direct", "Cold Brew", "Sustainable"]
  },
  {
    id: "c5", name: "Thunderbird Station", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Cafes", score: 84.9, rank: 5, prevRank: 4, ratingCount: 189,
    isChallenger: false, description: "All-day cafe with eclectic rotating menu",
    tags: ["All-Day", "Breakfast", "Brunch"]
  },
  {
    id: "sf1", name: "Trompo", neighborhood: "West Dallas", city: "Dallas",
    category: "Street Food", score: 93.5, rank: 1, prevRank: 1, ratingCount: 408,
    isChallenger: false, description: "Al pastor tacos from the spinning trompo",
    tags: ["Tacos", "Al Pastor", "Authentic"]
  },
  {
    id: "sf2", name: "Nammi Truck", neighborhood: "Various", city: "Dallas",
    category: "Street Food", score: 89.2, rank: 2, prevRank: 3, ratingCount: 234,
    isChallenger: false, description: "Vietnamese street food on wheels",
    tags: ["Vietnamese", "Banh Mi", "Pho"]
  },
  {
    id: "sf3", name: "Jimmy's Food Store", neighborhood: "East Dallas", city: "Dallas",
    category: "Street Food", score: 87.6, rank: 3, prevRank: 2, ratingCount: 178,
    isChallenger: false, description: "Italian deli and street-food fixture",
    tags: ["Italian", "Deli", "Sandwiches"]
  },
  {
    id: "bar1", name: "Parliament", neighborhood: "Oak Lawn", city: "Dallas",
    category: "Bars", score: 91.4, rank: 1, prevRank: 1, ratingCount: 345,
    isChallenger: false, description: "Craft cocktails in a Victorian-era setting",
    tags: ["Cocktails", "Craft", "Speakeasy"]
  },
  {
    id: "bar2", name: "Midnight Rambler", neighborhood: "Downtown", city: "Dallas",
    category: "Bars", score: 89.8, rank: 2, prevRank: 2, ratingCount: 287,
    isChallenger: true, challengerId: "ch1", description: "Hotel bar with legendary bartenders",
    tags: ["Hotel Bar", "Craft Cocktails", "Upscale"]
  },
  {
    id: "bak1", name: "Emporium Pies", neighborhood: "Bishop Arts", city: "Dallas",
    category: "Bakeries", score: 95.1, rank: 1, prevRank: 1, ratingCount: 512,
    isChallenger: false, description: "Hand-crafted pies with seasonal fillings",
    tags: ["Pies", "Seasonal", "Handcrafted"]
  },
  {
    id: "bak2", name: "Crossroads Deli & Bakery", neighborhood: "Henderson Ave", city: "Dallas",
    category: "Bakeries", score: 87.9, rank: 2, prevRank: 3, ratingCount: 198,
    isChallenger: false, description: "New York-style bagels and pastries",
    tags: ["Bagels", "Pastries", "NYC-Style"]
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
    { userName: "Marcus T.", userTier: "Top Reviewer", text: "Yard Kitchen has been on fire this month, three visits in and always consistent.", createdAt: Date.now() - 3600000 },
    { userName: "Priya R.", userTier: "Trusted", text: "Spice Garden still has the edge on overall depth of flavour. Not ready to give up that crown.", createdAt: Date.now() - 7200000 },
    { userName: "Elena S.", userTier: "Top Reviewer", text: "This is the most interesting challenge Dallas has seen this year. Both are elite.", createdAt: Date.now() - 14400000 },
    { userName: "James K.", userTier: "Trusted", text: "Yard Kitchen service has improved dramatically. Tough call now.", createdAt: Date.now() - 28800000 },
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
    { userName: "Sofia A.", userTier: "Top Reviewer", text: "Oak Cliff's new Ethiopian natural process is stunning. Real contender.", createdAt: Date.now() - 1800000 },
    { userName: "Ben W.", userTier: "Trusted", text: "White Rock has been the community heartbeat for years. This is their title to lose.", createdAt: Date.now() - 5400000 },
  ]
};

export const MOCK_RATINGS: Rating[] = [
  { id: "r1", businessId: "b1", userId: "u2", userName: "Marcus T.", userTier: "Top Reviewer", food: 5, value: 4, service: 5, wouldReturn: true, comment: "The lamb biryani here is genuinely world-class.", createdAt: Date.now() - 86400000, weightedScore: 4.8 },
  { id: "r2", businessId: "b1", userId: "u3", userName: "Priya R.", userTier: "Trusted", food: 5, value: 4, service: 4, wouldReturn: true, comment: "Consistent every single time. Rare quality.", createdAt: Date.now() - 172800000, weightedScore: 4.6 },
  { id: "r3", businessId: "b1", userId: "u4", userName: "Elena S.", userTier: "Top Reviewer", food: 4, value: 5, service: 5, wouldReturn: true, comment: "Best value fine dining in Dallas right now.", createdAt: Date.now() - 259200000, weightedScore: 4.7 },
  { id: "r4", businessId: "b1", userId: "u5", userName: "James K.", userTier: "Trusted", food: 5, value: 3, service: 4, wouldReturn: true, createdAt: Date.now() - 345600000, weightedScore: 4.4 },
  { id: "r5", businessId: "b1", userId: "u6", userName: "Sofia A.", userTier: "Regular", food: 5, value: 4, service: 4, wouldReturn: true, comment: "Spice levels are perfect.", createdAt: Date.now() - 432000000, weightedScore: 4.3 },
];

export const MOCK_USER: UserProfile = {
  id: "u1",
  name: "Alex Chen",
  tier: "Regular",
  ratingsSubmitted: 8,
  categoriesCovered: ["Restaurants", "Cafes"],
  joinedAt: Date.now() - (15 * 24 * 60 * 60 * 1000),
  ratingHistory: [
    { businessId: "c1", businessName: "White Rock Coffee", score: 4.5, ratedAt: Date.now() - 86400000 },
    { businessId: "sf1", businessName: "Trompo", score: 5.0, ratedAt: Date.now() - 172800000 },
    { businessId: "b3", businessName: "Cuchara Cocina", score: 4.2, ratedAt: Date.now() - 259200000 },
    { businessId: "bar1", businessName: "Parliament", score: 4.8, ratedAt: Date.now() - 345600000 },
    { businessId: "bak1", businessName: "Emporium Pies", score: 5.0, ratedAt: Date.now() - 432000000 },
    { businessId: "b4", businessName: "Seoul Food", score: 4.0, ratedAt: Date.now() - 518400000 },
    { businessId: "c3", businessName: "Houndstooth Coffee", score: 4.3, ratedAt: Date.now() - 604800000 },
    { businessId: "b7", businessName: "Khao Noodle Shop", score: 4.7, ratedAt: Date.now() - 691200000 },
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
    .filter(b => b.prevRank > b.rank)
    .sort((a, b) => (b.prevRank - b.rank) - (a.prevRank - a.rank))
    .slice(0, 3);
}

export function getAllChallenges(): Challenger[] {
  return [MOCK_CHALLENGER, MOCK_CHALLENGER_2];
}

export function getTierProgress(tier: CredibilityTier, ratingsCount: number, categoriesCount: number): { next: CredibilityTier | null; progressPercent: number; criteriaText: string } {
  if (tier === "New Member") {
    const needed = 10;
    const percent = Math.min((ratingsCount / needed) * 100, 100);
    return {
      next: "Regular",
      progressPercent: percent,
      criteriaText: `Rate ${Math.max(0, needed - ratingsCount)} more businesses to reach Regular`
    };
  }
  if (tier === "Regular") {
    const ratingsNeeded = 25;
    const catsNeeded = 3;
    const rPercent = Math.min(ratingsCount / ratingsNeeded, 1);
    const cPercent = Math.min(categoriesCount / catsNeeded, 1);
    const percent = ((rPercent + cPercent) / 2) * 100;
    const rLeft = Math.max(0, ratingsNeeded - ratingsCount);
    const cLeft = Math.max(0, catsNeeded - categoriesCount);
    let text = "";
    if (rLeft > 0 && cLeft > 0) text = `Rate ${rLeft} more businesses in ${cLeft} more categories to reach Trusted`;
    else if (rLeft > 0) text = `Rate ${rLeft} more businesses to reach Trusted`;
    else text = `Rate in ${cLeft} more categories to reach Trusted`;
    return { next: "Trusted", progressPercent: percent, criteriaText: text };
  }
  if (tier === "Trusted") {
    const needed = 50;
    const percent = Math.min((ratingsCount / needed) * 100, 100);
    return {
      next: "Top Reviewer",
      progressPercent: percent,
      criteriaText: `Rate ${Math.max(0, needed - ratingsCount)} more businesses and maintain accuracy to reach Top Reviewer`
    };
  }
  return { next: null, progressPercent: 100, criteriaText: "You have reached the highest tier" };
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
