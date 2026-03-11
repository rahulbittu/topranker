/**
 * Sprint 616: Time-on-page indicator for rating flow
 * Validates TimeOnPageIndicator component + integration with RatingExtrasStep + rate/[id].tsx
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 616 — Time-on-Page Indicator", () => {
  const tiSrc = readFile("components/rate/TimeOnPageIndicator.tsx");
  const extrasSrc = readFile("components/rate/RatingExtrasStep.tsx");
  const rateSrc = readFile("app/rate/[id].tsx");

  describe("TimeOnPageIndicator component", () => {
    it("exists as standalone file", () => {
      expect(tiSrc).toBeTruthy();
    });

    it("exports TimeOnPageIndicator function", () => {
      expect(tiSrc).toContain("export function TimeOnPageIndicator");
    });

    it("accepts startedAt prop", () => {
      expect(tiSrc).toContain("startedAt: number");
    });

    it("uses 30-second boost threshold", () => {
      expect(tiSrc).toContain("BOOST_THRESHOLD_S = 30");
    });

    it("shows +5% boost text", () => {
      expect(tiSrc).toContain("+5%");
    });

    it("shows time boost earned message", () => {
      expect(tiSrc).toContain("Time boost earned");
    });

    it("shows progress bar when not earned", () => {
      expect(tiSrc).toContain("barOuter");
      expect(tiSrc).toContain("barInner");
    });

    it("uses shield-checkmark icon when earned", () => {
      expect(tiSrc).toContain("shield-checkmark");
    });

    it("uses time-outline icon before earned", () => {
      expect(tiSrc).toContain("time-outline");
    });

    it("has hint text about 30s threshold", () => {
      expect(tiSrc).toContain("Spend 30s+ for a time plausibility boost");
    });

    it("stays under 100 LOC", () => {
      const loc = tiSrc.split("\n").length;
      expect(loc).toBeLessThan(100);
    });
  });

  describe("RatingExtrasStep integration", () => {
    it("imports TimeOnPageIndicator", () => {
      expect(extrasSrc).toContain("TimeOnPageIndicator");
    });

    it("accepts pageEnteredAt prop", () => {
      expect(extrasSrc).toContain("pageEnteredAt");
    });

    it("renders TimeOnPageIndicator with startedAt", () => {
      expect(extrasSrc).toContain("<TimeOnPageIndicator");
    });

    it("stays under 550 LOC", () => {
      const loc = extrasSrc.split("\n").length;
      expect(loc).toBeLessThan(550);
    });
  });

  describe("rate/[id].tsx integration", () => {
    it("passes pageEnteredAt to RatingExtrasStep", () => {
      expect(rateSrc).toContain("pageEnteredAt={pageEnteredAt}");
    });
  });

  describe("thresholds", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks TimeOnPageIndicator", () => {
      expect(thresholds.files["components/rate/TimeOnPageIndicator.tsx"]).toBeDefined();
    });

    it("tracks 27 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(27);
    });

    it("server build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});
