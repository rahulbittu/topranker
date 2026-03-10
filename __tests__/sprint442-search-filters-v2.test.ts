/**
 * Sprint 442 — Search Filters v2: Dietary Tags + Distance
 *
 * Validates:
 * 1. Schema: dietaryTags field on businesses
 * 2. DiscoverFilters: DietaryTagChips + DistanceChips components
 * 3. Server: dietary + distance query params in search endpoint
 * 4. API client: fetchBusinessSearch extended params
 * 5. Search screen: wiring of new filters
 * 6. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Schema — dietaryTags field
// ---------------------------------------------------------------------------
describe("Schema — dietaryTags field", () => {
  const src = readFile("shared/schema.ts");

  it("businesses table has dietaryTags jsonb column", () => {
    expect(src).toContain("dietary_tags");
    expect(src).toContain("dietaryTags");
  });

  it("defaults to empty array", () => {
    // Check the dietaryTags line specifically
    const line = src.split("\n").find(l => l.includes("dietary_tags"));
    expect(line).toContain("jsonb");
    expect(line).toContain("'[]'::jsonb");
  });

  it("comments reference Sprint 442", () => {
    const line = src.split("\n").find(l => l.includes("dietary_tags"));
    expect(line).toContain("Sprint 442");
  });
});

// ---------------------------------------------------------------------------
// 2. DiscoverFilters — new components
// ---------------------------------------------------------------------------
describe("DiscoverFilters — DietaryTagChips", () => {
  // Sprint 456: Extracted to FilterChipsExtended.tsx
  const src = readFile("components/search/FilterChipsExtended.tsx");

  it("exports DietaryTagChips component", () => {
    expect(src).toContain("export const DietaryTagChips");
  });

  it("exports DietaryTag type", () => {
    expect(src).toContain("export type DietaryTag");
  });

  it("has 4 dietary tags: vegetarian, vegan, halal, gluten_free", () => {
    expect(src).toContain('"vegetarian"');
    expect(src).toContain('"vegan"');
    expect(src).toContain('"halal"');
    expect(src).toContain('"gluten_free"');
  });

  it("each tag has an icon", () => {
    expect(src).toContain("leaf-outline");
    expect(src).toContain("nutrition-outline");
    expect(src).toContain("checkmark-circle-outline");
    expect(src).toContain("ban-outline");
  });

  it("uses haptic feedback", () => {
    // Count selectionAsync calls — should include dietary tags
    expect(src).toContain("Haptics.selectionAsync");
  });

  it("has accessibility labels", () => {
    expect(src).toContain("accessibilityLabel");
    expect(src).toContain("accessibilityState");
  });

  it("exports getDietaryTags utility", () => {
    expect(src).toContain("export function getDietaryTags");
  });
});

describe("DiscoverFilters — DistanceChips", () => {
  // Sprint 456: Extracted to FilterChipsExtended.tsx
  const src = readFile("components/search/FilterChipsExtended.tsx");

  it("exports DistanceChips component", () => {
    expect(src).toContain("export const DistanceChips");
  });

  it("exports DistanceOption type", () => {
    expect(src).toContain("export type DistanceOption");
  });

  it("has distance options: 1, 3, 5, 10 km", () => {
    expect(src).toContain('"1 km"');
    expect(src).toContain('"3 km"');
    expect(src).toContain('"5 km"');
    expect(src).toContain('"10 km"');
  });

  it("hides when no location available", () => {
    expect(src).toContain("if (!hasLocation) return null");
  });

  it("has location icon", () => {
    expect(src).toContain("location-outline");
  });

  it("exports getDistanceOptions utility", () => {
    expect(src).toContain("export function getDistanceOptions");
  });
});

// ---------------------------------------------------------------------------
// 3. Server — search endpoint dietary + distance params
// ---------------------------------------------------------------------------
describe("Server search endpoint — dietary + distance", () => {
  const src = readFile("server/routes-businesses.ts");
  // Sprint 476: Processing logic extracted to search-result-processor.ts
  const processorSrc = readFile("server/search-result-processor.ts");

  it("parses dietary query param", () => {
    expect(src).toContain("req.query.dietary");
    expect(src).toContain("dietaryTags");
  });

  it("splits dietary tags by comma", () => {
    expect(src).toContain('.split(",")');
  });

  it("parses lat/lng query params", () => {
    expect(src).toContain("req.query.lat");
    expect(src).toContain("req.query.lng");
    expect(src).toContain("parseFloat");
  });

  it("parses maxDistance param", () => {
    expect(src).toContain("req.query.maxDistance");
    expect(src).toContain("maxDistanceKm");
  });

  it("has haversineKm function", () => {
    expect(processorSrc).toContain("function haversineKm");
    expect(processorSrc).toContain("6371"); // Earth radius
  });

  it("computes distanceKm in response", () => {
    expect(processorSrc).toContain("distanceKm");
    expect(processorSrc).toContain("haversineKm(opts.userLat");
  });

  it("filters by dietary tags (ALL must match)", () => {
    expect(processorSrc).toContain("dietaryTags.every(tag => bizTags.includes(tag))");
  });

  it("filters by max distance", () => {
    expect(processorSrc).toContain("b.distanceKm != null && b.distanceKm <= opts.maxDistanceKm!");
  });

  it("comments reference Sprint 442", () => {
    expect(src).toContain("Sprint 442");
  });
});

// ---------------------------------------------------------------------------
// 4. API client — extended fetchBusinessSearch
// ---------------------------------------------------------------------------
describe("API client — fetchBusinessSearch opts", () => {
  const src = readFile("lib/api.ts");

  it("fetchBusinessSearch accepts opts parameter", () => {
    expect(src).toContain("opts?:");
    expect(src).toContain("dietary?:");
  });

  it("passes dietary param to URL", () => {
    expect(src).toContain("&dietary=");
    expect(src).toContain("opts.dietary.join");
  });

  it("passes lat/lng params to URL", () => {
    expect(src).toContain("&lat=");
    expect(src).toContain("&lng=");
  });

  it("passes maxDistance param to URL", () => {
    expect(src).toContain("&maxDistance=");
  });

  it("comments reference Sprint 442", () => {
    expect(src).toContain("Sprint 442");
  });
});

// ---------------------------------------------------------------------------
// 5. Search screen — wiring
// ---------------------------------------------------------------------------
describe("Search screen — filter wiring", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports DietaryTagChips and DistanceChips", () => {
    expect(src).toContain("DietaryTagChips");
    expect(src).toContain("DistanceChips");
  });

  it("imports DietaryTag and DistanceOption types", () => {
    expect(src).toContain("DietaryTag");
    expect(src).toContain("DistanceOption");
  });

  it("has dietaryTags state", () => {
    expect(src).toContain("useState<DietaryTag[]>([])");
  });

  it("has distanceFilter state", () => {
    expect(src).toContain("useState<DistanceOption>(null)");
  });

  it("renders DietaryTagChips with toggle handler", () => {
    expect(src).toContain("<DietaryTagChips");
    expect(src).toContain("onTagToggle");
  });

  it("renders DistanceChips with location awareness", () => {
    expect(src).toContain("<DistanceChips");
    expect(src).toContain("hasLocation={!!userLocation}");
  });

  it("includes dietary and distance in query key", () => {
    expect(src).toContain("dietaryTags, distanceFilter");
  });

  it("passes searchOpts to fetchBusinessSearch", () => {
    expect(src).toContain("searchOpts");
  });
});

// ---------------------------------------------------------------------------
// 6. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 442 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-442-SEARCH-FILTERS-V2.md");
    expect(src).toContain("Sprint 442");
    expect(src).toContain("Search Filters");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-442-SEARCH-FILTERS-V2.md");
    expect(src).toContain("Retro 442");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-442-SEARCH-FILTERS-V2.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 443");
  });
});
