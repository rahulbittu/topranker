/**
 * Sprint 590: Governance (SLT-590 + Audit #590 + Critique)
 *
 * Tests:
 * 1. SLT meeting doc exists and covers sprints 586-589
 * 2. Audit doc exists with grade and findings
 * 3. Critique request exists
 * 4. Sprint 586-589 deliverables verified
 * 5. Thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const fileExists = (relPath: string) =>
  fs.existsSync(path.join(ROOT, relPath));

describe("Sprint 590: SLT-590 Backlog Meeting", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-590.md");

  it("SLT-590 meeting doc exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-590.md")).toBe(true);
  });

  it("reviews Sprint 586 notification extraction", () => {
    expect(src).toContain("586");
    expect(src).toContain("routes-member-notifications");
  });

  it("reviews Sprint 587 photo hash persistence", () => {
    expect(src).toContain("587");
    expect(src).toContain("contentHash");
  });

  it("reviews Sprint 588 perceptual hash", () => {
    expect(src).toContain("588");
    expect(src).toContain("pHash");
  });

  it("reviews Sprint 589 business detail extraction", () => {
    expect(src).toContain("589");
    expect(src).toContain("BusinessHeroSection");
  });

  it("includes roadmap for sprints 591-595", () => {
    expect(src).toContain("591");
    expect(src).toContain("595");
  });

  it("includes delivery score", () => {
    expect(src).toContain("4/4");
  });

  it("flags build size as critical path", () => {
    expect(src).toContain("725.9kb");
    expect(src).toContain("99.4%");
  });
});

describe("Sprint 590: Architectural Audit #590", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-590.md");

  it("audit doc exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-590.md")).toBe(true);
  });

  it("has overall grade A", () => {
    expect(src).toContain("Overall Grade:** A");
  });

  it("has 0 critical findings", () => {
    expect(src).toContain("CRITICAL — None");
  });

  it("has 0 high findings", () => {
    expect(src).toContain("HIGH — None");
  });

  it("M1: build size concern", () => {
    expect(src).toContain("Build Size at 99.4%");
  });

  it("M2: pHash not persistent", () => {
    expect(src).toContain("pHash Index Not Persistent");
  });

  it("resolved Audit 585 M1 and M2", () => {
    expect(src).toContain("contentHash column + preloadHashIndex");
    expect(src).toContain("Notification endpoints extracted");
  });

  it("includes security review", () => {
    expect(src).toContain("Nadia Kaur");
  });

  it("includes grade history", () => {
    expect(src).toContain("Grade History");
  });
});

describe("Sprint 590: Critique Request", () => {
  it("critique request exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-586-589-REQUEST.md")).toBe(true);
  });

  const src = readFile("docs/critique/inbox/SPRINT-586-589-REQUEST.md");

  it("asks about photo anti-gaming pipeline", () => {
    expect(src).toContain("Photo Anti-Gaming Pipeline");
  });

  it("asks about build size", () => {
    expect(src).toContain("Build Size");
  });

  it("asks about in-memory stores", () => {
    expect(src).toContain("In-Memory Store");
  });
});

describe("Sprint 590: Sprint 586-589 Deliverables Verified", () => {
  it("routes-member-notifications.ts exists", () => {
    expect(fileExists("server/routes-member-notifications.ts")).toBe(true);
  });

  it("ratingPhotos has contentHash column", () => {
    const schema = readFile("shared/schema.ts");
    expect(schema).toContain("content_hash");
  });

  it("phash.ts exists", () => {
    expect(fileExists("server/phash.ts")).toBe(true);
  });

  it("BusinessHeroSection exists", () => {
    expect(fileExists("components/business/BusinessHeroSection.tsx")).toBe(true);
  });

  it("BusinessAnalyticsSection exists", () => {
    expect(fileExists("components/business/BusinessAnalyticsSection.tsx")).toBe(true);
  });

  it("photo-hash.ts has preloadHashIndex", () => {
    const src = readFile("server/photo-hash.ts");
    expect(src).toContain("preloadHashIndex");
  });

  it("server build under 730kb", () => {
    const buildSrc = readFile("server_dist/index.js");
    const sizeKb = buildSrc.length / 1024;
    expect(sizeKb).toBeLessThan(730);
  });
});

describe("Sprint 590: Threshold Checks", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("build size under max", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(thresholds.build.maxSizeKb);
  });
});
