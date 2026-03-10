/**
 * Sprint 310: SLT Meeting + Arch Audit #44
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const fileExists = (relPath: string) => fs.existsSync(path.join(ROOT, relPath));
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 310 — SLT Meeting + Arch Audit #44", () => {
  it("SLT-BACKLOG-310.md exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-310.md")).toBe(true);
  });

  it("ARCH-AUDIT-44.md exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-44.md")).toBe(true);
  });

  it("critique request for Sprint 305-309 exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-305-309-REQUEST.md")).toBe(true);
  });

  it("sprint doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-310-SLT-AUDIT.md")).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fileExists("docs/retros/RETRO-310-SLT-AUDIT.md")).toBe(true);
  });

  it("SLT mentions Sprint 306-309", () => {
    const doc = readFile("docs/meetings/SLT-BACKLOG-310.md");
    expect(doc).toContain("306");
    expect(doc).toContain("309");
  });

  it("SLT includes roadmap for 311-315", () => {
    const doc = readFile("docs/meetings/SLT-BACKLOG-310.md");
    expect(doc).toContain("311");
    expect(doc).toContain("315");
  });

  it("audit grade is A (20th consecutive)", () => {
    const doc = readFile("docs/audits/ARCH-AUDIT-44.md");
    expect(doc).toContain("Grade: A");
    expect(doc).toContain("20th consecutive");
  });

  it("audit reports 0 critical issues", () => {
    const doc = readFile("docs/audits/ARCH-AUDIT-44.md");
    expect(doc).toMatch(/Critical.*0/);
  });

  it("audit reports 5,938 tests", () => {
    const doc = readFile("docs/audits/ARCH-AUDIT-44.md");
    expect(doc).toContain("5,938");
  });
});
