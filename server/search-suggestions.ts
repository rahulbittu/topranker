/**
 * Search Suggestions Module — Sprint 256
 *
 * Provides autocomplete/typeahead search suggestions per city.
 * Pre-builds an in-memory index of business names, neighborhoods,
 * and category suggestions for fast prefix/substring matching.
 *
 * Owner: Cole Anderson (Search Infrastructure)
 */

import { log } from "./logger";

const suggestLog = log.tag("SearchSuggestions");

export interface SearchSuggestion {
  text: string;
  type: "business" | "category" | "neighborhood" | "cuisine";
  city: string;
  score: number;
}

// Pre-built suggestion index per city
const suggestionIndex = new Map<string, SearchSuggestion[]>();

export const CATEGORY_SUGGESTIONS = [
  "restaurant", "cafe", "bar", "bakery", "bbq", "pizza", "seafood",
  "fine_dining", "food_truck", "deli", "street_food", "fast_food",
];

export function buildSuggestionIndex(city: string, businesses: { name: string; category: string; neighborhood: string }[]): void {
  const suggestions: SearchSuggestion[] = [];
  for (const biz of businesses) {
    suggestions.push({ text: biz.name, type: "business", city, score: 10 });
    if (biz.neighborhood && !suggestions.some(s => s.text === biz.neighborhood && s.type === "neighborhood")) {
      suggestions.push({ text: biz.neighborhood, type: "neighborhood", city, score: 5 });
    }
  }
  for (const cat of CATEGORY_SUGGESTIONS) {
    suggestions.push({ text: cat, type: "category", city, score: 3 });
  }
  suggestionIndex.set(city, suggestions);
  suggestLog.info(`Index built for ${city}: ${suggestions.length} suggestions`);
}

export function getSuggestions(query: string, city: string, limit?: number): SearchSuggestion[] {
  const index = suggestionIndex.get(city) || [];
  const q = query.toLowerCase();
  return index
    .filter(s => s.text.toLowerCase().includes(q))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 10);
}

export function getPopularSearches(city: string, limit?: number): SearchSuggestion[] {
  const index = suggestionIndex.get(city) || [];
  return index.filter(s => s.type === "business").sort((a, b) => b.score - a.score).slice(0, limit || 5);
}

export function getCitySuggestionCount(city: string): number {
  return (suggestionIndex.get(city) || []).length;
}

export function getAllIndexedCities(): string[] {
  return Array.from(suggestionIndex.keys());
}

export function clearSuggestionIndex(city?: string): void {
  if (city) suggestionIndex.delete(city);
  else suggestionIndex.clear();
}

// Sprint 614: Periodic refresh — rebuilds suggestion index from DB every 30 minutes
const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
let refreshTimer: ReturnType<typeof setInterval> | null = null;

export async function refreshSuggestionsFromDb(): Promise<void> {
  try {
    const { db } = await import("./db");
    const { businesses } = await import("@shared/schema");
    const { sql } = await import("drizzle-orm");

    // Get distinct cities
    const cityRows = await db.selectDistinct({ city: businesses.city }).from(businesses);
    const cities = cityRows.map(r => r.city).filter(Boolean);

    for (const city of cities) {
      const rows = await db.select({
        name: businesses.name,
        category: businesses.category,
        neighborhood: businesses.neighborhood,
      }).from(businesses).where(sql`${businesses.city} = ${city}`);

      buildSuggestionIndex(city, rows.map(r => ({
        name: r.name,
        category: r.category,
        neighborhood: r.neighborhood || "",
      })));
    }

    suggestLog.info(`Refreshed suggestions for ${cities.length} cities`);
  } catch (err) {
    suggestLog.error("Failed to refresh suggestions:", err);
  }
}

export function startSuggestionRefresh(): void {
  // Initial build
  refreshSuggestionsFromDb();
  // Periodic refresh
  refreshTimer = setInterval(refreshSuggestionsFromDb, REFRESH_INTERVAL_MS);
  suggestLog.info(`Suggestion refresh scheduled every ${REFRESH_INTERVAL_MS / 60000} minutes`);
}

export function stopSuggestionRefresh(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
