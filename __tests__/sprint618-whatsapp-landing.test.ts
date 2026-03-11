/**
 * Sprint 618: WhatsApp deep link landing page
 * Validates share/[slug].tsx, deep link routing, analytics events, and share URL format.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 618 — WhatsApp Landing Page", () => {
  const shareSrc = readFile("app/share/[slug].tsx");
  const intentSrc = readFile("app/+native-intent.tsx");
  const analyticsSrc = readFile("lib/analytics.ts");
  const sharingSrc = readFile("lib/sharing.ts");
  const confirmSrc = readFile("components/rate/RatingConfirmation.tsx");

  describe("share/[slug].tsx page", () => {
    it("exists", () => {
      expect(shareSrc).toBeTruthy();
    });

    it("exports default ShareLandingScreen", () => {
      expect(shareSrc).toContain("export default function ShareLandingScreen");
    });

    it("reads slug from params", () => {
      expect(shareSrc).toContain("useLocalSearchParams");
      expect(shareSrc).toContain("slug");
    });

    it("fetches business data", () => {
      expect(shareSrc).toContain("fetchBusiness");
      expect(shareSrc).toContain("useQuery");
    });

    it("shows business name and rank", () => {
      expect(shareSrc).toContain("getRankDisplay");
      expect(shareSrc).toContain("bizName");
    });

    it("has Rate CTA button", () => {
      expect(shareSrc).toContain("Rate This Restaurant");
      expect(shareSrc).toContain("handleRate");
    });

    it("has View Details CTA", () => {
      expect(shareSrc).toContain("View Full Details");
      expect(shareSrc).toContain("handleExplore");
    });

    it("has Discover more link", () => {
      expect(shareSrc).toContain("Discover more top-rated restaurants");
    });

    it("shows loading state", () => {
      expect(shareSrc).toContain("ActivityIndicator");
      expect(shareSrc).toContain("isLoading");
    });

    it("handles not found state", () => {
      expect(shareSrc).toContain("Restaurant not found");
    });

    it("shows AppLogo branding", () => {
      expect(shareSrc).toContain("AppLogo");
      expect(shareSrc).toContain("Trustworthy Rankings");
    });

    it("shows Best In footer", () => {
      expect(shareSrc).toContain("Best In — powered by TopRanker");
    });

    it("uses SafeImage with fallback", () => {
      expect(shareSrc).toContain("SafeImage");
      expect(shareSrc).toContain("photoPlaceholder");
    });

    it("has pitch text", () => {
      expect(shareSrc).toContain("Someone shared this restaurant with you");
    });

    it("stays under 200 LOC", () => {
      const loc = shareSrc.split("\n").length;
      expect(loc).toBeLessThan(200);
    });
  });

  describe("deep link routing", () => {
    it("handles /share/ paths in native intent", () => {
      expect(intentSrc).toContain('cleanPath.startsWith("/share/")');
    });

    it("routes to /share/:slug", () => {
      expect(intentSrc).toContain('`/share/${slug}`');
    });
  });

  describe("analytics events", () => {
    it("tracks share_landing_view", () => {
      expect(analyticsSrc).toContain("share_landing_view");
    });

    it("tracks share_landing_rate_tap", () => {
      expect(analyticsSrc).toContain("share_landing_rate_tap");
    });

    it("tracks share_landing_explore_tap", () => {
      expect(analyticsSrc).toContain("share_landing_explore_tap");
    });

    it("has convenience functions", () => {
      expect(analyticsSrc).toContain("shareLandingView");
      expect(analyticsSrc).toContain("shareLandingRateTap");
      expect(analyticsSrc).toContain("shareLandingExploreTap");
    });
  });

  describe("share URL format", () => {
    it("getShareUrl supports 'share' type", () => {
      expect(sharingSrc).toContain('"share"');
    });

    it("RatingConfirmation uses share URL for WhatsApp", () => {
      expect(confirmSrc).toContain('getShareUrl("share"');
    });
  });
});
