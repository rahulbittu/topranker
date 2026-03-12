/**
 * Sprint 810: Governance — SLT Meeting + Architectural Audit + Critique Request
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

describe("Sprint 810: Governance", () => {
  describe("SLT meeting", () => {
    it("SLT-810 document exists", () => {
      expect(fileExists("docs/meetings/SLT-BACKLOG-810.md")).toBe(true);
    });

    it("includes roadmap 811-815", () => {
      const doc = readFile("docs/meetings/SLT-BACKLOG-810.md");
      expect(doc).toContain("811");
      expect(doc).toContain("815");
    });

    it("includes action items", () => {
      const doc = readFile("docs/meetings/SLT-BACKLOG-810.md");
      expect(doc).toContain("Action Items");
    });
  });

  describe("architectural audit", () => {
    it("ARCH-AUDIT-810 document exists", () => {
      expect(fileExists("docs/audits/ARCH-AUDIT-810.md")).toBe(true);
    });

    it("covers sprints 806-809", () => {
      const doc = readFile("docs/audits/ARCH-AUDIT-810.md");
      expect(doc).toContain("806");
      expect(doc).toContain("809");
    });

    it("grade is A", () => {
      const doc = readFile("docs/audits/ARCH-AUDIT-810.md");
      expect(doc).toContain("Grade: A");
    });

    it("zero critical findings", () => {
      const doc = readFile("docs/audits/ARCH-AUDIT-810.md");
      expect(doc).toContain("CRITICAL — 0");
    });

    it("zero high findings", () => {
      const doc = readFile("docs/audits/ARCH-AUDIT-810.md");
      expect(doc).toContain("HIGH — 0");
    });
  });

  describe("critique request", () => {
    it("critique request exists", () => {
      expect(fileExists("docs/critique/inbox/SPRINT-805-809-REQUEST.md")).toBe(true);
    });

    it("includes questions for review", () => {
      const doc = readFile("docs/critique/inbox/SPRINT-805-809-REQUEST.md");
      expect(doc).toContain("Questions for External Review");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
