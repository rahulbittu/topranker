/**
 * Sprint 585: Governance — SLT-585 + Audit #585 + Critique Request
 *
 * Tests:
 * 1. SLT meeting doc exists with correct structure
 * 2. Architectural audit doc exists with correct structure
 * 3. Critique request exists with questions
 * 4. Sprint docs for 581-584 exist
 * 5. Retro docs for 581-584 exist
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const fileExists = (relPath: string) =>
  fs.existsSync(path.join(ROOT, relPath));

describe("Sprint 585: SLT Meeting — SLT-BACKLOG-585", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-585.md");

  it("has correct meeting header", () => {
    expect(src).toContain("SLT Backlog Meeting — Sprint 585");
    expect(src).toContain("Marcus Chen (CTO)");
  });

  it("reviews sprints 581-584", () => {
    expect(src).toContain("Sprint 581");
    expect(src).toContain("Sprint 582");
    expect(src).toContain("Sprint 583");
    expect(src).toContain("Sprint 584");
  });

  it("has delivery score", () => {
    expect(src).toContain("Delivery Score: 4/4");
  });

  it("has roadmap for sprints 586-590", () => {
    expect(src).toContain("586");
    expect(src).toContain("587");
    expect(src).toContain("588");
    expect(src).toContain("589");
    expect(src).toContain("590");
  });

  it("has current metrics section", () => {
    expect(src).toContain("11,096 tests");
    expect(src).toContain("721.2kb");
  });

  it("has key decisions section", () => {
    expect(src).toContain("Key Decisions");
  });

  it("has team notes from 4 SLT members", () => {
    expect(src).toContain("Marcus Chen:");
    expect(src).toContain("Rachel Wei:");
    expect(src).toContain("Amir Patel:");
    expect(src).toContain("Sarah Nakamura:");
  });
});

describe("Sprint 585: Architectural Audit — ARCH-AUDIT-585", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-585.md");

  it("has correct audit header", () => {
    expect(src).toContain("Architectural Audit — Sprint 585");
    expect(src).toContain("Nadia Kaur (Cybersecurity)");
  });

  it("has executive summary with grade", () => {
    expect(src).toContain("Overall Grade:");
    expect(src).toContain("Overall Health:");
  });

  it("has zero critical findings", () => {
    expect(src).toContain("CRITICAL — None");
  });

  it("has zero high findings", () => {
    expect(src).toContain("HIGH — None");
  });

  it("has medium findings with owners and sprints", () => {
    expect(src).toContain("### MEDIUM");
    expect(src).toContain("Owner:");
    expect(src).toContain("Sprint:");
  });

  it("has file health summary table", () => {
    expect(src).toContain("File Health Summary");
    expect(src).toContain("profile.tsx");
    expect(src).toContain("352");
  });

  it("has security review section", () => {
    expect(src).toContain("Security Review (Nadia Kaur)");
    expect(src).toContain("photo-hash.ts");
  });

  it("has grade history table", () => {
    expect(src).toContain("Grade History");
    expect(src).toContain("**585**");
  });
});

describe("Sprint 585: Critique Request", () => {
  const src = readFile("docs/critique/inbox/SPRINT-581-584-REQUEST.md");

  it("has correct request header", () => {
    expect(src).toContain("Critique Request: Sprints 581-584");
    expect(src).toContain("Marcus Chen (CTO)");
  });

  it("has sprint summary table", () => {
    expect(src).toContain("| 581 |");
    expect(src).toContain("| 582 |");
    expect(src).toContain("| 583 |");
    expect(src).toContain("| 584 |");
  });

  it("has 5 questions for external watcher", () => {
    expect(src).toContain("1. **");
    expect(src).toContain("2. **");
    expect(src).toContain("3. **");
    expect(src).toContain("4. **");
    expect(src).toContain("5. **");
  });
});

describe("Sprint 585: Sprint & Retro Doc Completeness", () => {
  it("sprint docs exist for 581-584", () => {
    expect(fileExists("docs/sprints/SPRINT-581-CLAIM-TIMELINE.md")).toBe(true);
    expect(fileExists("docs/sprints/SPRINT-582-CITY-DIM-CACHE.md")).toBe(true);
    expect(fileExists("docs/sprints/SPRINT-583-PHOTO-HASH.md")).toBe(true);
    expect(fileExists("docs/sprints/SPRINT-584-PROFILE-EXTRACTION.md")).toBe(true);
  });

  it("retro docs exist for 581-584", () => {
    expect(fileExists("docs/retros/RETRO-581-CLAIM-TIMELINE.md")).toBe(true);
    expect(fileExists("docs/retros/RETRO-582-CITY-DIM-CACHE.md")).toBe(true);
    expect(fileExists("docs/retros/RETRO-583-PHOTO-HASH.md")).toBe(true);
    expect(fileExists("docs/retros/RETRO-584-PROFILE-EXTRACTION.md")).toBe(true);
  });
});
