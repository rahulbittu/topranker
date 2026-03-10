/**
 * Sprint 576: Mock data router — extracted from lib/api.ts
 *
 * Route-map pattern for mock data fallback in development.
 * Exact path matches first, then prefix matches, to prevent collisions.
 * Only active when __DEV__ is true — never serves mock data in production.
 */
import {
  MOCK_BUSINESSES, MOCK_RATINGS, MOCK_DISHES, MOCK_CHALLENGERS,
  MOCK_MEMBER_PROFILE, MOCK_MEMBER_IMPACT, MOCK_RANK_HISTORY, MOCK_CATEGORIES,
} from "@/lib/mock-data";

/** Track whether mock data has been served in this session */
let _servingMockData = false;
export function isServingMockData(): boolean { return _servingMockData; }
export function resetMockDataFlag(): void { _servingMockData = false; }
export function setServingMockData(): void { _servingMockData = true; }

/** Exact prefix routes — checked in order, most specific first */
type MockRoute = { prefix: string; handler: (path: string) => unknown };

const EXACT_ROUTES: MockRoute[] = [
  // Leaderboard sub-paths (MUST come before catch-all)
  { prefix: "/api/leaderboard/categories", handler: () => MOCK_CATEGORIES },
  { prefix: "/api/leaderboard/neighborhoods", handler: () => [...new Set(MOCK_BUSINESSES.map(b => b.neighborhood).filter(Boolean))] },
  { prefix: "/api/leaderboard/cuisines", handler: () => [...new Set(MOCK_BUSINESSES.map(b => b.cuisine).filter(Boolean))] },
  { prefix: "/api/leaderboard/dish-shortcuts", handler: () => [] },
  { prefix: "/api/leaderboard/best-in", handler: () => [] },
  // Member sub-paths (MUST come before /api/members/me catch-all)
  { prefix: "/api/members/me/impact", handler: () => MOCK_MEMBER_IMPACT },
  { prefix: "/api/members/me", handler: () => MOCK_MEMBER_PROFILE },
  // Business sub-paths (MUST come before slug catch-all)
  { prefix: "/api/businesses/search", handler: searchHandler },
  { prefix: "/api/businesses/autocomplete", handler: () => [] },
  { prefix: "/api/businesses/popular-categories", handler: () => [] },
  // Other API paths
  { prefix: "/api/trending", handler: () => MOCK_BUSINESSES.filter(b => b.rankDelta > 0).slice(0, 3) },
  { prefix: "/api/challengers", handler: () => MOCK_CHALLENGERS },
  { prefix: "/api/search/", handler: () => [] },
  { prefix: "/api/city-stats", handler: () => null },
];

function searchHandler(path: string): unknown {
  const urlParams = new URLSearchParams(path.split("?")[1] || "");
  const q = (urlParams.get("q") || "").toLowerCase().trim();
  const city = urlParams.get("city") || "";
  let results = MOCK_BUSINESSES.filter(b => b.isActive);
  if (city) results = results.filter(b => b.city.toLowerCase() === city.toLowerCase());
  if (q) {
    results = results.filter(b =>
      b.name.toLowerCase().includes(q) || (b.neighborhood || "").toLowerCase().includes(q) ||
      (b.category || "").toLowerCase().includes(q) || (b.description || "").toLowerCase().includes(q)
    );
  }
  return results.slice(0, 20);
}

/** Returns mock data for a given API path when backend is unreachable */
export function getMockData(path: string): unknown | null {
  // Check exact prefix routes first
  for (const route of EXACT_ROUTES) {
    if (path.startsWith(route.prefix)) return route.handler(path);
  }
  // Leaderboard catch-all (only base path, not sub-paths)
  if (path.startsWith("/api/leaderboard") && !path.startsWith("/api/leaderboard/")) return MOCK_BUSINESSES;
  // Rank history (embedded in business path)
  if (path.includes("/rank-history")) return MOCK_RANK_HISTORY;
  // Business slug lookup (only direct slugs, not sub-resources)
  if (path.startsWith("/api/businesses/") && !path.split("/api/businesses/")[1]?.includes("/")) {
    const slug = path.split("/api/businesses/")[1]?.split("?")[0];
    if (slug) {
      const biz = MOCK_BUSINESSES.find(b => b.slug === slug) || MOCK_BUSINESSES[0];
      return { ...biz, recentRatings: MOCK_RATINGS, dishes: MOCK_DISHES };
    }
  }
  return null;
}
