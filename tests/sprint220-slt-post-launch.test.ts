/**
 * Sprint 220 — SLT Post-Launch Review + Arch Audit #26
 *
 * Validates:
 * 1. SLT-220 meeting document
 * 2. Architecture audit #26
 * 3. Critique request for 215-219
 * 4. Post-launch infrastructure completeness
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. SLT-220 meeting document
// ---------------------------------------------------------------------------
describe("SLT-220 Post-Launch Review", () => {
  it("meeting document exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-220.md")).toBe(true);
  });

  const src = readFile("docs/meetings/SLT-BACKLOG-220.md");

  it("includes all SLT attendees", () => {
    expect(src).toContain("Marcus Chen");
    expect(src).toContain("Rachel Wei");
    expect(src).toContain("Amir Patel");
    expect(src).toContain("Sarah Nakamura");
    expect(src).toContain("David Okonkwo");
  });

  it("reviews Sprints 216-219", () => {
    expect(src).toContain("216");
    expect(src).toContain("217");
    expect(src).toContain("218");
    expect(src).toContain("219");
  });

  it("includes next sprint roadmap", () => {
    expect(src).toContain("221");
    expect(src).toContain("222");
    expect(src).toContain("223");
    expect(src).toContain("224");
    expect(src).toContain("225");
  });

  it("includes performance review grade", () => {
    expect(src).toContain("Performance Review: A");
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture audit #26
// ---------------------------------------------------------------------------
describe("Architecture Audit #26", () => {
  it("audit document exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-220.md")).toBe(true);
  });

  const src = readFile("docs/audits/ARCH-AUDIT-220.md");

  it("grade is A", () => {
    expect(src).toContain("Grade:** A");
  });

  it("has zero critical findings", () => {
    expect(src).toContain("No Critical");
  });

  it("has zero high findings", () => {
    expect(src).toContain("No High");
  });

  it("tracks routes-admin split", () => {
    expect(src).toContain("536");
    expect(src).toContain("198");
  });

  it("tracks test count", () => {
    expect(src).toContain("3,968");
  });

  it("includes grade history", () => {
    expect(src).toContain("#25");
    expect(src).toContain("#26");
  });
});

// ---------------------------------------------------------------------------
// 3. Critique request for 215-219
// ---------------------------------------------------------------------------
describe("Critique request for 215-219", () => {
  it("critique request exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-215-219-REQUEST.md")).toBe(true);
  });

  const src = readFile("docs/critique/inbox/SPRINT-215-219-REQUEST.md");

  it("covers Sprints 215-219", () => {
    expect(src).toContain("Sprint 215");
    expect(src).toContain("Sprint 216");
    expect(src).toContain("Sprint 217");
    expect(src).toContain("Sprint 218");
    expect(src).toContain("Sprint 219");
  });

  it("includes known contradictions", () => {
    expect(src).toContain("Contradictions");
  });

  it("includes questions for critique", () => {
    expect(src).toContain("Questions for External Critique");
  });
});

// ---------------------------------------------------------------------------
// 4. Post-launch infrastructure completeness
// ---------------------------------------------------------------------------
describe("Post-launch infrastructure", () => {
  it("launch readiness gate exists", () => {
    expect(fileExists("scripts/launch-readiness-gate.ts")).toBe(true);
  });

  it("launch day monitor exists", () => {
    expect(fileExists("scripts/launch-day-monitor.ts")).toBe(true);
  });

  it("rollback checklist exists", () => {
    expect(fileExists("scripts/rollback-checklist.ts")).toBe(true);
  });

  it("incident runbook exists", () => {
    expect(fileExists("docs/INCIDENT-RUNBOOK.md")).toBe(true);
  });

  it("city config exists", () => {
    expect(fileExists("shared/city-config.ts")).toBe(true);
  });

  it("alerting module exists", () => {
    expect(fileExists("server/alerting.ts")).toBe(true);
  });

  it("admin analytics routes extracted", () => {
    expect(fileExists("server/routes-admin-analytics.ts")).toBe(true);
  });

  it("security audit script exists", () => {
    expect(fileExists("scripts/pre-launch-security-audit.ts")).toBe(true);
  });

  it("smoke test script exists", () => {
    expect(fileExists("scripts/smoke-test.ts")).toBe(true);
  });
});
