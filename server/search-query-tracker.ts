/**
 * Sprint 544: Search Query Tracker — in-memory popularity tracking
 *
 * Tracks search query frequency per city for popular searches display.
 * In-memory with periodic decay — no DB table needed (schema at 996/1000).
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";

const queryLog = log.tag("SearchQueryTracker");

interface QueryEntry {
  query: string;
  count: number;
  lastSearched: number;
  city: string;
}

// In-memory storage: Map<city, Map<normalizedQuery, QueryEntry>>
const queryIndex = new Map<string, Map<string, QueryEntry>>();

const MAX_ENTRIES_PER_CITY = 500;
const DECAY_INTERVAL_MS = 3600000; // 1 hour
const DECAY_FACTOR = 0.9; // Reduce counts by 10% each hour
const MIN_QUERY_LENGTH = 2;

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Record a search query. Called when a user performs a full search.
 */
export function trackSearchQuery(query: string, city: string): void {
  if (!query || query.length < MIN_QUERY_LENGTH) return;
  const normalized = normalizeQuery(query);
  if (normalized.length < MIN_QUERY_LENGTH) return;

  if (!queryIndex.has(city)) {
    queryIndex.set(city, new Map());
  }
  const cityMap = queryIndex.get(city)!;

  const existing = cityMap.get(normalized);
  if (existing) {
    existing.count += 1;
    existing.lastSearched = Date.now();
  } else {
    // Evict least popular if at capacity
    if (cityMap.size >= MAX_ENTRIES_PER_CITY) {
      let minKey = "";
      let minCount = Infinity;
      for (const [key, entry] of cityMap) {
        if (entry.count < minCount) {
          minCount = entry.count;
          minKey = key;
        }
      }
      if (minKey) cityMap.delete(minKey);
    }

    cityMap.set(normalized, {
      query: normalized,
      count: 1,
      lastSearched: Date.now(),
      city,
    });
  }
}

/**
 * Get top N popular search queries for a city.
 */
export function getPopularQueries(city: string, limit: number = 8): {
  query: string;
  count: number;
  lastSearched: number;
}[] {
  const cityMap = queryIndex.get(city);
  if (!cityMap || cityMap.size === 0) return [];

  const entries = Array.from(cityMap.values())
    .filter(e => e.count >= 2) // Only show queries searched 2+ times
    .sort((a, b) => b.count - a.count || b.lastSearched - a.lastSearched)
    .slice(0, limit);

  return entries.map(e => ({
    query: e.query,
    count: e.count,
    lastSearched: e.lastSearched,
  }));
}

/**
 * Get query stats for admin dashboard.
 */
export function getQueryTrackerStats(): {
  totalCities: number;
  totalQueries: number;
  topCities: { city: string; queryCount: number }[];
} {
  const topCities = Array.from(queryIndex.entries())
    .map(([city, map]) => ({ city, queryCount: map.size }))
    .sort((a, b) => b.queryCount - a.queryCount);

  return {
    totalCities: queryIndex.size,
    totalQueries: topCities.reduce((sum, c) => sum + c.queryCount, 0),
    topCities,
  };
}

/**
 * Apply time decay to all query counts. Called periodically.
 */
export function applyQueryDecay(): void {
  for (const [city, cityMap] of queryIndex) {
    for (const [key, entry] of cityMap) {
      entry.count = Math.floor(entry.count * DECAY_FACTOR);
      if (entry.count <= 0) {
        cityMap.delete(key);
      }
    }
    if (cityMap.size === 0) {
      queryIndex.delete(city);
    }
  }
  queryLog.debug("Query decay applied");
}

/**
 * Clear all tracking data (for testing).
 */
export function clearQueryTracker(): void {
  queryIndex.clear();
}

// Apply decay every hour
setInterval(applyQueryDecay, DECAY_INTERVAL_MS);
