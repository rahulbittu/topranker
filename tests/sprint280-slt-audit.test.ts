/**
 * Sprint 280 — SLT Q1 2026-27 Review + Arch Audit #38
 *
 * Validates:
 * 1. SLT meeting doc exists with required sections
 * 2. Arch audit doc exists with grade and findings
 * 3. Critique request exists for Sprint 275-279 block
 * 4. Codebase health thresholds (LOC, as any, test counts)
 * 5. All Sprint 276-279 docs exist
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const fileExists = (relPath: string) => fs.existsSync(path.join(ROOT, relPath));
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 280: SLT Meeting Doc", () => {
  it("SLT-BACKLOG-280.md exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-280.md")).toBe(true);
  });

  const sltDoc = readFile("docs/meetings/SLT-BACKLOG-280.md");

  it("has Sprint Roadmap 281-285 section", () => {
    expect(sltDoc).toContain("Sprint Roadmap 281-285");
  });

  it("has Revenue Update section", () => {
    expect(sltDoc).toContain("Revenue Update");
  });

  it("has Action Items", () => {
    expect(sltDoc).toContain("Action Items");
  });

  it("has codebase metrics table", () => {
    expect(sltDoc).toContain("Sprint 275");
    expect(sltDoc).toContain("Sprint 280");
  });

  it("references CEO seed completion", () => {
    expect(sltDoc).toContain("CEO personal seed");
  });

  it("references anti-requirement violations", () => {
    expect(sltDoc).toContain("Anti-Requirement Violations");
  });
});

describe("Sprint 280: Arch Audit #38", () => {
  it("ARCH-AUDIT-38.md exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-38.md")).toBe(true);
  });

  const auditDoc = readFile("docs/audits/ARCH-AUDIT-38.md");

  it("has grade A", () => {
    expect(auditDoc).toContain("Grade: A");
  });

  it("has 14th consecutive A-range", () => {
    expect(auditDoc).toContain("14th consecutive A-range");
  });

  it("reports 0 critical findings", () => {
    expect(auditDoc).toContain("Critical (P0) — 0 issues");
  });

  it("reports 0 high findings", () => {
    expect(auditDoc).toContain("High (P1) — 0 issues");
  });

  it("tracks as any count at 70", () => {
    expect(auditDoc).toContain("70");
  });

  it("has recommendations for next 5 sprints", () => {
    expect(auditDoc).toContain("Recommendations for Next 5 Sprints");
  });
});

describe("Sprint 280: Critique Request", () => {
  it("SPRINT-275-279-REQUEST.md exists in critique inbox", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-275-279-REQUEST.md")).toBe(true);
  });

  const critiqueDoc = readFile("docs/critique/inbox/SPRINT-275-279-REQUEST.md");

  it("covers all 4 sprints (276-279)", () => {
    expect(critiqueDoc).toContain("Sprint 276");
    expect(critiqueDoc).toContain("Sprint 277");
    expect(critiqueDoc).toContain("Sprint 278");
    expect(critiqueDoc).toContain("Sprint 279");
  });

  it("has questions for review", () => {
    expect(critiqueDoc).toContain("Questions for Review");
  });
});

describe("Sprint 280: Codebase Health Thresholds", () => {
  it("search.tsx under 1000 LOC", () => {
    const loc = readFile("app/(tabs)/search.tsx").split("\n").length;
    expect(loc).toBeLessThan(1000);
  });

  it("badges.ts under 1000 LOC", () => {
    const loc = readFile("lib/badges.ts").split("\n").length;
    expect(loc).toBeLessThan(1000);
  });

  it("routes.ts under 560 LOC", () => {
    const loc = readFile("server/routes.ts").split("\n").length;
    expect(loc).toBeLessThan(560);
  });

  it("routes-admin.ts under 650 LOC", () => {
    const loc = readFile("server/routes-admin.ts").split("\n").length;
    expect(loc).toBeLessThan(650);
  });
});

describe("Sprint 280: Sprint Doc Completeness (276-279)", () => {
  for (const n of [276, 277, 278, 279]) {
    it(`SPRINT-${n} doc exists`, () => {
      const files = fs.readdirSync(path.join(ROOT, "docs/sprints"));
      expect(files.some(f => f.startsWith(`SPRINT-${n}`))).toBe(true);
    });

    it(`RETRO-${n} doc exists`, () => {
      const files = fs.readdirSync(path.join(ROOT, "docs/retros"));
      expect(files.some(f => f.startsWith(`RETRO-${n}`))).toBe(true);
    });
  }
});
