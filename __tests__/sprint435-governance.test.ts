/**
 * Sprint 435 — Governance (SLT-435 + Arch Audit #45 + Critique)
 *
 * Validates:
 * 1. SLT meeting doc exists with roadmap
 * 2. Architecture audit exists with grade
 * 3. Critique request exists with questions
 * 4. Sprint and retro docs exist
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. SLT Meeting
// ---------------------------------------------------------------------------
describe("SLT-435 meeting", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-435.md");

  it("exists and has title", () => {
    expect(src).toContain("SLT Backlog Review — Sprint 435");
  });

  it("has attendees", () => {
    expect(src).toContain("Marcus Chen");
    expect(src).toContain("Rachel Wei");
    expect(src).toContain("Amir Patel");
    expect(src).toContain("Sarah Nakamura");
  });

  it("reviews sprints 431-434", () => {
    expect(src).toContain("431");
    expect(src).toContain("432");
    expect(src).toContain("433");
    expect(src).toContain("434");
  });

  it("has roadmap for 436-440", () => {
    expect(src).toContain("436");
    expect(src).toContain("437");
    expect(src).toContain("438");
    expect(src).toContain("439");
    expect(src).toContain("440");
  });

  it("includes current metrics", () => {
    expect(src).toContain("7,799");
    expect(src).toContain("329");
    expect(src).toContain("601.1kb");
  });

  it("has team discussion section", () => {
    expect(src).toContain("Team Discussion");
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture Audit
// ---------------------------------------------------------------------------
describe("Arch Audit #45", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-435.md");

  it("exists and has title", () => {
    expect(src).toContain("Architecture Audit #45");
  });

  it("has grade A", () => {
    expect(src).toContain("Grade: A");
  });

  it("has 0 critical findings", () => {
    expect(src).toContain("Critical | 0");
  });

  it("has 0 high findings", () => {
    expect(src).toContain("High | 0");
  });

  it("has medium finding for profile.tsx", () => {
    expect(src).toContain("profile.tsx");
    expect(src).toContain("86.3%");
  });

  it("has file health summary", () => {
    expect(src).toContain("File Health Summary");
  });

  it("has test health", () => {
    expect(src).toContain("Test Health");
    expect(src).toContain("7,799");
  });

  it("notes 45th consecutive A-range", () => {
    expect(src).toContain("45th consecutive");
  });
});

// ---------------------------------------------------------------------------
// 3. Critique Request
// ---------------------------------------------------------------------------
describe("Critique Request 431-434", () => {
  const src = readFile("docs/critique/inbox/SPRINT-431-434-REQUEST.md");

  it("exists and has title", () => {
    expect(src).toContain("Critique Request: Sprints 431–434");
  });

  it("has 5 questions", () => {
    expect(src).toContain("### 1.");
    expect(src).toContain("### 2.");
    expect(src).toContain("### 3.");
    expect(src).toContain("### 4.");
    expect(src).toContain("### 5.");
  });

  it("asks about vote animation integration", () => {
    expect(src).toContain("animation integration");
  });

  it("asks about CSV export trade-off", () => {
    expect(src).toContain("CSV");
    expect(src).toContain("client-side");
  });

  it("asks about re-export debt", () => {
    expect(src).toContain("re-export");
  });

  it("lists deliverables for review", () => {
    expect(src).toContain("Deliverables for Review");
    expect(src).toContain("ChallengeCard.tsx");
    expect(src).toContain("PhotoMetadataBar.tsx");
    expect(src).toContain("RatingExport.tsx");
    expect(src).toContain("RankedCard.tsx");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & Retro docs
// ---------------------------------------------------------------------------
describe("Sprint 435 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-435-GOVERNANCE.md");
    expect(src).toContain("Sprint 435");
    expect(src).toContain("Governance");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-435-GOVERNANCE.md");
    expect(src).toContain("Retro 435");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-435-GOVERNANCE.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 436");
  });
});
