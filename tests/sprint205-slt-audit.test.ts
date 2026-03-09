/**
 * Sprint 205 — SLT Meeting + Architectural Audit #23
 *
 * Validates:
 * 1. SLT meeting document structure
 * 2. Architectural audit document
 * 3. External critique request filed
 * 4. Sprint documentation completeness
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. SLT Meeting document
// ---------------------------------------------------------------------------
describe("SLT-205 meeting — docs/meetings/SLT-BACKLOG-205.md", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-205.md");

  it("has meeting title", () => {
    expect(src).toContain("SLT Backlog Meeting — Sprint 205");
  });

  it("lists attendees", () => {
    expect(src).toContain("Marcus Chen");
    expect(src).toContain("Rachel Wei");
    expect(src).toContain("Amir Patel");
    expect(src).toContain("Sarah Nakamura");
  });

  it("reviews Sprint 201-204", () => {
    expect(src).toContain("201");
    expect(src).toContain("202");
    expect(src).toContain("203");
    expect(src).toContain("204");
  });

  it("includes test count", () => {
    expect(src).toContain("3,536");
  });

  it("has next 5 sprint roadmap", () => {
    expect(src).toContain("206");
    expect(src).toContain("207");
    expect(src).toContain("208");
    expect(src).toContain("209");
    expect(src).toContain("210");
  });

  it("includes launch decision timeline", () => {
    expect(src).toContain("GO/NO-GO");
  });

  it("has decisions section", () => {
    expect(src).toContain("## Decisions");
  });
});

// ---------------------------------------------------------------------------
// 2. Architectural Audit #23
// ---------------------------------------------------------------------------
describe("Arch Audit #23 — docs/audits/ARCH-AUDIT-205.md", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-205.md");

  it("has audit title", () => {
    expect(src).toContain("Architectural Audit #23");
  });

  it("has grade", () => {
    expect(src).toContain("Grade:** A-");
  });

  it("has scorecard", () => {
    expect(src).toContain("## Scorecard");
  });

  it("has findings section", () => {
    expect(src).toContain("## Findings");
  });

  it("reports no critical findings", () => {
    expect(src).toContain("No Critical");
  });

  it("reports no high findings", () => {
    expect(src).toContain("No High");
  });

  it("has medium findings", () => {
    expect(src).toContain("Medium (P2)");
  });

  it("includes metrics comparison", () => {
    expect(src).toContain("Sprint 200");
    expect(src).toContain("Sprint 205");
  });

  it("has grade history", () => {
    expect(src).toContain("Grade History");
  });

  it("has action items with owners", () => {
    expect(src).toContain("Action Items");
    expect(src).toContain("Owner");
  });
});

// ---------------------------------------------------------------------------
// 3. External critique request
// ---------------------------------------------------------------------------
describe("Critique request — docs/critique/inbox/SPRINT-201-204-REQUEST.md", () => {
  it("critique request file exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-201-204-REQUEST.md")).toBe(true);
  });

  const src = readFile("docs/critique/inbox/SPRINT-201-204-REQUEST.md");

  it("has sprint summaries", () => {
    expect(src).toContain("Sprint 201");
    expect(src).toContain("Sprint 202");
    expect(src).toContain("Sprint 203");
    expect(src).toContain("Sprint 204");
  });

  it("has metrics section", () => {
    expect(src).toContain("## Metrics");
  });

  it("has questions for critique", () => {
    expect(src).toContain("Questions for External Critique");
  });

  it("lists changed files", () => {
    expect(src).toContain("Changed Files");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint documentation completeness
// ---------------------------------------------------------------------------
describe("Sprint 201-205 documentation completeness", () => {
  it("Sprint 201 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-201-ANALYTICS-PERSISTENCE.md")).toBe(true);
  });

  it("Sprint 202 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-202-CLIENT-BETA-TRACKING.md")).toBe(true);
  });

  it("Sprint 203 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-203-ADMIN-ANALYTICS-VIZ.md")).toBe(true);
  });

  it("Sprint 204 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-204-WAVE3-PERF-VALIDATION.md")).toBe(true);
  });

  it("Sprint 205 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-205-SLT-AUDIT.md")).toBe(true);
  });

  it("Retro 201 exists", () => {
    expect(fileExists("docs/retros/RETRO-201-ANALYTICS-PERSISTENCE.md")).toBe(true);
  });

  it("Retro 202 exists", () => {
    expect(fileExists("docs/retros/RETRO-202-CLIENT-BETA-TRACKING.md")).toBe(true);
  });

  it("Retro 203 exists", () => {
    expect(fileExists("docs/retros/RETRO-203-ADMIN-ANALYTICS-VIZ.md")).toBe(true);
  });

  it("Retro 204 exists", () => {
    expect(fileExists("docs/retros/RETRO-204-WAVE3-PERF-VALIDATION.md")).toBe(true);
  });

  it("Retro 205 exists", () => {
    expect(fileExists("docs/retros/RETRO-205-SLT-AUDIT.md")).toBe(true);
  });
});
