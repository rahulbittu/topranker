/**
 * Sprint 451: Search filter URL param sync
 * Encodes/decodes search filter state to/from URL query params.
 * Enables shareable filtered views like "?dietary=vegetarian,halal&hours=openLate&cuisine=indian"
 */

import type { DietaryTag, DistanceOption, HoursFilter } from "@/components/search/DiscoverFilters";

export interface SearchFilterState {
  query?: string;
  cuisine?: string;
  dietary?: DietaryTag[];
  distance?: DistanceOption;
  hours?: HoursFilter[];
  price?: string;
  sort?: "ranked" | "rated" | "trending" | "relevant";
  filter?: string; // "All" | "Top 10" | etc.
}

/**
 * Encode search filter state into URL query params object.
 * Only includes non-default values to keep URLs clean.
 */
export function encodeSearchParams(state: SearchFilterState): Record<string, string> {
  const params: Record<string, string> = {};

  if (state.query && state.query.trim().length > 0) {
    params.q = state.query.trim();
  }
  if (state.cuisine) {
    params.cuisine = state.cuisine;
  }
  if (state.dietary && state.dietary.length > 0) {
    params.dietary = state.dietary.join(",");
  }
  if (state.distance && state.distance !== null) {
    params.distance = String(state.distance);
  }
  if (state.hours && state.hours.length > 0) {
    params.hours = state.hours.join(",");
  }
  if (state.price) {
    params.price = state.price;
  }
  if (state.sort && state.sort !== "ranked") {
    params.sort = state.sort;
  }
  if (state.filter && state.filter !== "All") {
    params.filter = state.filter;
  }

  return params;
}

/**
 * Decode URL query params into search filter state.
 * Returns partial state — only includes params that were present in the URL.
 */
export function decodeSearchParams(params: Record<string, string | string[] | undefined>): SearchFilterState {
  const state: SearchFilterState = {};
  const getString = (key: string): string | undefined => {
    const val = params[key];
    return typeof val === "string" ? val : Array.isArray(val) ? val[0] : undefined;
  };

  const q = getString("q");
  if (q) state.query = q;

  const cuisine = getString("cuisine");
  if (cuisine) state.cuisine = cuisine;

  const dietary = getString("dietary");
  if (dietary) {
    const validTags: DietaryTag[] = ["vegetarian", "vegan", "halal", "gluten_free"];
    state.dietary = dietary.split(",").filter(t => validTags.includes(t as DietaryTag)) as DietaryTag[];
  }

  const distance = getString("distance");
  if (distance) {
    const d = parseInt(distance, 10);
    if ([1, 3, 5, 10].includes(d)) state.distance = d as DistanceOption;
  }

  const hours = getString("hours");
  if (hours) {
    const validHours: HoursFilter[] = ["openNow", "openLate", "openWeekends"];
    state.hours = hours.split(",").filter(h => validHours.includes(h as HoursFilter)) as HoursFilter[];
  }

  const price = getString("price");
  if (price && ["$", "$$", "$$$", "$$$$"].includes(price)) {
    state.price = price;
  }

  const sort = getString("sort");
  if (sort && ["ranked", "rated", "trending", "relevant"].includes(sort)) {
    state.sort = sort as SearchFilterState["sort"];
  }

  const filter = getString("filter");
  if (filter) state.filter = filter;

  return state;
}

/**
 * Build a shareable search URL from filter state.
 */
export function buildSearchUrl(baseUrl: string, state: SearchFilterState): string {
  const params = encodeSearchParams(state);
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

/**
 * Check if two filter states are equal (for memoization).
 */
export function filterStatesEqual(a: SearchFilterState, b: SearchFilterState): boolean {
  return JSON.stringify(encodeSearchParams(a)) === JSON.stringify(encodeSearchParams(b));
}
