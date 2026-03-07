import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";
import { CATEGORY_MAP, type CredibilityTier } from "@/lib/data";

export interface ApiBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  lat: string | null;
  lng: string | null;
  phone: string | null;
  website: string | null;
  photoUrl: string | null;
  photoUrls?: string[];
  weightedScore: string;
  rawAvgScore: string;
  rankPosition: number | null;
  rankDelta: number;
  prevRankPosition: number | null;
  totalRatings: number;
  isActive: boolean;
  inChallenger: boolean;
  description: string | null;
  priceRange: string | null;
  isOpenNow: boolean;
  isClaimed: boolean;
  googleRating: string | null;
  googleMapsUrl: string | null;
  openingHours: { weekday_text?: string[]; periods?: any[] } | null;
}

export interface ApiRating {
  id: string;
  memberId: string;
  businessId: string;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean;
  note: string | null;
  rawScore: string;
  weight: string;
  weightedScore: string;
  isFlagged: boolean;
  autoFlagged: boolean;
  source: string | null;
  createdAt: string;
  memberName?: string;
  memberTier?: string;
  memberAvatarUrl?: string | null;
}

export interface ApiDish {
  id: string;
  businessId: string;
  name: string;
  nameNormalized: string;
  voteCount: number;
  isActive: boolean;
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
  totalVotes: number;
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
  avatarUrl: string | null;
  credibilityScore: number;
  credibilityTier: string;
  totalRatings: number;
  totalCategories: number;
  distinctBusinesses: number;
  isFoundingMember: boolean;
  joinedAt: string;
  daysActive: number;
  ratingVariance: number;
  credibilityBreakdown: {
    base: number;
    volume: number;
    diversity: number;
    age: number;
    variance: number;
    helpfulness: number;
    penalties: number;
  };
  ratingHistory: (ApiRating & { businessName: string })[];
}

const CATEGORY_DISPLAY: Record<string, string> = {};
for (const [display, api] of Object.entries(CATEGORY_MAP)) {
  CATEGORY_DISPLAY[api] = display;
}

export function categoryToApi(displayName: string): string {
  return CATEGORY_MAP[displayName] || displayName.toLowerCase().replace(/\s/g, "_");
}

export function categoryToDisplay(apiCategory: string): string {
  return CATEGORY_DISPLAY[apiCategory] || apiCategory;
}

export function mapApiBusiness(biz: ApiBusiness) {
  const photoUrls = biz.photoUrls && biz.photoUrls.length > 0
    ? biz.photoUrls
    : biz.photoUrl
    ? [biz.photoUrl]
    : [];

  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    neighborhood: biz.neighborhood || "",
    city: biz.city,
    category: biz.category,
    weightedScore: parseFloat(biz.weightedScore) || 0,
    rawAvgScore: parseFloat(biz.rawAvgScore) || 0,
    rank: biz.rankPosition || 0,
    prevRank: biz.prevRankPosition,
    rankDelta: biz.rankDelta,
    ratingCount: biz.totalRatings,
    isChallenger: biz.inChallenger,
    description: biz.description || undefined,
    priceRange: biz.priceRange || undefined,
    phone: biz.phone || undefined,
    website: biz.website || undefined,
    address: biz.address || undefined,
    photoUrl: photoUrls[0] || undefined,
    photoUrls,
    isOpenNow: biz.isOpenNow,
    lat: biz.lat ? parseFloat(biz.lat) : undefined,
    lng: biz.lng ? parseFloat(biz.lng) : undefined,
    isClaimed: biz.isClaimed,
    googleRating: biz.googleRating ? parseFloat(biz.googleRating) : undefined,
    googleMapsUrl: biz.googleMapsUrl || undefined,
    openingHours: biz.openingHours || undefined,
  };
}

export function mapApiRating(rating: ApiRating) {
  return {
    id: rating.id,
    userName: rating.memberName || "Anonymous",
    userTier: (rating.memberTier || "community") as CredibilityTier,
    userAvatarUrl: rating.memberAvatarUrl || undefined,
    rawScore: parseFloat(rating.rawScore) || 0,
    weight: parseFloat(rating.weight) || 0,
    q1: rating.q1Score,
    q2: rating.q2Score,
    q3: rating.q3Score,
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
    let message = res.statusText;
    try {
      const text = await res.text();
      // Try to parse as JSON for structured error
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch {
      // If response is HTML or unparseable, use status text
    }
    throw new Error(`${res.status}: ${message}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchLeaderboard(city: string, category: string, limit: number = 50) {
  const apiCategory = categoryToApi(category);
  const businesses = await apiFetch<ApiBusiness[]>(
    `/api/leaderboard?city=${encodeURIComponent(city)}&category=${encodeURIComponent(apiCategory)}&limit=${limit}`,
  );
  return businesses.map(mapApiBusiness);
}

export async function fetchBusinessBySlug(slug: string) {
  const data = await apiFetch<ApiBusiness & { recentRatings: ApiRating[]; dishes: ApiDish[] }>(
    `/api/businesses/${encodeURIComponent(slug)}`,
  );
  return {
    business: mapApiBusiness(data),
    ratings: data.recentRatings.map(mapApiRating),
    dishes: data.dishes || [],
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

export async function fetchCategories(city: string = "Dallas"): Promise<string[]> {
  const data = await apiFetch<string[] | { category: string }[]>(`/api/leaderboard/categories?city=${encodeURIComponent(city)}`);
  if (!data || data.length === 0) return [];
  // Handle both string[] and {category}[] formats
  if (typeof data[0] === "string") return data as string[];
  return (data as { category: string }[]).map(d => d.category);
}

export async function fetchDishSearch(businessId: string, query: string) {
  return apiFetch<ApiDish[]>(
    `/api/dishes/search?business_id=${encodeURIComponent(businessId)}&q=${encodeURIComponent(query)}`,
  );
}
