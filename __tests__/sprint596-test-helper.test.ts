/**
 * Sprint 596: Test Helper for File Reads
 *
 * Tests:
 * 1. Helper module exists with all exports
 * 2. readFile works on known files
 * 3. countLines returns correct count
 * 4. fileExists detects presence/absence
 * 5. readJson parses JSON files
 * 6. getThresholds returns valid config
 * 7. Helper reduces per-test boilerplate
 */
import { describe, it, expect } from "vitest";
import { readFile, countLines, fileExists, fileSize, readJson, getThresholds } from "./helpers/read-source";

describe("Sprint 596: Test Helper Module", () => {
  it("readFile reads known file", () => {
    const pkg = readFile("package.json");
    expect(pkg).toContain("topranker");
  });

  it("countLines returns positive count", () => {
    const lines = countLines("shared/thresholds.json");
    expect(lines).toBeGreaterThan(10);
  });

  it("fileExists returns true for existing file", () => {
    expect(fileExists("package.json")).toBe(true);
  });

  it("fileExists returns false for missing file", () => {
    expect(fileExists("nonexistent-file.xyz")).toBe(false);
  });

  it("fileSize returns positive bytes", () => {
    const size = fileSize("package.json");
    expect(size).toBeGreaterThan(100);
  });

  it("readJson parses JSON", () => {
    const pkg = readJson<{ name: string }>("package.json");
    expect(pkg.name).toBeDefined();
  });

  it("getThresholds returns valid config", () => {
    const t = getThresholds();
    expect(Object.keys(t.files).length).toBeGreaterThan(20);
    expect(t.build.maxSizeKb).toBeGreaterThan(700);
    expect(t.tests.minCount).toBeGreaterThan(10000);
  });
});

describe("Sprint 596: Helper Usage in Source-Based Tests", () => {
  it("can read server source", () => {
    const src = readFile("server/index.ts");
    expect(src).toContain("express");
  });

  it("can check component extraction", () => {
    expect(fileExists("components/admin/ModerationItemCard.tsx")).toBe(true);
    const loc = countLines("components/admin/ModerationItemCard.tsx");
    expect(loc).toBeLessThan(220);
  });

  it("can verify build size from thresholds", () => {
    const t = getThresholds();
    expect(t.build.currentSizeKb).toBeLessThan(t.build.maxSizeKb);
  });

  it("can verify all tracked files under limits", () => {
    const t = getThresholds();
    for (const [path, config] of Object.entries(t.files)) {
      const loc = countLines(path);
      expect(loc).toBeLessThan(config.maxLOC);
    }
  });
});

describe("Sprint 596: Threshold Checks", () => {
  it("test count meets minimum", () => {
    const t = getThresholds();
    expect(t.tests.currentCount).toBeGreaterThanOrEqual(t.tests.minCount);
  });

  it("build size under max", () => {
    const t = getThresholds();
    expect(t.build.currentSizeKb).toBeLessThanOrEqual(t.build.maxSizeKb);
  });
});
