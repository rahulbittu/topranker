/**
 * Sprint 450 — Governance (SLT-450 + Arch Audit #48 + Critique)
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
describe("SLT-450 meeting", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-450.md");

  it("exists and has title", () => {
    expect(src).toContain("SLT Backlog Review — Sprint 450");
  });

  it("reviews sprints 446-449", () => {
    expect(src).toContain("446");
    expect(src).toContain("447");
    expect(src).toContain("448");
    expect(src).toContain("449");
  });

  it("has roadmap for 451-455", () => {
    expect(src).toContain("451");
    expect(src).toContain("452");
    expect(src).toContain("453");
    expect(src).toContain("454");
    expect(src).toContain("455");
  });

  it("includes current metrics", () => {
    expect(src).toContain("8,308");
    expect(src).toContain("344");
    expect(src).toContain("622.7kb");
  });

  it("notes 4/4 roadmap completion", () => {
    expect(src).toContain("4/4");
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture Audit
// ---------------------------------------------------------------------------
describe("Arch Audit #48", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-450.md");

  it("exists and has title", () => {
    expect(src).toContain("Architecture Audit #48");
  });

  it("has grade A", () => {
    expect(src).toContain("Grade: A");
  });

  it("has 0 critical findings", () => {
    expect(src).toContain("Critical | 0");
  });

  it("has 1 medium finding", () => {
    expect(src).toContain("Medium | 1");
  });

  it("identifies DiscoverFilters watch", () => {
    expect(src).toContain("DiscoverFilters");
    expect(src).toContain("92.5%");
  });

  it("notes resolved findings from Audit #47", () => {
    expect(src).toContain("rate/SubComponents");
    expect(src).toContain("593→210");
  });

  it("notes 48th consecutive A-range", () => {
    expect(src).toContain("48th consecutive");
  });
});

// ---------------------------------------------------------------------------
// 3. Critique Request
// ---------------------------------------------------------------------------
describe("Critique Request 446-449", () => {
  const src = readFile("docs/critique/inbox/SPRINT-446-449-REQUEST.md");

  it("exists and has title", () => {
    expect(src).toContain("Critique Request: Sprints 446");
  });

  it("has 5 questions", () => {
    expect(src).toContain("### 1.");
    expect(src).toContain("### 2.");
    expect(src).toContain("### 3.");
    expect(src).toContain("### 4.");
    expect(src).toContain("### 5.");
  });

  it("asks about cuisine mapping strategy", () => {
    expect(src).toContain("CUISINE_TAG_SUGGESTIONS");
    expect(src).toContain("hardcod");
  });

  it("asks about timezone generalization", () => {
    expect(src).toContain("America/Chicago");
    expect(src).toContain("timezone");
  });

  it("asks about city stats caching", () => {
    expect(src).toContain("caching");
    expect(src).toContain("Redis");
  });

  it("lists deliverables", () => {
    expect(src).toContain("Deliverables for Review");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & Retro docs
// ---------------------------------------------------------------------------
describe("Sprint 450 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-450-GOVERNANCE.md");
    expect(src).toContain("Sprint 450");
    expect(src).toContain("Governance");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-450-GOVERNANCE.md");
    expect(src).toContain("Retro 450");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-450-GOVERNANCE.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 451");
  });
});
