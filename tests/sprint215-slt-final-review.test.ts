/**
 * Sprint 215 — SLT Final Review → Public Launch
 *
 * Validates:
 * 1. Launch readiness gate script
 * 2. SLT meeting document
 * 3. Architecture audit #25
 * 4. Critique request for 210-214
 * 5. Complete launch infrastructure
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Launch readiness gate script
// ---------------------------------------------------------------------------
describe("Launch readiness gate — scripts/launch-readiness-gate.ts", () => {
  it("script exists", () => {
    expect(fileExists("scripts/launch-readiness-gate.ts")).toBe(true);
  });

  const src = readFile("scripts/launch-readiness-gate.ts");

  it("checks security infrastructure", () => {
    expect(src).toContain("pre-launch-security-audit");
    expect(src).toContain("smoke-test");
    expect(src).toContain("rate-limiter");
    expect(src).toContain("sanitize");
  });

  it("checks core application files", () => {
    expect(src).toContain("server/index.ts");
    expect(src).toContain("server/routes.ts");
    expect(src).toContain("server/routes-admin.ts");
  });

  it("checks schema completeness", () => {
    expect(src).toContain("members");
    expect(src).toContain("businesses");
    expect(src).toContain("ratings");
    expect(src).toContain("challengers");
    expect(src).toContain("payments");
    expect(src).toContain("analyticsEvents");
  });

  it("checks GDPR compliance in schema", () => {
    expect(src).toContain("deletionRequests");
  });

  it("checks legal documents", () => {
    expect(src).toContain("privacy");
    expect(src).toContain("terms");
  });

  it("checks launch documentation", () => {
    expect(src).toContain("LAUNCH-CHECKLIST");
    expect(src).toContain("APP-STORE-METADATA");
    expect(src).toContain("PR-STRATEGY");
  });

  it("checks CI pipeline", () => {
    expect(src).toContain("ci.yml");
  });

  it("checks UX screens", () => {
    expect(src).toContain("(tabs)/index.tsx");
    expect(src).toContain("(tabs)/search.tsx");
    expect(src).toContain("(tabs)/challenger.tsx");
    expect(src).toContain("(tabs)/profile.tsx");
    expect(src).toContain("business/[id].tsx");
    expect(src).toContain("feedback.tsx");
    expect(src).toContain("about.tsx");
  });

  it("outputs launch readiness verdict", () => {
    expect(src).toContain("LAUNCH READY");
  });

  it("exits with code 1 on failure", () => {
    expect(src).toContain("process.exit(");
  });
});

// ---------------------------------------------------------------------------
// 2. SLT-215 final review meeting
// ---------------------------------------------------------------------------
describe("SLT-215 Final Review — docs/meetings/SLT-BACKLOG-215.md", () => {
  it("meeting document exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-215.md")).toBe(true);
  });

  const src = readFile("docs/meetings/SLT-BACKLOG-215.md");

  it("includes all SLT attendees", () => {
    expect(src).toContain("Marcus Chen");
    expect(src).toContain("Rachel Wei");
    expect(src).toContain("Amir Patel");
    expect(src).toContain("Sarah Nakamura");
    expect(src).toContain("Jasmine Taylor");
    expect(src).toContain("Nadia Kaur");
    expect(src).toContain("Jordan Blake");
    expect(src).toContain("Leo Hernandez");
  });

  it("reviews Sprint 211-214", () => {
    expect(src).toContain("211");
    expect(src).toContain("212");
    expect(src).toContain("213");
    expect(src).toContain("214");
  });

  it("evaluates SLT-210 conditions", () => {
    expect(src).toContain("Wave 3");
    expect(src).toContain("15%");
    expect(src).toContain("MET");
  });

  it("includes launch readiness matrix", () => {
    expect(src).toContain("READY");
    expect(src).toContain("Engineering");
    expect(src).toContain("Security");
    expect(src).toContain("Marketing");
    expect(src).toContain("Compliance");
  });

  it("contains GO decision", () => {
    expect(src).toContain("UNCONDITIONAL GO");
  });

  it("includes launch timeline", () => {
    expect(src).toContain("T-7");
    expect(src).toContain("T-0");
    expect(src).toContain("LAUNCH DAY");
  });

  it("includes post-launch roadmap", () => {
    expect(src).toContain("216");
    expect(src).toContain("217");
    expect(src).toContain("218");
    expect(src).toContain("219");
    expect(src).toContain("220");
  });
});

// ---------------------------------------------------------------------------
// 3. Architecture audit #25
// ---------------------------------------------------------------------------
describe("Architecture Audit #25 — docs/audits/ARCH-AUDIT-215.md", () => {
  it("audit document exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-215.md")).toBe(true);
  });

  const src = readFile("docs/audits/ARCH-AUDIT-215.md");

  it("grade is A", () => {
    expect(src).toContain("Grade:** A");
  });

  it("has zero critical findings", () => {
    expect(src).toContain("No Critical");
  });

  it("has zero high findings", () => {
    expect(src).toContain("No High");
  });

  it("tracks routes-admin.ts growth", () => {
    expect(src).toContain("638");
    expect(src).toContain("routes-admin");
  });

  it("includes metrics comparison", () => {
    expect(src).toContain("Sprint 210");
    expect(src).toContain("Sprint 215");
    expect(src).toContain("3,815");
  });

  it("includes grade history", () => {
    expect(src).toContain("#24");
    expect(src).toContain("#25");
  });
});

// ---------------------------------------------------------------------------
// 4. Critique request for 210-214
// ---------------------------------------------------------------------------
describe("Critique request — docs/critique/inbox/SPRINT-210-214-REQUEST.md", () => {
  it("critique request exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-210-214-REQUEST.md")).toBe(true);
  });

  const src = readFile("docs/critique/inbox/SPRINT-210-214-REQUEST.md");

  it("covers Sprints 210-214", () => {
    expect(src).toContain("Sprint 210");
    expect(src).toContain("Sprint 211");
    expect(src).toContain("Sprint 212");
    expect(src).toContain("Sprint 213");
    expect(src).toContain("Sprint 214");
  });

  it("includes known contradictions", () => {
    expect(src).toContain("Contradictions");
  });

  it("includes questions for critique", () => {
    expect(src).toContain("Questions for External Critique");
  });

  it("lists changed files", () => {
    expect(src).toContain("Changed Files");
  });
});

// ---------------------------------------------------------------------------
// 5. Complete launch infrastructure verification
// ---------------------------------------------------------------------------
describe("Launch infrastructure completeness", () => {
  it("security audit script exists", () => {
    expect(fileExists("scripts/pre-launch-security-audit.ts")).toBe(true);
  });

  it("smoke test script exists", () => {
    expect(fileExists("scripts/smoke-test.ts")).toBe(true);
  });

  it("launch readiness gate exists", () => {
    expect(fileExists("scripts/launch-readiness-gate.ts")).toBe(true);
  });

  it("launch checklist exists", () => {
    expect(fileExists("docs/LAUNCH-CHECKLIST.md")).toBe(true);
  });

  it("app store metadata exists", () => {
    expect(fileExists("docs/APP-STORE-METADATA.md")).toBe(true);
  });

  it("PR strategy exists", () => {
    expect(fileExists("docs/PR-STRATEGY.md")).toBe(true);
  });

  it("CI pipeline exists", () => {
    expect(fileExists(".github/workflows/ci.yml")).toBe(true);
  });

  it("feedback form exists", () => {
    expect(fileExists("app/feedback.tsx")).toBe(true);
  });

  it("about page exists", () => {
    expect(fileExists("app/about.tsx")).toBe(true);
  });
});
