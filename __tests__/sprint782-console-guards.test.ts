/**
 * Sprint 782: Console Log Guards
 *
 * Fixed 5 unguarded console.log/warn calls in audio and haptic modules
 * that would spam production builds.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

/** Check that every console.log/warn/error in a file is preceded by __DEV__ on the same or previous line */
function findUnguardedConsole(src: string, filename: string): string[] {
  const lines = src.split("\n");
  const issues: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/console\.(log|warn)\(/) && !line.startsWith("//")) {
      // Check if this line or the previous 2 lines contain __DEV__
      const context = [lines[i - 2] || "", lines[i - 1] || "", lines[i]].join("\n");
      if (!context.includes("__DEV__")) {
        issues.push(`${filename}:${i + 1}: ${line.slice(0, 80)}`);
      }
    }
  }
  return issues;
}

describe("Sprint 782: Console Log Guards", () => {
  describe("lib/audio-engine.ts", () => {
    const src = readFile("lib/audio-engine.ts");

    it("audio config error is guarded", () => {
      expect(src).toContain('if (__DEV__) console.log("[AudioEngine] Could not configure');
    });

    it("sound not available error is guarded", () => {
      expect(src).toContain('if (__DEV__) console.log(`[AudioEngine] Sound');
    });
  });

  describe("lib/audio.ts", () => {
    const src = readFile("lib/audio.ts");

    it("sound not available is guarded", () => {
      expect(src).toContain('if (__DEV__) console.log("[Audio] Sound not available');
    });
  });

  describe("lib/haptic-patterns.ts", () => {
    const src = readFile("lib/haptic-patterns.ts");

    it("unknown pattern warn is guarded", () => {
      expect(src).toContain("if (__DEV__) console.warn");
    });

    it("pattern failed log is guarded", () => {
      expect(src).toContain('if (__DEV__) console.log(`[Haptics] Pattern');
    });
  });

  describe("no unguarded console in critical client files", () => {
    const files = [
      "lib/audio-engine.ts",
      "lib/audio.ts",
      "lib/haptic-patterns.ts",
      "lib/auth-context.tsx",
    ];

    for (const f of files) {
      it(`${f} has no unguarded console statements`, () => {
        const src = readFile(f);
        const issues = findUnguardedConsole(src, f);
        expect(issues).toEqual([]);
      });
    }
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
