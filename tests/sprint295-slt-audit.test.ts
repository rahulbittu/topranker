/**
 * Sprint 295 — SLT + Arch Audit #41 governance tests
 *
 * Validates:
 * 1. Governance docs exist (SLT-295, ARCH-AUDIT-41, critique request)
 * 2. search.tsx under 950 LOC threshold
 * 3. badges.ts under 1000 LOC FAIL threshold
 * 4. No critical/high audit findings (codebase health checks)
 * 5. Cuisine pipeline completeness across surfaces
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 295 — Governance documents exist", () => {
  it("SLT-BACKLOG-295 meeting doc exists", () => {
    expect(fs.existsSync(path.resolve("docs/meetings/SLT-BACKLOG-295.md"))).toBe(true);
  });

  it("ARCH-AUDIT-41 audit doc exists", () => {
    expect(fs.existsSync(path.resolve("docs/audits/ARCH-AUDIT-41.md"))).toBe(true);
  });

  it("critique request for Sprint 290-294 exists", () => {
    expect(fs.existsSync(path.resolve("docs/critique/inbox/SPRINT-290-294-REQUEST.md"))).toBe(true);
  });
});

describe("Sprint 295 — LOC thresholds", () => {
  it("search.tsx is under 950 LOC threshold", () => {
    const lines = fs.readFileSync(path.resolve("app/(tabs)/search.tsx"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(950);
  });

  it("badges.ts is under 1000 LOC FAIL threshold", () => {
    const lines = fs.readFileSync(path.resolve("lib/badges.ts"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(1000);
  });

  it("index.tsx (Rankings) is under 950 LOC threshold", () => {
    const lines = fs.readFileSync(path.resolve("app/(tabs)/index.tsx"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(950);
  });

  it("routes.ts is under 700 LOC threshold", () => {
    const lines = fs.readFileSync(path.resolve("server/routes.ts"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(700);
  });
});

describe("Sprint 295 — Cuisine pipeline completeness", () => {
  it("schema has cuisine column", () => {
    const schema = fs.readFileSync(path.resolve("shared/schema.ts"), "utf-8");
    expect(schema).toMatch(/cuisine:\s*text\("cuisine"\)/);
  });

  it("leaderboard accepts cuisine filter", () => {
    const storage = fs.readFileSync(path.resolve("server/storage/businesses.ts"), "utf-8");
    expect(storage).toMatch(/getLeaderboard\([^)]*cuisine/);
  });

  it("search accepts cuisine filter", () => {
    const storage = fs.readFileSync(path.resolve("server/storage/businesses.ts"), "utf-8");
    expect(storage).toMatch(/searchBusinesses\([^)]*cuisine/);
  });

  it("BestInSection fires onCuisineChange callback", () => {
    const bestIn = fs.readFileSync(path.resolve("components/search/BestInSection.tsx"), "utf-8");
    expect(bestIn).toContain("onCuisineChange");
  });

  it("search.tsx tracks selectedCuisine and passes to API", () => {
    const search = fs.readFileSync(path.resolve("app/(tabs)/search.tsx"), "utf-8");
    expect(search).toContain("selectedCuisine");
    expect(search).toMatch(/fetchBusinessSearch\([^)]*selectedCuisine/);
  });

  it("active cuisine indicator visible in list view", () => {
    const search = fs.readFileSync(path.resolve("app/(tabs)/search.tsx"), "utf-8");
    expect(search).toContain("activeCuisineChip");
  });

  it("active cuisine indicator visible in map view", () => {
    const search = fs.readFileSync(path.resolve("app/(tabs)/search.tsx"), "utf-8");
    // Map section should reference activeCuisineRow
    const mapSection = search.slice(search.indexOf('viewMode === "map"'));
    expect(mapSection).toContain("activeCuisineRow");
  });
});

describe("Sprint 295 — Audit health checks", () => {
  it("SLT doc references 17th consecutive A-grade", () => {
    const slt = fs.readFileSync(path.resolve("docs/meetings/SLT-BACKLOG-295.md"), "utf-8");
    expect(slt).toContain("17th consecutive A-range");
  });

  it("audit doc has 0 critical and 0 high findings", () => {
    const audit = fs.readFileSync(path.resolve("docs/audits/ARCH-AUDIT-41.md"), "utf-8");
    expect(audit).toContain("Critical (P0) — 0 issues");
    expect(audit).toContain("High (P1) — 0 issues");
  });
});
