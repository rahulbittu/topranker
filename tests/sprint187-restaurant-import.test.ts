/**
 * Sprint 187 — Restaurant Onboarding Automation
 *
 * Validates:
 * 1. Google Places nearby search function
 * 2. Category normalization
 * 3. Bulk import storage function
 * 4. Import statistics
 * 5. Admin import endpoint
 * 6. Admin import stats endpoint
 * 7. Auto-photo fetching on import
 * 8. Deduplication logic
 * 9. Slug generation
 * 10. Storage barrel exports
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Google Places nearby search
// ---------------------------------------------------------------------------
describe("Google Places — searchNearbyRestaurants", () => {
  const src = readFile("server/google-places.ts");

  it("exports searchNearbyRestaurants function", () => {
    expect(src).toContain("export async function searchNearbyRestaurants");
  });

  it("uses Text Search API", () => {
    expect(src).toContain("places:searchText");
  });

  it("requests location, rating, priceLevel, types", () => {
    expect(src).toContain("places.location");
    expect(src).toContain("places.rating");
    expect(src).toContain("places.priceLevel");
    expect(src).toContain("places.types");
  });

  it("limits to 20 results max", () => {
    expect(src).toContain("Math.min(maxResults, 20)");
  });

  it("maps price levels to dollar signs", () => {
    expect(src).toContain("PRICE_LEVEL_MODERATE");
    expect(src).toContain("PRICE_LEVEL_EXPENSIVE");
  });

  it("handles API errors gracefully", () => {
    expect(src).toContain("Nearby search failed");
    expect(src).toContain("return []");
  });

  it("has 15-second timeout", () => {
    expect(src).toContain("15000");
  });

  it("maps category to search query", () => {
    expect(src).toContain('"restaurants"');
    expect(src).toContain('"cafes"');
    expect(src).toContain('"bars"');
    expect(src).toContain('"bakeries"');
  });
});

// ---------------------------------------------------------------------------
// 2. Category normalization
// ---------------------------------------------------------------------------
describe("Google Places — normalizeCategory", () => {
  const src = readFile("server/google-places.ts");

  it("exports normalizeCategory function", () => {
    expect(src).toContain("export function normalizeCategory");
  });

  it("maps cafe types", () => {
    expect(src).toContain('"cafe"');
    expect(src).toContain('"coffee_shop"');
  });

  it("maps bar types", () => {
    expect(src).toContain('"bar"');
    expect(src).toContain('"night_club"');
  });

  it("maps bakery type", () => {
    expect(src).toContain('"bakery"');
  });

  it("defaults to restaurant", () => {
    expect(src).toContain('return "restaurant"');
  });
});

// ---------------------------------------------------------------------------
// 3. Bulk import storage function
// ---------------------------------------------------------------------------
describe("Bulk import — storage", () => {
  const src = readFile("server/storage/businesses.ts");

  it("exports bulkImportBusinesses function", () => {
    expect(src).toContain("export async function bulkImportBusinesses");
  });

  it("accepts array of places", () => {
    expect(src).toContain("places: Array<");
  });

  it("returns imported and skipped counts", () => {
    expect(src).toContain("imported: number; skipped: number");
  });

  it("checks for duplicate googlePlaceId", () => {
    expect(src).toContain("eq(businesses.googlePlaceId, place.placeId)");
  });

  it("generates URL-safe slug", () => {
    expect(src).toContain("generateSlug(place.name, place.city)");
  });

  it("handles slug collisions", () => {
    expect(src).toContain("Date.now().toString(36)");
  });

  it("extracts neighborhood from address", () => {
    expect(src).toContain("addressParts");
    expect(src).toContain("neighborhood");
  });

  it("sets dataSource to google_bulk_import", () => {
    expect(src).toContain('"google_bulk_import"');
  });

  it("stores googlePlaceId and googleRating", () => {
    expect(src).toContain("googlePlaceId: place.placeId");
    expect(src).toContain("googleRating:");
  });

  it("catches and logs individual insert errors", () => {
    expect(src).toContain("catch (err");
    expect(src).toContain("error:");
  });
});

// ---------------------------------------------------------------------------
// 4. Import statistics
// ---------------------------------------------------------------------------
describe("Import stats — storage", () => {
  const src = readFile("server/storage/businesses.ts");

  it("exports getImportStats function", () => {
    expect(src).toContain("export async function getImportStats");
  });

  it("groups by city and dataSource", () => {
    expect(src).toContain("businesses.city");
    expect(src).toContain("businesses.dataSource");
    expect(src).toContain("count(businesses.id)");
  });
});

// ---------------------------------------------------------------------------
// 5. Admin import endpoint
// ---------------------------------------------------------------------------
describe("Admin — import-restaurants endpoint", () => {
  const src = readFile("server/routes-admin.ts");

  it("has POST /api/admin/import-restaurants", () => {
    expect(src).toContain('"/api/admin/import-restaurants"');
  });

  it("requires admin access", () => {
    expect(src).toContain("requireAdmin");
  });

  it("validates city is required", () => {
    expect(src).toContain("City is required");
  });

  it("calls searchNearbyRestaurants", () => {
    expect(src).toContain("searchNearbyRestaurants");
  });

  it("calls normalizeCategory", () => {
    expect(src).toContain("normalizeCategory");
  });

  it("calls bulkImportBusinesses", () => {
    expect(src).toContain("bulkImportBusinesses");
  });

  it("returns import result counts", () => {
    expect(src).toContain("result.imported");
    expect(src).toContain("result.skipped");
  });
});

// ---------------------------------------------------------------------------
// 6. Admin import stats endpoint
// ---------------------------------------------------------------------------
describe("Admin — import-stats endpoint", () => {
  const src = readFile("server/routes-admin.ts");

  it("has GET /api/admin/import-stats", () => {
    expect(src).toContain('"/api/admin/import-stats"');
  });

  it("calls getImportStats", () => {
    expect(src).toContain("getImportStats");
  });
});

// ---------------------------------------------------------------------------
// 7. Auto-photo fetching on import
// ---------------------------------------------------------------------------
describe("Import — auto-photo fetching", () => {
  const src = readFile("server/routes-admin.ts");

  it("fetches photos for newly imported businesses", () => {
    expect(src).toContain("fetchAndStorePhotos");
    expect(src).toContain("photosFetched");
  });

  it("only fetches photos for imported (not skipped) businesses", () => {
    expect(src).toContain('r.status === "imported"');
  });

  it("returns photo fetch count in response", () => {
    expect(src).toContain("photosFetched");
  });
});

// ---------------------------------------------------------------------------
// 8. Deduplication logic
// ---------------------------------------------------------------------------
describe("Import — deduplication", () => {
  const src = readFile("server/storage/businesses.ts");

  it("checks googlePlaceId before inserting", () => {
    expect(src).toContain("eq(businesses.googlePlaceId, place.placeId)");
  });

  it("marks duplicates as skipped", () => {
    expect(src).toContain("skipped_duplicate");
  });

  it("increments skipped counter", () => {
    expect(src).toContain("skipped++");
  });
});

// ---------------------------------------------------------------------------
// 9. Slug generation
// ---------------------------------------------------------------------------
describe("Slug generation — generateSlug", () => {
  const src = readFile("server/storage/businesses.ts");

  it("has generateSlug function", () => {
    expect(src).toContain("function generateSlug");
  });

  it("lowercases and removes special characters", () => {
    expect(src).toContain(".toLowerCase()");
    expect(src).toContain('/[^a-z0-9]+/g, "-"');
  });

  it("combines name and city", () => {
    expect(src).toContain("${name}-${city}");
  });

  it("limits slug length", () => {
    expect(src).toContain(".slice(0, 80)");
  });
});

// ---------------------------------------------------------------------------
// 10. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage barrel — Sprint 187 exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports bulkImportBusinesses", () => {
    expect(indexSrc).toContain("bulkImportBusinesses");
  });

  it("exports getImportStats", () => {
    expect(indexSrc).toContain("getImportStats");
  });
});
