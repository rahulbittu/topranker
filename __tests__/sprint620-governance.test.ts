/**
 * Sprint 620: Governance cycle — SLT meeting, architecture audit, critique request
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 620 — Governance", () => {
  describe("SLT meeting", () => {
    const slt = readFile("docs/meetings/SLT-BACKLOG-620.md");

    it("exists", () => {
      expect(slt).toBeTruthy();
    });

    it("reviews sprints 616-619", () => {
      expect(slt).toContain("616");
      expect(slt).toContain("617");
      expect(slt).toContain("618");
      expect(slt).toContain("619");
    });

    it("includes attendees", () => {
      expect(slt).toContain("Marcus Chen");
      expect(slt).toContain("Rachel Wei");
      expect(slt).toContain("Amir Patel");
      expect(slt).toContain("Sarah Nakamura");
    });

    it("has roadmap 621-625", () => {
      expect(slt).toContain("621");
      expect(slt).toContain("622");
      expect(slt).toContain("623");
      expect(slt).toContain("624");
      expect(slt).toContain("625");
    });

    it("notes build size recovery", () => {
      expect(slt).toContain("109");
      expect(slt).toContain("625.7kb");
    });

    it("notes WhatsApp campaign GO", () => {
      expect(slt).toContain("WhatsApp campaign GO");
    });
  });

  describe("architecture audit", () => {
    const audit = readFile("docs/audits/ARCH-AUDIT-620.md");

    it("exists", () => {
      expect(audit).toBeTruthy();
    });

    it("grades A", () => {
      expect(audit).toContain("Grade: A");
    });

    it("has zero critical findings", () => {
      expect(audit).toContain("CRITICAL — None");
    });

    it("has zero high findings", () => {
      expect(audit).toContain("HIGH — None");
    });

    it("reviews all 4 sprints", () => {
      expect(audit).toContain("Sprint 616");
      expect(audit).toContain("Sprint 617");
      expect(audit).toContain("Sprint 618");
      expect(audit).toContain("Sprint 619");
    });

    it("notes build score improvement", () => {
      expect(audit).toContain("10/10");
      expect(audit).toContain("83.4%");
    });

    it("rates Sprint 619 as OUTSTANDING", () => {
      expect(audit).toContain("OUTSTANDING");
    });
  });

  describe("critique request", () => {
    const critique = readFile("docs/critique/inbox/SPRINT-616-619-REQUEST.md");

    it("exists", () => {
      expect(critique).toBeTruthy();
    });

    it("has 5 questions", () => {
      expect(critique).toContain("### 1.");
      expect(critique).toContain("### 2.");
      expect(critique).toContain("### 3.");
      expect(critique).toContain("### 4.");
      expect(critique).toContain("### 5.");
    });

    it("covers time plausibility visibility", () => {
      expect(critique).toContain("Time Plausibility");
    });

    it("covers just-rated quality", () => {
      expect(critique).toContain("Recency vs. Quality");
    });

    it("covers WhatsApp conversion", () => {
      expect(critique).toContain("Conversion Optimization");
    });

    it("covers build define concern", () => {
      expect(critique).toContain("Build Define");
    });

    it("covers attribution gap", () => {
      expect(critique).toContain("Attribution Gap");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 30 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(30);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });

    it("build recovered headroom", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(650);
    });

    it("11,000+ tests", () => {
      expect(thresholds.tests.currentCount).toBeGreaterThan(11000);
    });
  });
});
