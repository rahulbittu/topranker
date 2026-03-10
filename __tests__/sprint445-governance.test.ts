/**
 * Sprint 445 — Governance (SLT-445 + Arch Audit #47 + Critique)
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
describe("SLT-445 meeting", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-445.md");

  it("exists and has title", () => {
    expect(src).toContain("SLT Backlog Review — Sprint 445");
  });

  it("reviews sprints 441-444", () => {
    expect(src).toContain("441");
    expect(src).toContain("442");
    expect(src).toContain("443");
    expect(src).toContain("444");
  });

  it("has roadmap for 446-450", () => {
    expect(src).toContain("446");
    expect(src).toContain("447");
    expect(src).toContain("448");
    expect(src).toContain("449");
    expect(src).toContain("450");
  });

  it("includes current metrics", () => {
    expect(src).toContain("8,152");
    expect(src).toContain("339");
    expect(src).toContain("611.4kb");
  });

  it("notes 4/4 roadmap completion", () => {
    expect(src).toContain("4/4");
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture Audit
// ---------------------------------------------------------------------------
describe("Arch Audit #47", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-445.md");

  it("exists and has title", () => {
    expect(src).toContain("Architecture Audit #47");
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

  it("identifies rate/SubComponents watch", () => {
    expect(src).toContain("rate/SubComponents");
    expect(src).toContain("91.2%");
  });

  it("notes resolved findings from Audit #46", () => {
    expect(src).toContain("profile.tsx at 87.4%");
    expect(src).toContain("Photo moderation in-memory");
  });

  it("notes 47th consecutive A-range", () => {
    expect(src).toContain("47th consecutive");
  });
});

// ---------------------------------------------------------------------------
// 3. Critique Request
// ---------------------------------------------------------------------------
describe("Critique Request 441-444", () => {
  const src = readFile("docs/critique/inbox/SPRINT-441-444-REQUEST.md");

  it("exists and has title", () => {
    expect(src).toContain("Critique Request: Sprints 441");
  });

  it("has 5 questions", () => {
    expect(src).toContain("### 1.");
    expect(src).toContain("### 2.");
    expect(src).toContain("### 3.");
    expect(src).toContain("### 4.");
    expect(src).toContain("### 5.");
  });

  it("asks about photo stats scaling", () => {
    expect(src).toContain("getPhotoStats");
    expect(src).toContain("COUNT");
  });

  it("asks about dietary auto-tagging", () => {
    expect(src).toContain("auto-tag");
  });

  it("asks about haversine accuracy", () => {
    expect(src).toContain("haversine");
    expect(src).toContain("driving distance");
  });

  it("lists deliverables", () => {
    expect(src).toContain("Deliverables for Review");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & Retro docs
// ---------------------------------------------------------------------------
describe("Sprint 445 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-445-GOVERNANCE.md");
    expect(src).toContain("Sprint 445");
    expect(src).toContain("Governance");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-445-GOVERNANCE.md");
    expect(src).toContain("Retro 445");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-445-GOVERNANCE.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 446");
  });
});
