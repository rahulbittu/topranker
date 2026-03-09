/**
 * Sprint 225 — SLT Quarterly Review + Architectural Audit #27
 *
 * Validates:
 * 1. SLT meeting document structure and content
 * 2. Architectural audit document grade and findings
 * 3. Sprint documentation completeness and cross-references
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. SLT-225 Meeting Doc
// ---------------------------------------------------------------------------
describe("SLT-225 meeting — docs/meetings/SLT-BACKLOG-225.md", () => {
  it("file exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-225.md")).toBe(true);
  });

  const src = readFile("docs/meetings/SLT-BACKLOG-225.md");

  it("contains SLT Quarterly Review title", () => {
    expect(src).toContain("SLT Quarterly Review");
  });

  it("reviews Sprint 221-224", () => {
    expect(src).toContain("221");
    expect(src).toContain("222");
    expect(src).toContain("223");
    expect(src).toContain("224");
  });

  it("references all attendees", () => {
    expect(src).toContain("Marcus Chen");
    expect(src).toContain("Rachel Wei");
    expect(src).toContain("Sarah Nakamura");
    expect(src).toContain("David Okonkwo");
  });

  it("contains department reports section", () => {
    expect(src).toContain("Department Report");
  });

  it("contains next sprint roadmap 226-230", () => {
    expect(src).toContain("226");
    expect(src).toContain("227");
    expect(src).toContain("228");
    expect(src).toContain("229");
    expect(src).toContain("230");
  });

  it("references OKC beta decision", () => {
    expect(src).toContain("OKC");
  });

  it("references New Orleans expansion target", () => {
    expect(src).toContain("New Orleans");
  });

  it("contains action items table", () => {
    expect(src).toContain("Action Item");
  });

  it("references email tracking wire as P0", () => {
    expect(src).toContain("email");
    expect(src).toContain("P0");
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture Audit #27
// ---------------------------------------------------------------------------
describe("Arch Audit #27 — docs/audits/ARCH-AUDIT-225.md", () => {
  it("file exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-225.md")).toBe(true);
  });

  const src = readFile("docs/audits/ARCH-AUDIT-225.md");

  it("grade is A", () => {
    expect(src).toContain("Grade: A");
  });

  it("has 0 critical findings", () => {
    expect(src).toContain("0 Critical");
  });

  it("has 0 high findings", () => {
    expect(src).toContain("0 High");
  });

  it("references email module proliferation", () => {
    expect(src).toContain("email");
  });

  it("references in-memory stores", () => {
    expect(src).toContain("in-memory");
  });

  it("has metrics table with test count", () => {
    expect(src.includes("4,088") || src.includes("4088")).toBe(true);
  });

  it("references next audit at Sprint 230", () => {
    expect(src).toContain("230");
  });

  it("grade history includes 4 entries", () => {
    const gradeHistorySection = src.slice(src.indexOf("Grade History"));
    const gradeMatches = gradeHistorySection.match(/\| #\d+/g);
    expect(gradeMatches).not.toBeNull();
    expect(gradeMatches!.length).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// 3. Sprint documentation completeness
// ---------------------------------------------------------------------------
describe("Sprint 225 documentation completeness", () => {
  it("both meeting and audit docs exist", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-225.md")).toBe(true);
    expect(fileExists("docs/audits/ARCH-AUDIT-225.md")).toBe(true);
  });

  it("meeting doc references audit #27 or ARCH-AUDIT-225", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-225.md");
    expect(src.includes("#27") || src.includes("ARCH-AUDIT-225")).toBe(true);
  });

  it("audit doc references previous audit #26 or Sprint 220", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-225.md");
    expect(src.includes("#26") || src.includes("220")).toBe(true);
  });
});
