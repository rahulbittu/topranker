import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";

export interface ApiBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  photoUrl: string | null;
  weightedScore: string;
  rawAvgScore: string;
  rankPosition: number | null;
  rankDelta: number;
  totalRatings: number;
  isVerified: boolean;
  isActive: boolean;
  inChallenger: boolean;
  description: string | null;
  tags: string | null;
  priceRange: string | null;
  hours: string | null;
  featuredDish: string | null;
}

export interface ApiRating {
  id: string;
  memberId: string;
  businessId: string;
  foodQuality: number;
  valueForMoney: number;
  service: number;
  wouldReturn: boolean;
  note: string | null;
  rawScore: string;
  weight: string;
  weightedScore: string;
  isFlagged: boolean;
  createdAt: string;
  memberName?: string;
  memberTier?: string;
}

export interface ApiChallenger {
  id: string;
  challengerId: string;
  defenderId: string;
  category: string;
  city: string;
  startDate: string;
  endDate: string;
  challengerWeightedVotes: string;
  defenderWeightedVotes: string;
  status: string;
  challengerBusiness: ApiBusiness;
  defenderBusiness: ApiBusiness;
}

export interface ApiMemberProfile {
  id: string;
  displayName: string;
  username: string;
  email: string;
  city: string;
  credibilityScore: number;
  credibilityTier: string;
  totalRatings: number;
  totalCategories: number;
  isFoundingMember: boolean;
  joinedAt: string;
  daysActive: number;
  credibilityBreakdown: {
    base: number;
    ratingPoints: number;
    diversityBonus: number;
    ageBonus: number;
    varianceBonus: number;
    helpfulnessBonus: number;
    flagPenalty: number;
  };
  ratingHistory: (ApiRating & { businessName: string })[];
}

const CATEGORY_MAP: Record<string, string> = {
  Restaurants: "restaurant",
  Cafes: "cafe",
  "Street Food": "street_food",
  Bars: "bar",
  Bakeries: "bakery",
  "Fast Food": "fast_food",
};

const CATEGORY_DISPLAY: Record<string, string> = {
  restaurant: "Restaurants",
  cafe: "Cafes",
  street_food: "Street Food",
  bar: "Bars",
  bakery: "Bakeries",
  fast_food: "Fast Food",
};

export function categoryToApi(displayName: string): string {
  return CATEGORY_MAP[displayName] || displayName.toLowerCase().replace(/\s/g, "_");
}

export function categoryToDisplay(apiCategory: string): string {
  return CATEGORY_DISPLAY[apiCategory] || apiCategory;
}

export function mapApiBusiness(biz: ApiBusiness) {
  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    neighborhood: biz.neighborhood || "",
    city: biz.city,
    category: categoryToDisplay(biz.category),
    weightedScore: parseFloat(biz.weightedScore),
    rawAvgScore: parseFloat(biz.rawAvgScore),
    rank: biz.rankPosition || 0,
    prevRank: (biz.rankPosition || 0) + biz.rankDelta,
    rankDelta: biz.rankDelta,
    ratingCount: biz.totalRatings,
    isChallenger: biz.inChallenger,
    description: biz.description || "",
    tags: biz.tags ? biz.tags.split(",") : [],
    priceRange: biz.priceRange,
    hours: biz.hours,
    phone: biz.phone,
    address: biz.address,
    featuredDish: biz.featuredDish,
    isVerified: biz.isVerified,
    image: undefined,
  };
}

export function mapApiRating(rating: ApiRating) {
  return {
    id: rating.id,
    userName: rating.memberName || "Anonymous",
    userTier: (rating.memberTier || "new") as any,
    rawScore: parseFloat(rating.rawScore),
    weight: parseFloat(rating.weight),
    food: rating.foodQuality,
    value: rating.valueForMoney,
    service: rating.service,
    wouldReturn: rating.wouldReturn,
    comment: rating.note,
    createdAt: new Date(rating.createdAt).getTime(),
  };
}

async function apiFetch<T>(path: string): Promise<T> {
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchLeaderboard(city: string, category: string, limit: number = 10) {
  const apiCategory = categoryToApi(category);
  const businesses = await apiFetch<ApiBusiness[]>(
    `/api/leaderboard?city=${encodeURIComponent(city)}&category=${encodeURIComponent(apiCategory)}&limit=${limit}`,
  );
  return businesses.map(mapApiBusiness);
}

export async function fetchBusinessBySlug(slug: string) {
  const data = await apiFetch<ApiBusiness & { recentRatings: ApiRating[] }>(
    `/api/businesses/${encodeURIComponent(slug)}`,
  );
  return {
    business: mapApiBusiness(data),
    ratings: data.recentRatings.map(mapApiRating),
  };
}

export async function fetchActiveChallenges(city: string) {
  return apiFetch<ApiChallenger[]>(`/api/challengers/active?city=${encodeURIComponent(city)}`);
}

export async function fetchMemberProfile() {
  return apiFetch<ApiMemberProfile>("/api/members/me");
}

export async function fetchBusinessSearch(query: string, city: string, category?: string) {
  let path = `/api/businesses/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`;
  if (category) path += `&category=${encodeURIComponent(categoryToApi(category))}`;
  const businesses = await apiFetch<ApiBusiness[]>(path);
  return businesses.map(mapApiBusiness);
}
