/**
 * Sprint 302: Cuisine Analytics — track filter usage across surfaces
 *
 * Tests:
 * 1. Analytics event types include cuisine events
 * 2. cuisineFilterSelect convenience function
 * 3. cuisineFilterClear convenience function
 * 4. dishDeepLinkTap convenience function
 * 5. Rankings page tracks cuisine select
 * 6. Rankings page tracks cuisine clear
 * 7. Discover page tracks cuisine select
 * 8. Discover page tracks cuisine clear
 * 9. Discover page tracks dish deep link tap
 * 10. Analytics events include surface parameter
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Analytics module tests ──────────────────────────────────

describe("Sprint 302 — Cuisine Analytics", () => {
  // ─── Event Type Coverage ──────────────────────────────────

  it("AnalyticsEvent type includes cuisine_filter_select", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toContain('"cuisine_filter_select"');
  });

  it("AnalyticsEvent type includes cuisine_filter_clear", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toContain('"cuisine_filter_clear"');
  });

  it("AnalyticsEvent type includes dish_deep_link_tap", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toContain('"dish_deep_link_tap"');
  });

  // ─── Convenience Functions ────────────────────────────────

  it("Analytics.cuisineFilterSelect tracks with cuisine and surface", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toContain("cuisineFilterSelect");
    // Should accept cuisine and surface params
    expect(source).toMatch(/cuisineFilterSelect.*cuisine.*surface/s);
  });

  it("Analytics.cuisineFilterClear tracks with surface", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toContain("cuisineFilterClear");
    expect(source).toMatch(/cuisineFilterClear.*surface/s);
  });

  it("Analytics.dishDeepLinkTap tracks with dish slug", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toContain("dishDeepLinkTap");
    expect(source).toMatch(/dishDeepLinkTap.*dishSlug/s);
  });

  // ─── Surface parameter validation ────────────────────────

  it("cuisineFilterSelect surface is typed to rankings | discover", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toMatch(/cuisineFilterSelect.*"rankings"\s*\|\s*"discover"/);
  });

  it("cuisineFilterClear surface is typed to rankings | discover", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toMatch(/cuisineFilterClear.*"rankings"\s*\|\s*"discover"/);
  });

  // ─── Rankings Page Integration ────────────────────────────

  it("Rankings page imports Analytics", async () => {
    const headerSource = await import("fs").then((fs) =>
      fs.readFileSync("components/leaderboard/RankingsListHeader.tsx", "utf-8")
    );
    expect(headerSource).toContain('import { Analytics }');
  });

  it("Rankings page tracks cuisine select via CuisineChipRow", async () => {
    const chipRow = await import("fs").then((fs) =>
      fs.readFileSync("components/leaderboard/CuisineChipRow.tsx", "utf-8")
    );
    expect(chipRow).toContain("Analytics.cuisineFilterSelect(cuisine, analyticsSource)");
    // index.tsx passes analyticsSource="rankings"
    const source = await import("fs").then((fs) =>
      fs.readFileSync("app/(tabs)/index.tsx", "utf-8")
    );
    expect(source).toContain('analyticsSource="rankings"');
  });

  it("Rankings page tracks cuisine clear via CuisineChipRow", async () => {
    const chipRow = await import("fs").then((fs) =>
      fs.readFileSync("components/leaderboard/CuisineChipRow.tsx", "utf-8")
    );
    expect(chipRow).toContain("Analytics.cuisineFilterClear(analyticsSource)");
  });

  // ─── Discover Page Integration ────────────────────────────

  it("Discover page tracks cuisine select from BestInSection", async () => {
    // Sprint 571: redirected to DiscoverSections
    const source = await import("fs").then((fs) =>
      fs.readFileSync("components/search/DiscoverSections.tsx", "utf-8")
    );
    expect(source).toContain("cuisineFilterSelect");
  });

  it("Discover page tracks cuisine clear from BestInSection", async () => {
    // Sprint 571: redirected to DiscoverSections
    const source = await import("fs").then((fs) =>
      fs.readFileSync("components/search/DiscoverSections.tsx", "utf-8")
    );
    expect(source).toContain("cuisineFilterClear");
  });

  it("Discover page tracks dish deep link taps", async () => {
    // Sprint 571: redirected to DiscoverSections
    const source = await import("fs").then((fs) =>
      fs.readFileSync("components/search/DiscoverSections.tsx", "utf-8")
    );
    expect(source).toContain("dishDeepLinkTap");
  });

  // ─── Event Properties ─────────────────────────────────────

  it("cuisine_filter_select event includes cuisine property", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    // The track call should include { cuisine, surface }
    expect(source).toMatch(/track\("cuisine_filter_select".*cuisine/s);
  });

  it("dish_deep_link_tap event includes dish_slug property", async () => {
    const source = await import("fs").then((fs) =>
      fs.readFileSync("lib/analytics.ts", "utf-8")
    );
    expect(source).toMatch(/track\("dish_deep_link_tap".*dish_slug/s);
  });
});
