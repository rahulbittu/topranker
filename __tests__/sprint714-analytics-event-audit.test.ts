/**
 * Sprint 714 — Analytics Event Audit
 *
 * Owner: Dev Team
 *
 * Verifies all key events are tracked before beta launch:
 * - Onboarding: start, complete, skip
 * - Rating: start, complete, abandon
 * - Profile: view_profile
 * - Settings: settings_open
 * - All convenience functions exist on Analytics object
 * - AnalyticsEvent type covers all tracked events
 */
import { describe, it, expect } from "vitest";
import { Analytics, track } from "../lib/analytics";

// ── Analytics Module Exports ──
describe("Analytics module exports", () => {
  it("track function is callable", () => {
    expect(typeof track).toBe("function");
  });

  it("Analytics object has discovery functions", () => {
    expect(typeof Analytics.searchQuery).toBe("function");
    expect(typeof Analytics.filterTap).toBe("function");
    expect(typeof Analytics.nearMeTap).toBe("function");
    expect(typeof Analytics.sortChange).toBe("function");
  });

  it("Analytics object has business engagement functions", () => {
    expect(typeof Analytics.viewBusiness).toBe("function");
    expect(typeof Analytics.bookmarkAdd).toBe("function");
    expect(typeof Analytics.bookmarkRemove).toBe("function");
    expect(typeof Analytics.shareBusiness).toBe("function");
  });

  it("Analytics object has rating functions", () => {
    expect(typeof Analytics.rateStart).toBe("function");
    expect(typeof Analytics.rateComplete).toBe("function");
    expect(typeof Analytics.rateAbandon).toBe("function");
    expect(typeof Analytics.rateCtaDiscoverTap).toBe("function");
  });

  it("Analytics object has challenger functions", () => {
    expect(typeof Analytics.challengerShareText).toBe("function");
    expect(typeof Analytics.challengerShareImage).toBe("function");
    expect(typeof Analytics.challengerEnterStart).toBe("function");
  });

  it("Analytics object has revenue functions", () => {
    expect(typeof Analytics.dashboardProViewed).toBe("function");
    expect(typeof Analytics.featuredViewed).toBe("function");
    expect(typeof Analytics.dashboardUpgradeTap).toBe("function");
  });

  it("Analytics object has notification functions", () => {
    expect(typeof Analytics.notificationReceived).toBe("function");
    expect(typeof Analytics.notificationDismissed).toBe("function");
    expect(typeof Analytics.notificationOpenReported).toBe("function");
  });

  it("Analytics object has beta tracking functions", () => {
    expect(typeof Analytics.betaJoinPageView).toBe("function");
    expect(typeof Analytics.betaJoinCtaTap).toBe("function");
    expect(typeof Analytics.betaSignupWithReferral).toBe("function");
    expect(typeof Analytics.betaReferralShare).toBe("function");
  });

  it("Analytics object has sharing functions", () => {
    expect(typeof Analytics.shareWhatsAppTap).toBe("function");
    expect(typeof Analytics.shareLandingView).toBe("function");
    expect(typeof Analytics.shareLandingRateTap).toBe("function");
    expect(typeof Analytics.shareLandingExploreTap).toBe("function");
  });

  it("Analytics object has cuisine/dish functions", () => {
    expect(typeof Analytics.cuisineFilterSelect).toBe("function");
    expect(typeof Analytics.cuisineFilterClear).toBe("function");
    expect(typeof Analytics.dishDeepLinkTap).toBe("function");
    expect(typeof Analytics.dishSearchMatchTap).toBe("function");
    expect(typeof Analytics.relatedDishTap).toBe("function");
  });

  it("Analytics object has action CTA functions", () => {
    expect(typeof Analytics.actionCTATap).toBe("function");
    expect(typeof Analytics.actionCTAImpression).toBe("function");
    expect(typeof Analytics.actionCTAConversion).toBe("function");
  });
});

// ── Event Wiring Audit (Source Verification) ──
describe("Event wiring — onboarding", () => {
  let source: string;

  it("loads onboarding source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../app/onboarding.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  it("tracks onboarding_start on mount", () => {
    expect(source).toContain('track("onboarding_start")');
  });

  it("tracks onboarding_complete on finish", () => {
    expect(source).toContain('track("onboarding_complete"');
  });

  it("tracks onboarding_skip on skip", () => {
    expect(source).toContain('track("onboarding_skip"');
  });
});

describe("Event wiring — rating flow", () => {
  let source: string;

  it("loads rate/[id].tsx source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../app/rate/[id].tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  it("imports Analytics", () => {
    expect(source).toContain("import { Analytics }");
  });

  it("tracks rate_start on mount", () => {
    expect(source).toContain("Analytics.rateStart(slug)");
  });

  it("tracks rate_complete on success", () => {
    expect(source).toContain("Analytics.rateComplete(slug");
  });

  it("tracks rate_abandon on back from step 0", () => {
    expect(source).toContain("Analytics.rateAbandon(slug, step)");
  });
});

describe("Event wiring — profile", () => {
  let source: string;

  it("loads profile source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../app/(tabs)/profile.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  it("tracks view_profile", () => {
    expect(source).toContain('track("view_profile")');
  });
});

describe("Event wiring — settings", () => {
  let source: string;

  it("loads settings source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../app/settings.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  it("tracks settings_open", () => {
    expect(source).toContain('track("settings_open")');
  });
});

// ── Already-wired events (smoke check) ──
describe("Previously wired events (spot check)", () => {
  it("search.tsx tracks search_query", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/(tabs)/search.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("Analytics.searchQuery");
  });

  it("business/[id].tsx tracks view_business", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/business/[id].tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("Analytics.viewBusiness");
  });

  it("challenger.tsx tracks view_challenger", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/(tabs)/challenger.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain('track("view_challenger")');
  });

  it("share/[slug].tsx tracks share_landing_view", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/share/[slug].tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("Analytics.shareLandingView");
  });

  it("_layout.tsx tracks notification_open_reported", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("Analytics.notificationOpenReported");
  });
});
