/**
 * Sprint 570: Governance — SLT-570 + Arch Audit #72 + Critique 566-569
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const fileExists = (relPath: string) => fs.existsSync(path.join(ROOT, relPath));

describe("Sprint 570: Governance", () => {
  describe("SLT-BACKLOG-570", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-570.md");

    it("exists and has correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 570");
    });

    it("reviews sprints 566-569", () => {
      expect(src).toContain("Sprint 566");
      expect(src).toContain("Sprint 567");
      expect(src).toContain("Sprint 568");
      expect(src).toContain("Sprint 569");
    });

    it("has delivery score", () => {
      expect(src).toContain("Delivery Score: 4/4");
    });

    it("has roadmap for 571-575", () => {
      expect(src).toContain("571");
      expect(src).toContain("572");
      expect(src).toContain("573");
      expect(src).toContain("574");
      expect(src).toContain("575");
    });

    it("has current metrics", () => {
      expect(src).toContain("10,744 tests");
      expect(src).toContain("712.1kb");
    });

    it("flags search.tsx at 99% threshold", () => {
      expect(src).toContain("99%");
      expect(src).toContain("search.tsx");
    });

    it("has all 4 attendees", () => {
      expect(src).toContain("Marcus Chen");
      expect(src).toContain("Rachel Wei");
      expect(src).toContain("Amir Patel");
      expect(src).toContain("Sarah Nakamura");
    });
  });

  describe("Arch Audit #72", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-570.md");

    it("exists with correct header", () => {
      expect(src).toContain("Architecture Audit #72");
    });

    it("has grade A", () => {
      expect(src).toContain("Overall Grade: A");
    });

    it("reports 0 critical findings", () => {
      expect(src).toContain("Critical: 0");
    });

    it("reports 0 high findings", () => {
      expect(src).toContain("High: 0");
    });

    it("flags search.tsx as low finding", () => {
      expect(src).toContain("search.tsx at 99%");
    });

    it("includes file health table with 19 files", () => {
      expect(src).toContain("19 tracked files");
    });

    it("includes build health metrics", () => {
      expect(src).toContain("712.1kb");
      expect(src).toContain("10,744");
    });
  });

  describe("Critique Request 566-569", () => {
    const src = readFile("docs/critique/inbox/SPRINT-566-569-REQUEST.md");

    it("exists with correct header", () => {
      expect(src).toContain("Critique Request: Sprints 566-569");
    });

    it("covers all 4 sprints", () => {
      expect(src).toContain("566");
      expect(src).toContain("567");
      expect(src).toContain("568");
      expect(src).toContain("569");
    });

    it("has 5 questions for review", () => {
      expect(src).toContain("### 1.");
      expect(src).toContain("### 2.");
      expect(src).toContain("### 3.");
      expect(src).toContain("### 4.");
      expect(src).toContain("### 5.");
    });

    it("asks about city stats freshness", () => {
      expect(src).toContain("stale time");
    });

    it("asks about credibility breakdown security", () => {
      expect(src).toContain("reverse-engineering");
    });

    it("asks about search.tsx threshold", () => {
      expect(src).toContain("99%");
    });
  });

  describe("thresholds health", () => {
    const config = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 19 files", () => {
      expect(Object.keys(config.files).length).toBe(19);
    });

    it("no file exceeds its maxLOC", () => {
      for (const [filePath, meta] of Object.entries(config.files)) {
        const { maxLOC, current } = meta as { maxLOC: number; current: number };
        expect(current, `${filePath} exceeds maxLOC`).toBeLessThanOrEqual(maxLOC);
      }
    });

    it("build size within threshold", () => {
      expect(config.build.currentSizeKb).toBeLessThanOrEqual(config.build.maxSizeKb);
    });

    it("test count meets minimum", () => {
      expect(config.tests.currentCount).toBeGreaterThanOrEqual(config.tests.minCount);
    });
  });

  describe("sprint doc completeness (566-569)", () => {
    it("Sprint 566 doc exists", () => {
      expect(fileExists("docs/sprints/SPRINT-566-DISH-PHOTO-INTEGRATION.md")).toBe(true);
    });

    it("Sprint 567 doc exists", () => {
      expect(fileExists("docs/sprints/SPRINT-567-VELOCITY-WIDGET.md")).toBe(true);
    });

    it("Sprint 568 doc exists", () => {
      expect(fileExists("docs/sprints/SPRINT-568-CITY-COMPARISON-OVERLAY.md")).toBe(true);
    });

    it("Sprint 569 doc exists", () => {
      expect(fileExists("docs/sprints/SPRINT-569-CREDIBILITY-TOOLTIP.md")).toBe(true);
    });

    it("Sprint 566 retro exists", () => {
      expect(fileExists("docs/retros/RETRO-566-DISH-PHOTO-INTEGRATION.md")).toBe(true);
    });

    it("Sprint 567 retro exists", () => {
      expect(fileExists("docs/retros/RETRO-567-VELOCITY-WIDGET.md")).toBe(true);
    });

    it("Sprint 568 retro exists", () => {
      expect(fileExists("docs/retros/RETRO-568-CITY-COMPARISON-OVERLAY.md")).toBe(true);
    });

    it("Sprint 569 retro exists", () => {
      expect(fileExists("docs/retros/RETRO-569-CREDIBILITY-TOOLTIP.md")).toBe(true);
    });
  });
});
