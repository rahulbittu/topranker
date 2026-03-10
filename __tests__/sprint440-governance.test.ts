/**
 * Sprint 440 — Governance (SLT-440 + Arch Audit #46 + Critique)
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
describe("SLT-440 meeting", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-440.md");

  it("exists and has title", () => {
    expect(src).toContain("SLT Backlog Review — Sprint 440");
  });

  it("reviews sprints 436-439", () => {
    expect(src).toContain("436");
    expect(src).toContain("437");
    expect(src).toContain("438");
    expect(src).toContain("439");
  });

  it("has roadmap for 441-445", () => {
    expect(src).toContain("441");
    expect(src).toContain("442");
    expect(src).toContain("443");
    expect(src).toContain("444");
    expect(src).toContain("445");
  });

  it("includes current metrics", () => {
    expect(src).toContain("7,985");
    expect(src).toContain("334");
    expect(src).toContain("608.6kb");
  });

  it("notes 4/4 user-facing features", () => {
    expect(src).toContain("4/4 user-facing");
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture Audit
// ---------------------------------------------------------------------------
describe("Arch Audit #46", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-440.md");

  it("exists and has title", () => {
    expect(src).toContain("Architecture Audit #46");
  });

  it("has grade A", () => {
    expect(src).toContain("Grade: A");
  });

  it("has 0 critical findings", () => {
    expect(src).toContain("Critical | 0");
  });

  it("has 2 medium findings", () => {
    expect(src).toContain("Medium | 2");
  });

  it("identifies profile.tsx watch", () => {
    expect(src).toContain("profile.tsx");
    expect(src).toContain("87.4%");
  });

  it("identifies photo moderation in-memory issue", () => {
    expect(src).toContain("photo moderation");
    expect(src).toContain("in-memory");
  });

  it("notes 46th consecutive A-range", () => {
    expect(src).toContain("46th consecutive");
  });
});

// ---------------------------------------------------------------------------
// 3. Critique Request
// ---------------------------------------------------------------------------
describe("Critique Request 436-439", () => {
  const src = readFile("docs/critique/inbox/SPRINT-436-439-REQUEST.md");

  it("exists and has title", () => {
    expect(src).toContain("Critique Request: Sprints 436");
  });

  it("has 5 questions", () => {
    expect(src).toContain("### 1.");
    expect(src).toContain("### 2.");
    expect(src).toContain("### 3.");
    expect(src).toContain("### 4.");
    expect(src).toContain("### 5.");
  });

  it("asks about search weight balance", () => {
    expect(src).toContain("weight balance");
  });

  it("asks about fuzzy threshold", () => {
    expect(src).toContain("4-character minimum");
  });

  it("asks about photo moderation persistence", () => {
    expect(src).toContain("moderation queue persistence");
  });

  it("lists deliverables", () => {
    expect(src).toContain("Deliverables for Review");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & Retro docs
// ---------------------------------------------------------------------------
describe("Sprint 440 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-440-GOVERNANCE.md");
    expect(src).toContain("Sprint 440");
    expect(src).toContain("Governance");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-440-GOVERNANCE.md");
    expect(src).toContain("Retro 440");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-440-GOVERNANCE.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 441");
  });
});
