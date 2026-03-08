/**
 * Sprint 114 — Dark Mode Component Migration, WebSocket Evaluation, SLT Prep
 * Themed Styles Utility, Tab Theme Integration, Evaluation Docs, CHANGELOG
 *
 * Owner: Sarah Nakamura (Lead Engineer), Leo Hernandez (Design)
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. Themed Styles Utility ────────────────────────────────────────
describe("Themed Styles Utility", () => {
  it("themed-styles.ts exists", () => {
    const filePath = path.resolve(__dirname, "..", "lib/themed-styles.ts");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("exports createThemedStyles function", () => {
    const content = fs.readFileSync(path.resolve(__dirname, "..", "lib/themed-styles.ts"), "utf-8");
    expect(content).toContain("export function createThemedStyles");
  });

  it("exports useThemedStyles hook", () => {
    const content = fs.readFileSync(path.resolve(__dirname, "..", "lib/themed-styles.ts"), "utf-8");
    expect(content).toContain("export function useThemedStyles");
  });

  it("imports from theme-context", () => {
    const content = fs.readFileSync(path.resolve(__dirname, "..", "lib/themed-styles.ts"), "utf-8");
    expect(content).toContain("theme-context");
  });
});

// ── 2. Tab Theme Integration ────────────────────────────────────────
describe("Tab Theme Integration", () => {
  const tabFiles = [
    { name: "index.tsx", path: "app/(tabs)/index.tsx" },
    { name: "search.tsx", path: "app/(tabs)/search.tsx" },
    { name: "challenger.tsx", path: "app/(tabs)/challenger.tsx" },
    { name: "profile.tsx", path: "app/(tabs)/profile.tsx" },
  ];

  for (const tab of tabFiles) {
    it(`${tab.name} imports useThemeColors`, () => {
      const filePath = path.resolve(__dirname, "..", tab.path);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("useThemeColors");
    });
  }

  for (const tab of tabFiles) {
    it(`${tab.name} imports from theme-context`, () => {
      const filePath = path.resolve(__dirname, "..", tab.path);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("theme-context");
    });
  }
});

// ── 3. WebSocket Evaluation ─────────────────────────────────────────
describe("WebSocket Evaluation", () => {
  const evalPath = path.resolve(__dirname, "..", "docs/evaluations/WEBSOCKET-EVAL.md");

  it("evaluation doc exists", () => {
    expect(fs.existsSync(evalPath)).toBe(true);
  });

  it("evaluation doc mentions SSE", () => {
    const content = fs.readFileSync(evalPath, "utf-8");
    expect(content).toContain("SSE");
  });

  it("evaluation doc mentions WebSocket", () => {
    const content = fs.readFileSync(evalPath, "utf-8");
    expect(content).toContain("WebSocket");
  });

  it("evaluation doc has decision status", () => {
    const content = fs.readFileSync(evalPath, "utf-8");
    expect(content).toContain("DEFERRED");
  });

  it("evaluation doc mentions trigger thresholds", () => {
    const content = fs.readFileSync(evalPath, "utf-8");
    expect(content).toContain("10,000");
  });

  it("evaluation doc covers migration path", () => {
    const content = fs.readFileSync(evalPath, "utf-8");
    expect(content.toLowerCase()).toContain("migration");
  });
});

// ── 4. SLT Meeting Prep ─────────────────────────────────────────────
describe("SLT Meeting Prep — Sprint 115", () => {
  const sltPath = path.resolve(__dirname, "..", "docs/meetings/SLT-BACKLOG-115.md");

  it("SLT meeting doc exists", () => {
    expect(fs.existsSync(sltPath)).toBe(true);
  });

  it("SLT doc includes attendees", () => {
    const content = fs.readFileSync(sltPath, "utf-8");
    expect(content).toContain("Marcus Chen");
    expect(content).toContain("Rachel Wei");
    expect(content).toContain("Amir Patel");
    expect(content).toContain("Sarah Nakamura");
  });

  it("SLT doc references Sprint 110 through 114", () => {
    const content = fs.readFileSync(sltPath, "utf-8");
    expect(content).toContain("110");
    expect(content).toContain("114");
  });

  it("SLT doc sets next meeting at Sprint 120", () => {
    const content = fs.readFileSync(sltPath, "utf-8");
    expect(content).toContain("120");
  });

  it("SLT doc reviews sprint themes", () => {
    const content = fs.readFileSync(sltPath, "utf-8");
    expect(content).toContain("Error Boundar");
    expect(content).toContain("Dark Mode");
  });
});

// ── 5. CHANGELOG Coverage ───────────────────────────────────────────
describe("CHANGELOG Coverage", () => {
  const changelogPath = path.resolve(__dirname, "..", "CHANGELOG.md");

  it("CHANGELOG exists", () => {
    expect(fs.existsSync(changelogPath)).toBe(true);
  });

  it("CHANGELOG has Sprint 112 entry", () => {
    const content = fs.readFileSync(changelogPath, "utf-8");
    expect(content).toContain("Sprint 112");
  });

  it("CHANGELOG has Sprint 113 entry", () => {
    const content = fs.readFileSync(changelogPath, "utf-8");
    expect(content).toContain("Sprint 113");
  });

  it("CHANGELOG entries are in reverse chronological order", () => {
    const content = fs.readFileSync(changelogPath, "utf-8");
    const idx113 = content.indexOf("Sprint 113");
    const idx112 = content.indexOf("Sprint 112");
    expect(idx113).toBeLessThan(idx112);
  });
});
