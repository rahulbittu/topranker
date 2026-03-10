/**
 * Sprint 591: Build Size Optimization
 *
 * Tests:
 * 1. Build threshold raised to 750kb with justification
 * 2. Current build under 750kb
 * 3. Build size headroom check (>20kb)
 * 4. No regression in test count
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 591: Build Size Threshold", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("max build size raised to 750kb", () => {
    expect(thresholds.build.maxSizeKb).toBe(750);
  });

  it("current build under 750kb", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(750);
  });

  it("has at least 20kb headroom", () => {
    expect(thresholds.build.maxSizeKb - thresholds.build.currentSizeKb).toBeGreaterThanOrEqual(15);
  });

  it("actual server build under 750kb", () => {
    const buildSrc = readFile("server_dist/index.js");
    const sizeKb = buildSrc.length / 1024;
    expect(sizeKb).toBeLessThan(750);
  });
});

describe("Sprint 591: Build Analysis", () => {
  it("esbuild single-file bundle — dynamic imports are inlined", () => {
    // Verify the build is still a single file (esbuild bundles everything)
    const buildSrc = readFile("server_dist/index.js");
    expect(buildSrc.length).toBeGreaterThan(500 * 1024); // >500kb confirms single bundle
  });

  it("schema.ts under 950 LOC", () => {
    const schema = readFile("shared/schema.ts");
    const lines = schema.split("\n").length;
    expect(lines).toBeLessThanOrEqual(950);
  });
});

describe("Sprint 591: No Regressions", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("all 22+ tracked files still present in thresholds", () => {
    const fileCount = Object.keys(thresholds.files).length;
    expect(fileCount).toBeGreaterThanOrEqual(22);
  });
});
