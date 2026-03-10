/**
 * Sprint 291 — Search cuisine filter tests
 *
 * Validates:
 * 1. searchBusinesses() accepts cuisine parameter and includes it in WHERE clause
 * 2. searchBusinesses() LIKE search matches cuisine field
 * 3. autocompleteBusinesses() searches cuisine field
 * 4. /api/businesses/search route accepts ?cuisine= query param
 * 5. fetchBusinessSearch() client API passes cuisine to URL
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── Storage Layer ──────────────────────────────────────────

describe("Sprint 291 — searchBusinesses cuisine filter", () => {
  const storageSrc = fs.readFileSync(
    path.resolve("server/storage/businesses.ts"), "utf-8",
  );

  it("searchBusinesses accepts cuisine parameter", () => {
    // Function signature includes cuisine?: string
    expect(storageSrc).toMatch(/searchBusinesses\([^)]*cuisine\??: string/);
  });

  it("searchBusinesses filters by cuisine when provided", () => {
    // eq(businesses.cuisine, cuisine) in WHERE clause
    expect(storageSrc).toMatch(/cuisine\s*\?\s*\[eq\(businesses\.cuisine,\s*cuisine\)\]/);
  });

  it("searchBusinesses includes cuisine in LIKE search", () => {
    // COALESCE(businesses.cuisine, '') like ${q}
    expect(storageSrc).toMatch(/COALESCE\(\$\{businesses\.cuisine\},\s*''\)\)\s*like/);
  });

  it("searchBusinesses sanitizes query input", () => {
    expect(storageSrc).toMatch(/replace\(\/\[%_\\\\]\/g/);
  });

  it("searchBusinesses limits query to 100 chars", () => {
    expect(storageSrc).toMatch(/query\.slice\(0,\s*100\)/);
  });
});

// ── Autocomplete ──────────────────────────────────────────

describe("Sprint 291 — autocompleteBusinesses cuisine search", () => {
  const storageSrc = fs.readFileSync(
    path.resolve("server/storage/businesses.ts"), "utf-8",
  );

  it("autocomplete LIKE query includes cuisine field", () => {
    // The autocomplete function's SQL should search cuisine
    const autocompleteSection = storageSrc.slice(
      storageSrc.indexOf("autocompleteBusinesses"),
    );
    expect(autocompleteSection).toContain("COALESCE(${businesses.cuisine}");
  });

  it("autocomplete returns id, name, slug, category, neighborhood", () => {
    const autocompleteSection = storageSrc.slice(
      storageSrc.indexOf("autocompleteBusinesses"),
      storageSrc.indexOf("autocompleteBusinesses") + 800,
    );
    expect(autocompleteSection).toContain("id: businesses.id");
    expect(autocompleteSection).toContain("name: businesses.name");
    expect(autocompleteSection).toContain("slug: businesses.slug");
    expect(autocompleteSection).toContain("category: businesses.category");
    expect(autocompleteSection).toContain("neighborhood: businesses.neighborhood");
  });
});

// ── Route Layer ──────────────────────────────────────────

describe("Sprint 291 — /api/businesses/search route cuisine param", () => {
  const routeSrc = fs.readFileSync(
    path.resolve("server/routes-businesses.ts"), "utf-8",
  );

  it("search route extracts cuisine from query params", () => {
    expect(routeSrc).toMatch(/cuisine\s*=\s*sanitizeString\(req\.query\.cuisine/);
  });

  it("search route passes cuisine to searchBusinesses", () => {
    expect(routeSrc).toMatch(/searchBusinesses\(query,\s*city,\s*category,\s*\d+,\s*cuisine\)/);
  });

  it("search route sanitizes cuisine to max 50 chars", () => {
    expect(routeSrc).toMatch(/sanitizeString\(req\.query\.cuisine,\s*50\)/);
  });
});

// ── Client API ──────────────────────────────────────────

describe("Sprint 291 — fetchBusinessSearch client API cuisine", () => {
  const apiSrc = fs.readFileSync(
    path.resolve("lib/api.ts"), "utf-8",
  );

  it("fetchBusinessSearch accepts cuisine parameter", () => {
    expect(apiSrc).toMatch(/fetchBusinessSearch\([^)]*cuisine\??: string/);
  });

  it("fetchBusinessSearch appends cuisine to URL when provided", () => {
    expect(apiSrc).toContain("&cuisine=${encodeURIComponent(cuisine)}");
  });

  it("ApiBusiness interface includes cuisine field", () => {
    expect(apiSrc).toMatch(/cuisine:\s*string\s*\|\s*null/);
  });
});

// ── Integration: full stack wiring ──────────────────────

describe("Sprint 291 — full-stack cuisine search wiring", () => {
  it("storage, route, and API all support cuisine parameter", () => {
    const storage = fs.readFileSync(path.resolve("server/storage/businesses.ts"), "utf-8");
    const route = fs.readFileSync(path.resolve("server/routes-businesses.ts"), "utf-8");
    const api = fs.readFileSync(path.resolve("lib/api.ts"), "utf-8");

    // Storage layer
    expect(storage).toMatch(/searchBusinesses\([^)]*cuisine/);
    // Route layer
    expect(route).toContain("cuisine");
    // Client API
    expect(api).toMatch(/fetchBusinessSearch\([^)]*cuisine/);
  });

  it("cuisine search is case-insensitive via lower()", () => {
    const storage = fs.readFileSync(path.resolve("server/storage/businesses.ts"), "utf-8");
    // LIKE search uses lower() on cuisine COALESCE
    expect(storage).toMatch(/lower\(COALESCE\(\$\{businesses\.cuisine\}/);
  });
});
