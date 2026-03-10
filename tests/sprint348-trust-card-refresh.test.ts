/**
 * Sprint 348: Business detail trust card refresh
 * - Confidence badge (provisional/early/established/strong)
 * - Trusted rater count stat
 * - Last rated date freshness indicator
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

let trustCardSrc = "";
let businessDetailSrc = "";

beforeAll(() => {
  trustCardSrc = fs.readFileSync(path.resolve("components/business/TrustExplainerCard.tsx"), "utf-8");
  // Sprint 589: TrustExplainerCard moved to BusinessAnalyticsSection
  businessDetailSrc = fs.readFileSync(path.resolve("components/business/BusinessAnalyticsSection.tsx"), "utf-8");
});

// ── Trust card props ─────────────────────────────────────────────
describe("TrustExplainerCard new props", () => {
  it("should accept trustedRaterCount prop", () => {
    expect(trustCardSrc).toContain("trustedRaterCount?: number");
  });

  it("should accept lastRatedDate prop", () => {
    expect(trustCardSrc).toContain("lastRatedDate?: string");
  });

  it("should destructure new props", () => {
    expect(trustCardSrc).toContain("trustedRaterCount, lastRatedDate");
  });
});

// ── Confidence badge ─────────────────────────────────────────────
describe("Confidence badge", () => {
  it("should render confidence badge row", () => {
    expect(trustCardSrc).toContain("confidenceBadgeRow");
  });

  it("should have confidenceBadge base style", () => {
    expect(trustCardSrc).toContain("confidenceBadge:");
  });

  it("should have strong confidence variant", () => {
    expect(trustCardSrc).toContain("confidenceBadgeStrong");
    expect(trustCardSrc).toContain('"High Confidence"');
  });

  it("should have established confidence variant", () => {
    expect(trustCardSrc).toContain("confidenceBadgeEstablished");
    expect(trustCardSrc).toContain('"Established"');
  });

  it("should show Early for early confidence", () => {
    expect(trustCardSrc).toContain('"Early"');
  });

  it("should show Provisional for provisional confidence", () => {
    expect(trustCardSrc).toContain('"Provisional"');
  });

  it("should use shield icon for strong/established", () => {
    expect(trustCardSrc).toContain('"shield-checkmark"');
  });

  it("should use hourglass icon for early/provisional", () => {
    expect(trustCardSrc).toContain('"hourglass-outline"');
  });
});

// ── Trusted rater count stat ─────────────────────────────────────
describe("Trusted rater count", () => {
  it("should show trusted rater count when available", () => {
    expect(trustCardSrc).toContain("trustedRaterCount");
    expect(trustCardSrc).toContain("Trusted Raters");
  });

  it("should only show when count is positive", () => {
    expect(trustCardSrc).toContain("(trustedRaterCount ?? 0) > 0");
  });
});

// ── Last rated date ──────────────────────────────────────────────
describe("Last rated date", () => {
  it("should show last rated date when provided", () => {
    expect(trustCardSrc).toContain("lastRatedDate &&");
    expect(trustCardSrc).toContain("lastRatedText");
  });

  it("should prefix with 'Last rated'", () => {
    expect(trustCardSrc).toContain("Last rated {lastRatedDate}");
  });
});

// ── Business detail wiring ───────────────────────────────────────
describe("Business detail page wiring", () => {
  it("should pass trustedRaterCount from ratings", () => {
    expect(businessDetailSrc).toContain('trustedRaterCount={ratings.filter');
  });

  it("should pass lastRatedDate from first rating", () => {
    expect(businessDetailSrc).toContain("lastRatedDate={");
    expect(businessDetailSrc).toContain("toLocaleDateString");
  });
});

// ── Backwards compatibility ──────────────────────────────────────
describe("Backwards compatibility", () => {
  it("should still show rating count stat", () => {
    expect(trustCardSrc).toContain("Weighted Ratings");
  });

  it("should still show community score stat", () => {
    expect(trustCardSrc).toContain("Community Score");
  });

  it("should still show would return stat", () => {
    expect(trustCardSrc).toContain("Would Return");
  });

  it("should still use SlideUpView animation", () => {
    expect(trustCardSrc).toContain("SlideUpView");
  });
});
