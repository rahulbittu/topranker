import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 371: Extract challenger tip + status badge", () => {
  const tipSrc = readFile("components/challenger/ChallengerTip.tsx");
  const challengerSrc = readFile("app/(tabs)/challenger.tsx");

  // ── Extracted hook ────────────────────────────────────────

  describe("useChallengerTip hook", () => {
    it("should export useChallengerTip function", () => {
      expect(tipSrc).toContain("export function useChallengerTip");
    });

    it("should manage showTip state", () => {
      expect(tipSrc).toContain("showTip");
      expect(tipSrc).toContain("setShowTip");
    });

    it("should manage dismissTip callback", () => {
      expect(tipSrc).toContain("dismissTip");
    });

    it("should use AsyncStorage for persistence", () => {
      expect(tipSrc).toContain("AsyncStorage.getItem");
      expect(tipSrc).toContain("AsyncStorage.setItem");
    });

    it("should use challenger_tip_dismissed key", () => {
      expect(tipSrc).toContain("challenger_tip_dismissed");
    });
  });

  // ── Extracted component ───────────────────────────────────

  describe("ChallengerTipCard component", () => {
    it("should export ChallengerTipCard function", () => {
      expect(tipSrc).toContain("export function ChallengerTipCard");
    });

    it("should accept onDismiss prop", () => {
      expect(tipSrc).toContain("onDismiss");
    });

    it("should display trophy icon", () => {
      expect(tipSrc).toContain('"trophy-outline"');
    });

    it("should display tip title", () => {
      expect(tipSrc).toContain("Watch businesses compete head-to-head");
    });

    it("should display tip subtitle", () => {
      expect(tipSrc).toContain("Vote for your favorite and help decide the winner");
    });

    it("should have dismiss button", () => {
      expect(tipSrc).toContain("Dismiss tip");
    });

    it("should have self-contained styles", () => {
      expect(tipSrc).toContain("StyleSheet.create");
    });
  });

  // ── Challenger screen simplified ──────────────────────────

  describe("Challenger screen uses extracted components", () => {
    it("should import useChallengerTip", () => {
      expect(challengerSrc).toContain("useChallengerTip");
    });

    it("should import ChallengerTipCard", () => {
      expect(challengerSrc).toContain("ChallengerTipCard");
    });

    it("should use hook for tip state", () => {
      expect(challengerSrc).toContain("showTip: showChallengerTip");
      expect(challengerSrc).toContain("dismissTip: dismissChallengerTip");
    });

    it("should render ChallengerTipCard component", () => {
      expect(challengerSrc).toContain("<ChallengerTipCard");
    });

    it("should not have inline tip card JSX", () => {
      expect(challengerSrc).not.toContain("tipCard:");
      expect(challengerSrc).not.toContain("tipIcon:");
      expect(challengerSrc).not.toContain("tipTextStack:");
    });

    it("should not import AsyncStorage directly", () => {
      expect(challengerSrc).not.toContain("@react-native-async-storage/async-storage");
    });

    it("should be under 175 LOC after extraction", () => {
      const lines = challengerSrc.split("\n").length;
      expect(lines).toBeLessThan(175);
    });
  });
});
