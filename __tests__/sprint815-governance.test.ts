/**
 * Sprint 815: Governance — SLT Meeting + Architectural Audit + Critique Request
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function fileExists(rel: string): boolean {
  return fs.existsSync(path.resolve(process.cwd(), rel));
}

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 815: Governance", () => {
  describe("SLT meeting", () => {
    it("SLT-815 document exists", () => {
      expect(fileExists("docs/meetings/SLT-BACKLOG-815.md")).toBe(true);
    });

    it("includes critique closure summary", () => {
      const doc = readFile("docs/meetings/SLT-BACKLOG-815.md");
      expect(doc).toContain("Critique Closure Summary");
    });

    it("includes roadmap 816-820", () => {
      const doc = readFile("docs/meetings/SLT-BACKLOG-815.md");
      expect(doc).toContain("816");
      expect(doc).toContain("820");
    });
  });

  describe("architectural audit", () => {
    it("ARCH-AUDIT-815 document exists", () => {
      expect(fileExists("docs/audits/ARCH-AUDIT-815.md")).toBe(true);
    });

    it("grade is A", () => {
      const doc = readFile("docs/audits/ARCH-AUDIT-815.md");
      expect(doc).toContain("Grade: A");
    });

    it("zero critical/high/medium findings", () => {
      const doc = readFile("docs/audits/ARCH-AUDIT-815.md");
      expect(doc).toContain("CRITICAL — 0");
      expect(doc).toContain("HIGH — 0");
      expect(doc).toContain("MEDIUM — 0");
    });

    it("open critique items is 0", () => {
      const doc = readFile("docs/audits/ARCH-AUDIT-815.md");
      expect(doc).toContain("Open critique items | 0");
    });
  });

  describe("critique request", () => {
    it("critique request exists", () => {
      expect(fileExists("docs/critique/inbox/SPRINT-810-814-REQUEST.md")).toBe(true);
    });

    it("includes critique closure sections", () => {
      const doc = readFile("docs/critique/inbox/SPRINT-810-814-REQUEST.md");
      expect(doc).toContain("790-794 Closure");
      expect(doc).toContain("795-799 Closure");
      expect(doc).toContain("800-804 Closure");
      expect(doc).toContain("805-809 Closure");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
