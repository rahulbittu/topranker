/**
 * Sprint 469: Search Filter Presets
 *
 * Predefined filter combinations that users can quickly apply.
 * Saved to AsyncStorage for persistence across sessions.
 * Built on SearchFilterState from search-url-params.ts.
 */

import type { SearchFilterState } from "@/lib/search-url-params";

export interface FilterPreset {
  id: string;
  name: string;
  icon: string;
  filters: SearchFilterState;
  isBuiltIn: boolean; // Sprint 469: built-in vs user-created
}

// Built-in presets — common search scenarios
export const BUILT_IN_PRESETS: FilterPreset[] = [
  {
    id: "quick-lunch",
    name: "Quick Lunch",
    icon: "time-outline",
    filters: { hours: ["openNow" as any], sort: "ranked" },
    isBuiltIn: true,
  },
  {
    id: "date-night",
    name: "Date Night",
    icon: "heart-outline",
    filters: { hours: ["openLate" as any], sort: "ranked" },
    isBuiltIn: true,
  },
  {
    id: "vegetarian",
    name: "Vegetarian",
    icon: "leaf-outline",
    filters: { dietary: ["vegetarian" as any], sort: "ranked" },
    isBuiltIn: true,
  },
  {
    id: "top-rated",
    name: "Top Rated",
    icon: "trophy-outline",
    filters: { filter: "Top 10", sort: "ranked" },
    isBuiltIn: true,
  },
  {
    id: "halal",
    name: "Halal",
    icon: "checkmark-circle-outline",
    filters: { dietary: ["halal" as any], sort: "ranked" },
    isBuiltIn: true,
  },
];

const STORAGE_KEY = "topranker:filter-presets";

export function getBuiltInPresets(): FilterPreset[] {
  return BUILT_IN_PRESETS;
}

export function createCustomPreset(name: string, icon: string, filters: SearchFilterState): FilterPreset {
  return {
    id: `custom-${Date.now()}`,
    name,
    icon,
    filters,
    isBuiltIn: false,
  };
}

export function serializePresets(presets: FilterPreset[]): string {
  return JSON.stringify(presets.filter(p => !p.isBuiltIn));
}

export function deserializePresets(json: string): FilterPreset[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: any) => ({
      id: p.id || `custom-${Date.now()}`,
      name: p.name || "Untitled",
      icon: p.icon || "bookmark-outline",
      filters: p.filters || {},
      isBuiltIn: false,
    }));
  } catch {
    return [];
  }
}

export function getAllPresets(customJson?: string): FilterPreset[] {
  const custom = customJson ? deserializePresets(customJson) : [];
  return [...BUILT_IN_PRESETS, ...custom];
}

export { STORAGE_KEY as PRESETS_STORAGE_KEY };
