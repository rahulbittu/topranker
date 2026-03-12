/**
 * Sprint 770: Governance Cycle
 * SLT meeting, architectural audit, critique request
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

describe("Sprint 770: Governance", () => {
  describe("SLT meeting", () => {
    it("SLT-770 exists", () => {
      expect(fileExists("docs/meetings/SLT-BACKLOG-770.md")).toBe(true);
    });

    it("has roadmap for 771-775", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-770.md");
      expect(slt).toContain("771");
      expect(slt).toContain("772");
      expect(slt).toContain("773");
      expect(slt).toContain("774");
      expect(slt).toContain("775");
    });
  });

  describe("Architectural audit", () => {
    it("ARCH-AUDIT-770 exists", () => {
      expect(fileExists("docs/audits/ARCH-AUDIT-770.md")).toBe(true);
    });

    it("has grade A", () => {
      const audit = readFile("docs/audits/ARCH-AUDIT-770.md");
      expect(audit).toContain("Grade: A");
    });
  });

  describe("Critique request", () => {
    it("critique request exists", () => {
      expect(fileExists("docs/critique/inbox/SPRINT-761-769-REQUEST.md")).toBe(true);
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});
