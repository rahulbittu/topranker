/**
 * Sprint 300 — SLT + Arch Audit #42 governance tests
 *
 * Validates:
 * 1. Governance docs exist (SLT-300, ARCH-AUDIT-42, critique request)
 * 2. LOC thresholds maintained
 * 3. badges.ts extraction verified
 * 4. Cuisine pipeline completeness
 * 5. Seed data validation
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 300 — Governance documents exist", () => {
  it("SLT-BACKLOG-300 meeting doc exists", () => {
    expect(fs.existsSync(path.resolve("docs/meetings/SLT-BACKLOG-300.md"))).toBe(true);
  });

  it("ARCH-AUDIT-42 audit doc exists", () => {
    expect(fs.existsSync(path.resolve("docs/audits/ARCH-AUDIT-42.md"))).toBe(true);
  });

  it("critique request for Sprint 295-299 exists", () => {
    expect(fs.existsSync(path.resolve("docs/critique/inbox/SPRINT-295-299-REQUEST.md"))).toBe(true);
  });
});

describe("Sprint 300 — LOC thresholds", () => {
  it("search.tsx is under 950 LOC threshold", () => {
    const lines = fs.readFileSync(path.resolve("app/(tabs)/search.tsx"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(950);
  });

  it("index.tsx is under 950 LOC threshold", () => {
    const lines = fs.readFileSync(path.resolve("app/(tabs)/index.tsx"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(950);
  });

  it("badges.ts is under 300 LOC (was 886)", () => {
    const lines = fs.readFileSync(path.resolve("lib/badges.ts"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(300);
  });

  it("badge-definitions.ts exists and has data", () => {
    const lines = fs.readFileSync(path.resolve("lib/badge-definitions.ts"), "utf-8").split("\n").length;
    expect(lines).toBeGreaterThan(600);
  });
});

describe("Sprint 300 — Cuisine pipeline health", () => {
  it("10 distinct cuisines in seed data", () => {
    const seedSrc = fs.readFileSync(path.resolve("server/seed.ts"), "utf-8");
    const cuisines = new Set(
      (seedSrc.match(/cuisine: "([^"]+)"/g) || [])
        .map(m => m.replace('cuisine: "', '').replace('"', ''))
    );
    expect(cuisines.size).toBe(10);
  });

  it("54+ seed businesses", () => {
    const seedSrc = fs.readFileSync(path.resolve("server/seed.ts"), "utf-8");
    const slugCount = (seedSrc.match(/slug: "/g) || []).length;
    expect(slugCount).toBeGreaterThanOrEqual(54);
  });
});

describe("Sprint 300 — Audit grade verification", () => {
  it("audit doc states 18th consecutive A-range", () => {
    const audit = fs.readFileSync(path.resolve("docs/audits/ARCH-AUDIT-42.md"), "utf-8");
    expect(audit).toContain("18th consecutive A-range");
  });

  it("audit doc has 0 critical and 0 high findings", () => {
    const audit = fs.readFileSync(path.resolve("docs/audits/ARCH-AUDIT-42.md"), "utf-8");
    expect(audit).toContain("Critical (P0) — 0 issues");
    expect(audit).toContain("High (P1) — 0 issues");
  });

  it("audit doc marks badges.ts as RESOLVED", () => {
    const audit = fs.readFileSync(path.resolve("docs/audits/ARCH-AUDIT-42.md"), "utf-8");
    expect(audit).toContain("RESOLVED");
  });
});
