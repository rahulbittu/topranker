/**
 * Sprint 558: Centralized threshold config — shared/thresholds.json
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 558: Centralized Threshold Config", () => {
  describe("thresholds.json structure", () => {
    const raw = readFile("shared/thresholds.json");
    const config = JSON.parse(raw);

    it("has files section", () => {
      expect(config.files).toBeDefined();
      expect(typeof config.files).toBe("object");
    });

    it("tracks at least 10 files", () => {
      expect(Object.keys(config.files).length).toBeGreaterThanOrEqual(10);
    });

    it("each file has maxLOC and current", () => {
      for (const [, v] of Object.entries(config.files)) {
        const file = v as { maxLOC: number; current: number };
        expect(file.maxLOC).toBeGreaterThan(0);
        expect(file.current).toBeGreaterThan(0);
        expect(file.current).toBeLessThan(file.maxLOC);
      }
    });

    it("has build section with maxSizeKb", () => {
      expect(config.build.maxSizeKb).toBeGreaterThan(0);
    });

    it("has tests section with minCount", () => {
      expect(config.tests.minCount).toBeGreaterThan(10000);
    });

    it("tracks key files", () => {
      expect(config.files["shared/schema.ts"]).toBeDefined();
      expect(config.files["server/routes.ts"]).toBeDefined();
      expect(config.files["lib/api.ts"]).toBeDefined();
      expect(config.files["app/(tabs)/index.tsx"]).toBeDefined();
    });

    it("has notes for each file", () => {
      for (const [, v] of Object.entries(config.files)) {
        const file = v as { notes: string };
        expect(file.notes).toBeDefined();
        expect(file.notes.length).toBeGreaterThan(0);
      }
    });
  });

  describe("file-health.test.ts", () => {
    const src = readFile("__tests__/file-health.test.ts");

    it("reads from shared/thresholds.json", () => {
      expect(src).toContain("thresholds.json");
    });

    it("iterates over thresholds.files dynamically", () => {
      expect(src).toContain("thresholds.files");
      expect(src).toContain("Object.entries");
    });

    it("checks build size", () => {
      expect(src).toContain("maxSizeKb");
    });

    it("checks test count floor", () => {
      expect(src).toContain("minCount");
    });
  });
});
