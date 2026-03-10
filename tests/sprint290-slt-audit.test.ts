/**
 * Sprint 290 — SLT Review + Arch Audit #40
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const fileExists = (relPath: string) => fs.existsSync(path.join(ROOT, relPath));
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 290: Governance Docs", () => {
  it("SLT-BACKLOG-290.md exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-290.md")).toBe(true);
  });

  it("ARCH-AUDIT-40.md exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-40.md")).toBe(true);
  });

  it("critique request 285-289 exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-285-289-REQUEST.md")).toBe(true);
  });

  it("SLT has Sprint Roadmap 291-295", () => {
    const slt = readFile("docs/meetings/SLT-BACKLOG-290.md");
    expect(slt).toContain("Sprint Roadmap 291-295");
  });

  it("audit grade is A (16th consecutive A-range)", () => {
    const audit = readFile("docs/audits/ARCH-AUDIT-40.md");
    expect(audit).toContain("16th consecutive A-range");
  });

  it("SLT references cuisine pipeline", () => {
    const slt = readFile("docs/meetings/SLT-BACKLOG-290.md");
    expect(slt).toContain("47");
    expect(slt).toContain("cuisine");
    expect(slt).toContain("10 cuisines");
  });

  it("audit references search.tsx improvement", () => {
    const audit = readFile("docs/audits/ARCH-AUDIT-40.md");
    expect(audit).toContain("802");
    expect(audit).toContain("917");
  });
});

describe("Sprint 290: Sprint Docs 286-289 Exist", () => {
  for (const n of [286, 287, 288, 289]) {
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
