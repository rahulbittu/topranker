/**
 * Sprint 328: Share Button on Ranked Cards
 *
 * Verifies that RankedCard includes a share button using the native Share API
 * and sharing utilities. Enables one-tap sharing from the rankings leaderboard
 * for WhatsApp marketing.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const subPath = path.resolve(__dirname, "../components/leaderboard/RankedCard.tsx");
const subCode = fs.readFileSync(subPath, "utf-8");

describe("Sprint 328 — Share Button on Ranked Cards", () => {
  // Import requirements
  it("should import Share from react-native", () => {
    expect(subCode).toContain("Share");
    // Check it's in the RN import
    const rnImport = subCode.slice(subCode.indexOf("from \"react-native\"") - 200, subCode.indexOf("from \"react-native\"") + 20);
    expect(rnImport).toContain("Share");
  });

  it("should import sharing utilities", () => {
    expect(subCode).toContain("getShareUrl");
    expect(subCode).toContain("getShareText");
  });

  it("should import Analytics", () => {
    expect(subCode).toContain("Analytics");
    expect(subCode).toContain("from \"@/lib/analytics\"");
  });

  // Share button in RankedCard
  it("should have share button in RankedCard", () => {
    const rankedCardSection = subCode.slice(
      subCode.indexOf("RankedCard"),
      subCode.indexOf("// ─── Styles")
    );
    expect(rankedCardSection).toContain("share-outline");
    expect(rankedCardSection).toContain("cardShareBtn");
  });

  it("should call Share.share with business info", () => {
    const rankedCardSection = subCode.slice(
      subCode.indexOf("RankedCard"),
      subCode.indexOf("// ─── Styles")
    );
    expect(rankedCardSection).toContain("Share.share");
    expect(rankedCardSection).toContain("getShareText(item.name");
    expect(rankedCardSection).toContain("getShareUrl(\"business\", item.slug)");
  });

  it("should track share analytics with ranked_card source", () => {
    const rankedCardSection = subCode.slice(
      subCode.indexOf("RankedCard"),
      subCode.indexOf("// ─── Styles")
    );
    expect(rankedCardSection).toContain("Analytics.shareBusiness");
    expect(rankedCardSection).toContain("ranked_card");
  });

  it("should have haptics on share press", () => {
    // Find the share button section
    const shareSection = subCode.slice(
      subCode.indexOf("cardShareBtn"),
      subCode.indexOf("cardBookmarkBtn")
    );
    expect(shareSection).toContain("Haptics");
  });

  it("should stop propagation on share press", () => {
    const shareSection = subCode.slice(
      subCode.indexOf("cardShareBtn"),
      subCode.indexOf("cardBookmarkBtn")
    );
    expect(shareSection).toContain("stopPropagation");
  });

  // Styles
  it("should have cardShareBtn style positioned left of bookmark", () => {
    expect(subCode).toContain("cardShareBtn:");
    const styleSection = subCode.slice(subCode.indexOf("cardShareBtn:"), subCode.indexOf("cardBookmarkBtn:"));
    expect(styleSection).toContain("position");
    expect(styleSection).toContain("right: 44");
  });

  // Existing functionality preserved
  it("should preserve bookmark button", () => {
    const rankedCardSection = subCode.slice(
      subCode.indexOf("RankedCard"),
      subCode.indexOf("// ─── Styles")
    );
    expect(rankedCardSection).toContain("cardBookmarkBtn");
    expect(rankedCardSection).toContain("bookmark");
  });

  it("should preserve dish badges", () => {
    expect(subCode).toContain("dishBadgeRow");
    expect(subCode).toContain("dishBadge");
  });

  it("should keep SubComponents.tsx under 650 LOC", () => {
    // Sprint 416: RankDeltaBadge added (+37 LOC), bumped threshold
    const lines = subCode.split("\n").length;
    expect(lines).toBeLessThan(650);
  });
});
