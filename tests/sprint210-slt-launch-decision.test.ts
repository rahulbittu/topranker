/**
 * Sprint 210 — SLT Meeting: Public Launch GO/NO-GO + Arch Audit #24
 *
 * Validates:
 * 1. SLT meeting document
 * 2. Architectural audit document
 * 3. Critique request filed
 * 4. Launch decision documentation
 * 5. Sprint 206-209 documentation completeness
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. SLT Meeting
// ---------------------------------------------------------------------------
describe("SLT-210 meeting — docs/meetings/SLT-BACKLOG-210.md", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-210.md");

  it("has meeting title", () => {
    expect(src).toContain("Sprint 210");
  });

  it("has GO/NO-GO decision", () => {
    expect(src).toContain("GO/NO-GO");
  });

  it("includes conditional GO decision", () => {
    expect(src).toContain("CONDITIONAL GO");
  });

  it("targets Sprint 215 for launch", () => {
    expect(src).toContain("Sprint 215");
  });

  it("lists 5 conditions", () => {
    expect(src).toContain("Wave 3");
    expect(src).toContain("15%");
    expect(src).toContain("screenshots");
  });

  it("reviews Sprint 206-209", () => {
    expect(src).toContain("206");
    expect(src).toContain("207");
    expect(src).toContain("208");
    expect(src).toContain("209");
  });

  it("has next 5 sprint roadmap", () => {
    expect(src).toContain("211");
    expect(src).toContain("212");
    expect(src).toContain("213");
    expect(src).toContain("214");
    expect(src).toContain("215");
  });

  it("has launch readiness assessment", () => {
    expect(src).toContain("Launch Readiness Assessment");
  });

  it("all departments assessed", () => {
    expect(src).toContain("Engineering: READY");
    expect(src).toContain("Product: READY");
    expect(src).toContain("Security: READY");
    expect(src).toContain("Marketing: READY");
    expect(src).toContain("Compliance: READY");
  });
});

// ---------------------------------------------------------------------------
// 2. Architectural Audit #24
// ---------------------------------------------------------------------------
describe("Arch Audit #24 — docs/audits/ARCH-AUDIT-210.md", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-210.md");

  it("has audit title", () => {
    expect(src).toContain("Architectural Audit #24");
  });

  it("has A grade", () => {
    expect(src).toContain("Grade:** A");
  });

  it("no critical findings", () => {
    expect(src).toContain("No Critical");
  });

  it("no high findings", () => {
    expect(src).toContain("No High");
  });

  it("has scorecard", () => {
    expect(src).toContain("## Scorecard");
  });

  it("has grade history", () => {
    expect(src).toContain("Grade History");
  });

  it("shows test count", () => {
    expect(src).toContain("3,672");
  });
});

// ---------------------------------------------------------------------------
// 3. Critique request
// ---------------------------------------------------------------------------
describe("Critique request — docs/critique/inbox/SPRINT-205-209-REQUEST.md", () => {
  it("critique request file exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-205-209-REQUEST.md")).toBe(true);
  });

  const src = readFile("docs/critique/inbox/SPRINT-205-209-REQUEST.md");

  it("covers Sprint 205-209", () => {
    expect(src).toContain("Sprint 205");
    expect(src).toContain("Sprint 209");
  });

  it("has questions for critique", () => {
    expect(src).toContain("Questions for External Critique");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint documentation completeness (206-210)
// ---------------------------------------------------------------------------
describe("Sprint 206-210 documentation", () => {
  it("Sprint 206 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-206-MIDDLEWARE-PERF-CONSOLIDATION.md")).toBe(true);
  });

  it("Sprint 207 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-207-AUTOREFRESH-EXPORT.md")).toBe(true);
  });

  it("Sprint 208 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-208-APP-STORE-LAUNCH.md")).toBe(true);
  });

  it("Sprint 209 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-209-MARKETING-PR-EXPORT.md")).toBe(true);
  });

  it("Sprint 210 doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-210-SLT-LAUNCH-DECISION.md")).toBe(true);
  });

  it("Retro 206-210 all exist", () => {
    expect(fileExists("docs/retros/RETRO-206-MIDDLEWARE-PERF-CONSOLIDATION.md")).toBe(true);
    expect(fileExists("docs/retros/RETRO-207-AUTOREFRESH-EXPORT.md")).toBe(true);
    expect(fileExists("docs/retros/RETRO-208-APP-STORE-LAUNCH.md")).toBe(true);
    expect(fileExists("docs/retros/RETRO-209-MARKETING-PR-EXPORT.md")).toBe(true);
    expect(fileExists("docs/retros/RETRO-210-SLT-LAUNCH-DECISION.md")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Launch documents exist
// ---------------------------------------------------------------------------
describe("Launch preparation documents", () => {
  it("App store metadata exists", () => {
    expect(fileExists("docs/APP-STORE-METADATA.md")).toBe(true);
  });

  it("Launch checklist exists", () => {
    expect(fileExists("docs/LAUNCH-CHECKLIST.md")).toBe(true);
  });

  it("PR strategy exists", () => {
    expect(fileExists("docs/PR-STRATEGY.md")).toBe(true);
  });

  it("SLT-210 meeting exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-210.md")).toBe(true);
  });

  it("Arch Audit #24 exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-210.md")).toBe(true);
  });
});
