import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 363: Challenger card visual refresh", () => {
  const challengerSrc = readFile("app/(tabs)/challenger.tsx");
  const subSrc = readFile("components/challenger/SubComponents.tsx");

  // ── Status badge ──────────────────────────────────────────

  describe("Status badge (LIVE/ENDED)", () => {
    it("should have a status badge in card header", () => {
      expect(challengerSrc).toContain("statusBadge");
    });

    it("should show LIVE for active challenges", () => {
      expect(challengerSrc).toContain("statusBadgeLive");
      expect(challengerSrc).toContain('"LIVE"');
    });

    it("should show ENDED for completed challenges", () => {
      expect(challengerSrc).toContain("statusBadgeEnded");
      expect(challengerSrc).toContain('"ENDED"');
    });

    it("should have a green pulse dot for live challenges", () => {
      expect(challengerSrc).toContain("statusDot");
      expect(challengerSrc).toContain("!countdown.ended");
    });

    it("should use green background for live badge", () => {
      expect(challengerSrc).toContain("rgba(52, 199, 89, 0.12)");
    });

    it("should use gray background for ended badge", () => {
      expect(challengerSrc).toContain("rgba(142, 142, 147, 0.12)");
    });

    it("should style status text differently for live vs ended", () => {
      expect(challengerSrc).toContain("statusTextLive");
      expect(challengerSrc).toContain("statusTextEnded");
    });
  });

  // ── Card accent border ────────────────────────────────────

  describe("Card accent border", () => {
    it("should have left amber border on card", () => {
      expect(challengerSrc).toContain("borderLeftWidth: 3");
      expect(challengerSrc).toContain("borderLeftColor: BRAND.colors.amber");
    });
  });

  // ── VS circle badge ──────────────────────────────────────

  describe("VS circle badge", () => {
    it("should use a circular VS badge", () => {
      expect(challengerSrc).toContain("vsCircle");
    });

    it("should have navy background for VS circle", () => {
      expect(challengerSrc).toContain("backgroundColor: BRAND.colors.navy");
    });

    it("should have VS text in circle", () => {
      expect(challengerSrc).toContain("<Text style={styles.vsText}>VS</Text>");
    });

    it("should have 32px circle dimensions", () => {
      expect(challengerSrc).toContain("width: 32");
      expect(challengerSrc).toContain("height: 32");
    });
  });

  // ── Fighter photo height ─────────────────────────────────

  describe("Fighter photo taller", () => {
    it("should have 150px fighter photo height", () => {
      expect(subSrc).toContain("height: 150");
    });

    it("should not have old 130px height", () => {
      expect(subSrc).not.toContain("height: 130");
    });
  });

  // ── Vote bar enhancement ─────────────────────────────────

  describe("Vote bar thicker", () => {
    it("should have 8px vote bar height", () => {
      expect(subSrc).toContain("height: 8");
    });

    it("should have 4px border radius on vote bar", () => {
      expect(subSrc).toContain("borderRadius: 4");
    });
  });

  // ── Existing functionality preserved ─────────────────────

  describe("Core challenger functionality preserved", () => {
    it("should still have ChallengeCard component", () => {
      expect(challengerSrc).toContain("function ChallengeCard");
    });

    it("should still have FighterPhoto component", () => {
      expect(subSrc).toContain("function FighterPhoto");
    });

    it("should still have VoteBar component", () => {
      expect(subSrc).toContain("function VoteBar");
    });

    it("should still have WinnerReveal component", () => {
      expect(subSrc).toContain("function WinnerReveal");
    });

    it("should still have CommunityReviews component", () => {
      expect(subSrc).toContain("function CommunityReviews");
    });

    it("should still have share functionality", () => {
      expect(challengerSrc).toContain("shareChallenge");
      expect(challengerSrc).toContain("Share Challenge");
    });

    it("should still have timer section", () => {
      expect(challengerSrc).toContain("timerSection");
      expect(challengerSrc).toContain("countdown.days");
    });

    it("should still have progress bar", () => {
      expect(challengerSrc).toContain("progressBarOuter");
      expect(challengerSrc).toContain("progressBarInner");
    });
  });
});
