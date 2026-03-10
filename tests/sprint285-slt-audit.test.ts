/**
 * Sprint 285 — SLT Review + Arch Audit #39
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const fileExists = (relPath: string) => fs.existsSync(path.join(ROOT, relPath));
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 285: Governance Docs", () => {
  it("SLT-BACKLOG-285.md exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-285.md")).toBe(true);
  });

  it("ARCH-AUDIT-39.md exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-39.md")).toBe(true);
  });

  it("critique request 280-284 exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-280-284-REQUEST.md")).toBe(true);
  });

  it("SLT has roadmap 286-290", () => {
    const slt = readFile("docs/meetings/SLT-BACKLOG-285.md");
    expect(slt).toContain("Sprint Roadmap 286-290");
  });

  it("audit grade is A (15th consecutive)", () => {
    const audit = readFile("docs/audits/ARCH-AUDIT-39.md");
    expect(audit).toContain("15th consecutive A-range");
  });

  it("SLT references cuisine expansion", () => {
    const slt = readFile("docs/meetings/SLT-BACKLOG-285.md");
    expect(slt).toContain("48");
    expect(slt).toContain("cuisine");
  });
});

describe("Sprint 285: Sprint Docs 281-284 Exist", () => {
  for (const n of [281, 282, 283, 284]) {
    it(`SPRINT-${n} doc exists`, () => {
      const files = fs.readdirSync(path.join(ROOT, "docs/sprints"));
      expect(files.some(f => f.startsWith(`SPRINT-${n}`))).toBe(true);
    });
    it(`RETRO-${n} doc exists`, () => {
      const files = fs.readdirSync(path.join(ROOT, "docs/retros"));
      expect(files.some(f => f.startsWith(`RETRO-${n}`))).toBe(true);
    });
  }
});
