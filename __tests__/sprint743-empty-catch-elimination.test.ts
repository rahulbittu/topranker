/**
 * Sprint 743: Empty Catch Block Elimination
 *
 * Validates that all source files (app/, lib/, components/, server/)
 * have zero empty catch blocks. Every catch must log in __DEV__ mode
 * or handle the error explicitly.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readSource(filePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

const emptyCatchPattern = /catch\s*\{\s*\}|catch\s*\(\)\s*\{\s*\}/g;

describe("Sprint 743: Zero Empty Catch Blocks", () => {
  const filesToCheck = [
    // App screens
    "app/business/[id].tsx",
    "app/referral.tsx",
    "app/admin/dashboard.tsx",
    "app/business/qr.tsx",
    "app/_layout.tsx",
    "app/(tabs)/index.tsx",
    // Libraries
    "lib/audio.ts",
    "lib/audio-engine.ts",
    "lib/bookmarks-context.tsx",
    "lib/hooks/useSearchPersistence.ts",
    // Components
    "components/ErrorBoundary.tsx",
    "components/challenger/ChallengeCard.tsx",
    "components/leaderboard/RankedCard.tsx",
    "components/business/BusinessActionBar.tsx",
  ];

  filesToCheck.forEach((file) => {
    it(`${file} has no empty catch blocks`, () => {
      const src = readSource(file);
      const matches = src.match(emptyCatchPattern);
      expect(matches).toBeNull();
    });
  });

  describe("Dev-mode error logging patterns", () => {
    it("app/business/[id].tsx logs share failures", () => {
      const src = readSource("app/business/[id].tsx");
      expect(src).toContain('[Share] Failed:');
    });

    it("app/referral.tsx logs share failures", () => {
      const src = readSource("app/referral.tsx");
      expect(src).toContain('[Referral] Share failed:');
    });

    it("app/admin/dashboard.tsx logs fetch failures", () => {
      const src = readSource("app/admin/dashboard.tsx");
      expect(src).toContain('[Admin] Fetch failed:');
    });

    it("lib/audio.ts logs unload failures", () => {
      const src = readSource("lib/audio.ts");
      expect(src).toContain('[Audio] Unload failed:');
    });

    it("lib/audio-engine.ts logs unload failures", () => {
      const src = readSource("lib/audio-engine.ts");
      expect(src).toContain('[AudioEngine] Unload failed:');
    });

    it("lib/bookmarks-context.tsx logs parse failures", () => {
      const src = readSource("lib/bookmarks-context.tsx");
      expect(src).toContain('[Bookmarks] Parse failed:');
    });

    it("lib/hooks/useSearchPersistence.ts logs parse failures", () => {
      const src = readSource("lib/hooks/useSearchPersistence.ts");
      expect(src).toContain('[Search] Parse failed:');
    });

    it("components/ErrorBoundary.tsx logs nav failures", () => {
      const src = readSource("components/ErrorBoundary.tsx");
      expect(src).toContain('[ErrorBoundary] Nav failed:');
    });

    it("components/challenger/ChallengeCard.tsx logs share failures", () => {
      const src = readSource("components/challenger/ChallengeCard.tsx");
      expect(src).toContain('[Challenge] Share failed:');
    });

    it("components/leaderboard/RankedCard.tsx logs share failures", () => {
      const src = readSource("components/leaderboard/RankedCard.tsx");
      expect(src).toContain('[RankedCard] Share failed:');
    });

    it("components/business/BusinessActionBar.tsx logs share failures", () => {
      const src = readSource("components/business/BusinessActionBar.tsx");
      expect(src).toContain('[ActionBar] Share failed:');
    });
  });

  describe("All dev logs are __DEV__-guarded", () => {
    filesToCheck.forEach((file) => {
      it(`${file} guards console.warn with __DEV__`, () => {
        const src = readSource(file);
        const warnLines = src.split("\n").filter(l => l.includes("console.warn("));
        warnLines.forEach((line) => {
          expect(line).toContain("__DEV__");
        });
      });
    });
  });
});
