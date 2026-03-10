import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";
import { CATEGORY_MAP, type CredibilityTier } from "@/lib/data";
import {
  MOCK_BUSINESSES,
  MOCK_RATINGS,
  MOCK_DISHES,
  MOCK_CHALLENGERS,
  MOCK_MEMBER_PROFILE,
  MOCK_MEMBER_IMPACT,
  MOCK_RANK_HISTORY,
  MOCK_CATEGORIES,
} from "@/lib/mock-data";

export interface ApiBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  cuisine: string | null;
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
  hasPhoto?: boolean; // Sprint 548: rating photo indicator
  hasReceipt?: boolean; // Sprint 548: receipt indicator
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
    penalties: number;
  };
  ratingHistory: (ApiRating & { businessName: string })[];
  // Badge context fields (optional — populated when available)
  currentStreak?: number;
  referralCount?: number;
  citiesRated?: number;
  hasRatedAfterMidnight?: boolean;
  hasRatedBefore7AM?: boolean;
  hasGivenPerfect5?: boolean;
  hasGivenScore1?: boolean;
  springRatings?: number;
  summerRatings?: number;
  fallRatings?: number;
  winterRatings?: number;
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

/**
 * Resolve a photo URL. If it's a Google Places reference (starts with "places/"),
 * convert it to a proxy URL. Otherwise return as-is.
 */
function resolvePhotoUrl(url: string): string {
  if (url.startsWith("places/")) {
    const base = getApiUrl();
    return `${base}/api/photos/proxy?ref=${encodeURIComponent(url)}&maxwidth=600`;
  }
  return url;
}

export function mapApiBusiness(biz: ApiBusiness) {
  const rawUrls = biz.photoUrls && biz.photoUrls.length > 0
    ? biz.photoUrls
    : biz.photoUrl
    ? [biz.photoUrl]
    : [];
  const photoUrls = rawUrls.map(resolvePhotoUrl);

  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    neighborhood: biz.neighborhood || "",
    city: biz.city,
    category: biz.category,
    cuisine: biz.cuisine || null,
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
    // Sprint 457: Map dynamic hours fields from server
    closingTime: (biz as any).closingTime || undefined,
    nextOpenTime: (biz as any).nextOpenTime || undefined,
    todayHours: (biz as any).todayHours || undefined,
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
    memberId: rating.memberId,
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
    hasPhoto: rating.hasPhoto || false, // Sprint 548
    hasReceipt: rating.hasReceipt || false, // Sprint 548
    createdAt: new Date(rating.createdAt).getTime(),
  };
}

/** Returns mock data for a given API path when backend is unreachable */
function getMockData(path: string): unknown | null {
  if (path.startsWith("/api/leaderboard/categories")) return MOCK_CATEGORIES;
  if (path.startsWith("/api/leaderboard")) return MOCK_BUSINESSES;
  if (path.startsWith("/api/trending")) return MOCK_BUSINESSES.filter(b => b.rankDelta > 0).slice(0, 3);
  if (path.startsWith("/api/challengers")) return MOCK_CHALLENGERS;
  if (path.startsWith("/api/members/me/impact")) return MOCK_MEMBER_IMPACT;
  if (path.startsWith("/api/members/me")) return MOCK_MEMBER_PROFILE;
  if (path.includes("/rank-history")) return MOCK_RANK_HISTORY;
  if (path.startsWith("/api/businesses/search")) {
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const q = (urlParams.get("q") || "").toLowerCase().trim();
    const city = urlParams.get("city") || "";
    let results = MOCK_BUSINESSES.filter(b => b.isActive);
    if (city) results = results.filter(b => b.city.toLowerCase() === city.toLowerCase());
    if (q) {
      results = results.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.neighborhood || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q) ||
        (b.description || "").toLowerCase().includes(q)
      );
    }
    return results.slice(0, 20);
  }
  if (path.startsWith("/api/businesses/")) {
    const slug = path.split("/api/businesses/")[1]?.split("?")[0];
    const biz = MOCK_BUSINESSES.find(b => b.slug === slug) || MOCK_BUSINESSES[0];
    return { ...biz, recentRatings: MOCK_RATINGS, dishes: MOCK_DISHES };
  }
  return null;
}

/** Track whether mock data has been served in this session */
let _servingMockData = false;
export function isServingMockData(): boolean { return _servingMockData; }
export function resetMockDataFlag(): void { _servingMockData = false; }

async function apiFetch<T>(path: string): Promise<T> {
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);
  try {
    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) {
      let message = res.statusText;
      try {
        const text = await res.text();
        const json = JSON.parse(text);
        message = json.message || json.error || text;
      } catch {
        // If response is HTML or unparseable, use status text
      }
      throw new Error(`${res.status}: ${message}`);
    }
    const json = await res.json();
    _servingMockData = false;
    return json.data;
  } catch (err) {
    // Fallback to mock data ONLY in development — never serve fake data in production
    if (__DEV__) {
      const mock = getMockData(path);
      if (mock !== null) {
        console.warn(`[MockData] Backend unreachable — serving demo data for: ${path}`);
        _servingMockData = true;
        return mock as T;
      }
    }
    throw err;
  }
}

export async function fetchLeaderboard(city: string, category: string, limit: number = 50, cuisine?: string) {
  const apiCategory = categoryToApi(category);
  let url = `/api/leaderboard?city=${encodeURIComponent(city)}&category=${encodeURIComponent(apiCategory)}&limit=${limit}`;
  if (cuisine) url += `&cuisine=${encodeURIComponent(cuisine)}`;
  const businesses = await apiFetch<ApiBusiness[]>(url);
  return businesses.map(mapApiBusiness);
}

export interface ApiPhotoMeta {
  url: string;
  uploaderName: string | null;
  uploadDate: string;
  isHero: boolean;
  source: "business" | "community";
}

export async function fetchBusinessBySlug(slug: string) {
  const data = await apiFetch<ApiBusiness & { recentRatings: ApiRating[]; dishes: ApiDish[]; photoMeta?: ApiPhotoMeta[]; communityPhotoCount?: number }>(
    `/api/businesses/${encodeURIComponent(slug)}`,
  );
  return {
    business: mapApiBusiness(data),
    ratings: data.recentRatings.map(mapApiRating),
    dishes: data.dishes || [],
    photoMeta: data.photoMeta || [],
    communityPhotoCount: data.communityPhotoCount || 0,
  };
}

export async function fetchActiveChallenges(city: string) {
  return apiFetch<ApiChallenger[]>(`/api/challengers/active?city=${encodeURIComponent(city)}`);
}

export async function fetchMemberProfile() {
  return apiFetch<ApiMemberProfile>("/api/members/me");
}

// Sprint 442: Extended with dietary, lat/lng, maxDistance
// Sprint 473: Added limit/offset pagination params
export interface SearchPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function fetchBusinessSearch(
  query: string, city: string, category?: string, cuisine?: string,
  opts?: { dietary?: string[]; lat?: number; lng?: number; maxDistance?: number; openNow?: boolean; openLate?: boolean; openWeekends?: boolean; limit?: number; offset?: number },
) {
  let path = `/api/businesses/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`;
  if (category) path += `&category=${encodeURIComponent(categoryToApi(category))}`;
  if (cuisine) path += `&cuisine=${encodeURIComponent(cuisine)}`;
  if (opts?.dietary?.length) path += `&dietary=${encodeURIComponent(opts.dietary.join(","))}`;
  if (opts?.lat != null && opts?.lng != null) {
    path += `&lat=${opts.lat}&lng=${opts.lng}`;
    if (opts?.maxDistance) path += `&maxDistance=${opts.maxDistance}`;
  }
  // Sprint 447: Hours-based filters
  if (opts?.openNow) path += `&openNow=true`;
  if (opts?.openLate) path += `&openLate=true`;
  if (opts?.openWeekends) path += `&openWeekends=true`;
  // Sprint 473: Pagination
  if (opts?.limit) path += `&limit=${opts.limit}`;
  if (opts?.offset) path += `&offset=${opts.offset}`;
  const businesses = await apiFetch<ApiBusiness[]>(path);
  return businesses.map(mapApiBusiness);
}

// Sprint 473: Fetch with pagination metadata
export async function fetchBusinessSearchPaginated(
  query: string, city: string, category?: string, cuisine?: string,
  opts?: { dietary?: string[]; lat?: number; lng?: number; maxDistance?: number; openNow?: boolean; openLate?: boolean; openWeekends?: boolean; limit?: number; offset?: number },
): Promise<{ businesses: ReturnType<typeof mapApiBusiness>[]; pagination: SearchPagination }> {
  let path = `/api/businesses/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`;
  if (category) path += `&category=${encodeURIComponent(categoryToApi(category))}`;
  if (cuisine) path += `&cuisine=${encodeURIComponent(cuisine)}`;
  if (opts?.dietary?.length) path += `&dietary=${encodeURIComponent(opts.dietary.join(","))}`;
  if (opts?.lat != null && opts?.lng != null) {
    path += `&lat=${opts.lat}&lng=${opts.lng}`;
    if (opts?.maxDistance) path += `&maxDistance=${opts.maxDistance}`;
  }
  if (opts?.openNow) path += `&openNow=true`;
  if (opts?.openLate) path += `&openLate=true`;
  if (opts?.openWeekends) path += `&openWeekends=true`;
  if (opts?.limit) path += `&limit=${opts.limit}`;
  if (opts?.offset) path += `&offset=${opts.offset}`;
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  const json = await res.json();
  return {
    businesses: (json.data || []).map(mapApiBusiness),
    pagination: json.pagination || { total: 0, limit: 20, offset: 0, hasMore: false },
  };
}

export type AutocompleteSuggestion = {
  id: string;
  name: string;
  slug: string;
  category: string;
  cuisine?: string;
  neighborhood: string | null;
  weightedScore?: number;
  /** Sprint 497: Suggestion type for icon differentiation */
  type?: "business" | "dish" | "cuisine" | "category";
};

export async function fetchAutocomplete(query: string, city: string): Promise<AutocompleteSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  return apiFetch<AutocompleteSuggestion[]>(
    `/api/businesses/autocomplete?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`,
  );
}

export type PopularCategory = { category: string; count: number };

export async function fetchPopularCategories(city: string): Promise<PopularCategory[]> {
  return apiFetch<PopularCategory[]>(
    `/api/businesses/popular-categories?city=${encodeURIComponent(city)}`,
  );
}

export type OnboardingStep = { key: string; label: string; completed: boolean; detail?: string };
export type OnboardingProgress = { steps: OnboardingStep[]; completedCount: number; totalSteps: number };

export async function fetchOnboardingProgress(): Promise<OnboardingProgress> {
  return apiFetch<OnboardingProgress>("/api/members/me/onboarding");
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

export async function fetchTrending(city: string, limit: number = 3) {
  const businesses = await apiFetch<ApiBusiness[]>(
    `/api/trending?city=${encodeURIComponent(city)}&limit=${limit}`,
  );
  return businesses.map(mapApiBusiness);
}

// Sprint 544: Popular search queries
export type PopularQuery = { query: string; count: number; lastSearched: number };

export async function fetchPopularQueries(city: string, limit: number = 8): Promise<PopularQuery[]> {
  return apiFetch<PopularQuery[]>(
    `/api/search/popular-queries?city=${encodeURIComponent(city)}&limit=${limit}`,
  );
}

export async function trackSearchQuery(query: string, city: string): Promise<void> {
  try {
    await apiRequest("/api/search/track", { method: "POST", body: JSON.stringify({ query, city }) });
  } catch {
    // Non-critical — tracking failure doesn't affect UX
  }
}

export async function fetchRankHistory(businessId: string, days: number = 30) {
  return apiFetch<{ date: string; rank: number; score: number }[]>(
    `/api/businesses/${encodeURIComponent(businessId)}/rank-history?days=${days}`,
  );
}

// Sprint 448: City stats for comparison
export interface CityStats {
  city: string;
  totalBusinesses: number;
  avgWeightedScore: number;
  avgRatingCount: number;
  avgWouldReturnPct: number;
  recentRatingsCount: number;
  dimensionAvgs: Record<string, number>;
}

export async function fetchCityStats(city: string): Promise<CityStats> {
  return apiFetch<CityStats>(`/api/city-stats/${encodeURIComponent(city)}`);
}

export interface ApiMemberImpact {
  businessesMovedUp: number;
  businessesMovedToFirst?: number;
  topContributions: { name: string; slug: string; rankChange: number }[];
  lastRating?: { businessName: string; businessSlug: string; rawScore: string; weight: string; ratedAt: string } | null;
}

export async function fetchMemberImpact() {
  return apiFetch<ApiMemberImpact>("/api/members/me/impact");
}

// ── Sprint 192: Referral API ────────────────────────────────────

export interface ReferralEntry {
  referredId: string;
  displayName: string;
  username: string;
  status: string;
  createdAt: string;
}

export interface ReferralStats {
  code: string;
  shareUrl: string;
  totalReferred: number;
  activated: number;
  referrals: ReferralEntry[];
}

export async function fetchReferralStats(): Promise<ReferralStats> {
  return apiFetch<ReferralStats>("/api/referrals/me");
}

export async function validateReferralCode(code: string): Promise<{ valid: boolean }> {
  return apiFetch<{ valid: boolean }>(`/api/referrals/validate?code=${encodeURIComponent(code)}`);
}

export async function submitCategorySuggestion(data: {
  name: string;
  description: string;
  vertical: string;
}) {
  const url = `${getApiUrl()}/api/category-suggestions`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Failed to submit suggestion");
  }
  return res.json();
}

export interface CategorySuggestionItem {
  id: string;
  name: string;
  description: string;
  vertical: string;
  voteCount: number;
  status: string;
  createdAt: string;
}

export async function fetchCategorySuggestions() {
  return apiFetch<CategorySuggestionItem[]>("/api/category-suggestions");
}

export async function reviewCategorySuggestion(id: string, status: "approved" | "rejected") {
  const res = await fetch(`${getApiUrl()}/api/admin/category-suggestions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Review failed: ${res.status}`);
  return res.json();
}

// ── Badge Persistence ──────────────────────────────────────────

export async function awardBadgeApi(badgeId: string, badgeFamily: string) {
  const res = await fetch(`${getApiUrl()}/api/badges/award`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ badgeId, badgeFamily }),
  });
  if (!res.ok) throw new Error(`Award badge failed: ${res.status}`);
  return res.json() as Promise<{ data: any; awarded: boolean }>;
}

export async function fetchEarnedBadges() {
  return apiFetch<{ badgeIds: string[]; badgeCount: number }>("/api/badges/earned");
}

// ── Badge Leaderboard ────────────────────────────────────────

export interface BadgeLeaderboardEntry {
  memberId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  credibilityTier: string;
  badgeCount: number;
}

export async function fetchBadgeLeaderboard(limit: number = 20) {
  return apiFetch<BadgeLeaderboardEntry[]>(`/api/badges/leaderboard?limit=${limit}`);
}

// ── Sprint 524: Admin functions extracted to api-admin.ts ────
// Re-exported for backward compatibility
export {
  type AdminClaim,
  type AdminFlag,
  type ClaimDocumentMetadata,
  type ClaimEvidence,
  type DigestCopyTestStatus,
  type NotificationTemplate,
  type AdminMember,
  fetchPendingClaims,
  fetchClaimEvidence,
  fetchAllClaimEvidence,
  reviewAdminClaim,
  fetchPendingFlags,
  reviewAdminFlag,
  fetchAdminMembers,
  fetchDigestCopyTestStatus,
  seedDigestCopyTest,
  stopDigestCopyTest,
  fetchNotificationTemplates,
  fetchTemplateVariables,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
} from "./api-admin";

// Sprint 387: Rating edit/delete
export async function editRatingApi(ratingId: string, updates: {
  q1Score?: number;
  q2Score?: number;
  q3Score?: number;
  wouldReturn?: boolean;
  note?: string;
}) {
  const res = await fetch(`${getApiUrl()}/api/ratings/${ratingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Edit failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteRatingApi(ratingId: string) {
  const res = await fetch(`${getApiUrl()}/api/ratings/${ratingId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Delete failed: ${res.status}`);
  }
  return res.json();
}

// Sprint 548: Rating photo data for carousel display
export interface RatingPhotoData {
  id: string;
  ratingId: string;
  photoUrl: string;
  cdnKey: string;
  isVerifiedReceipt: boolean;
}

export async function fetchRatingPhotos(ratingId: string): Promise<RatingPhotoData[]> {
  const data = await apiFetch<{ data: RatingPhotoData[] }>(`/api/ratings/${encodeURIComponent(ratingId)}/photos`);
  return data.data || [];
}
