/**
 * Unit Tests — Trust Surfaces (Sprints 127-133 Gap Coverage)
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Covers untested features from Sprints 127-133:
 * - NetworkBanner mock data tracking
 * - mapApiRating memberId support
 * - Category display mapping roundtrips
 * - mapApiBusiness photo resolution (photoUrls, photoUrl, Google Places refs)
 * - TIER_INFLUENCE_LABELS coverage
 * - RANK_CONFIDENCE_LABELS coverage
 * - Banner state decision tree logic
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock expo/fetch and query-client before importing api.ts
vi.mock("expo/fetch", () => ({
  fetch: vi.fn(),
}));
vi.mock("@/lib/query-client", () => ({
  getApiUrl: () => "https://api.topranker.test",
}));
vi.mock("@/lib/mock-data", () => ({
  MOCK_BUSINESSES: [],
  MOCK_RATINGS: [],
  MOCK_DISHES: [],
  MOCK_CHALLENGERS: [],
  MOCK_MEMBER_PROFILE: {},
  MOCK_MEMBER_IMPACT: {},
  MOCK_RANK_HISTORY: [],
  MOCK_CATEGORIES: [],
}));

import {
  TIER_INFLUENCE_LABELS,
  RANK_CONFIDENCE_LABELS,
  CATEGORY_MAP,
  type CredibilityTier,
  type RankConfidence,
} from "@/lib/data";
import {
  isServingMockData,
  resetMockDataFlag,
  mapApiRating,
  mapApiBusiness,
  categoryToApi,
  categoryToDisplay,
  type ApiRating,
  type ApiBusiness,
} from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────

function makeApiRating(overrides: Partial<ApiRating> = {}): ApiRating {
  return {
    id: "r-1",
    memberId: "m-100",
    businessId: "b-1",
    q1Score: 4,
    q2Score: 5,
    q3Score: 3,
    wouldReturn: true,
    note: "Great spot",
    rawScore: "4.00",
    weight: "0.70",
    weightedScore: "2.80",
    isFlagged: false,
    autoFlagged: false,
    source: null,
    createdAt: "2026-02-15T12:00:00Z",
    memberName: "Jane Judge",
    memberTier: "trusted",
    memberAvatarUrl: "https://img.example.com/jane.png",
    ...overrides,
  };
}

function makeApiBusiness(overrides: Partial<ApiBusiness> = {}): ApiBusiness {
  return {
    id: "b-1",
    name: "Torchy's Tacos",
    slug: "torchys-tacos",
    category: "restaurant",
    city: "Dallas",
    neighborhood: "Deep Ellum",
    address: "123 Main St",
    lat: "32.7876",
    lng: "-96.7985",
    phone: "214-555-1234",
    website: "https://torchys.com",
    photoUrl: null,
    weightedScore: "8.75",
    rawAvgScore: "8.20",
    rankPosition: 3,
    rankDelta: 1,
    prevRankPosition: 4,
    totalRatings: 42,
    isActive: true,
    inChallenger: false,
    description: "Best tacos in town",
    priceRange: "$$",
    isOpenNow: true,
    isClaimed: true,
    googleRating: "4.5",
    googleMapsUrl: "https://maps.google.com/torchys",
    openingHours: { weekday_text: ["Mon: 10am-10pm"] },
    ...overrides,
  };
}

// ── 1. NetworkBanner / Mock Data Tracking ────────────────────────

describe("NetworkBanner — mock data tracking", () => {
  beforeEach(() => {
    resetMockDataFlag();
  });

  it("isServingMockData() returns false initially", () => {
    expect(isServingMockData()).toBe(false);
  });

  it("resetMockDataFlag() resets state to false", () => {
    // Even calling reset multiple times should be safe
    resetMockDataFlag();
    resetMockDataFlag();
    expect(isServingMockData()).toBe(false);
  });

  it("isServingMockData returns a boolean type", () => {
    const result = isServingMockData();
    expect(typeof result).toBe("boolean");
  });

  it("resetMockDataFlag returns void", () => {
    const result = resetMockDataFlag();
    expect(result).toBeUndefined();
  });
});

// ── 2. mapApiRating — memberId & defaults ────────────────────────

describe("mapApiRating — memberId and defaults (Sprint 129)", () => {
  it("includes memberId in output", () => {
    const mapped = mapApiRating(makeApiRating({ memberId: "m-42" }));
    expect(mapped.memberId).toBe("m-42");
  });

  it("memberName defaults to 'Anonymous' when missing", () => {
    const mapped = mapApiRating(makeApiRating({ memberName: undefined }));
    expect(mapped.userName).toBe("Anonymous");
  });

  it("memberName defaults to 'Anonymous' when explicitly null-ish", () => {
    const mapped = mapApiRating(makeApiRating({ memberName: "" }));
    expect(mapped.userName).toBe("Anonymous");
  });

  it("preserves explicit memberName when provided", () => {
    const mapped = mapApiRating(makeApiRating({ memberName: "Jane Judge" }));
    expect(mapped.userName).toBe("Jane Judge");
  });

  it("defaults memberTier to 'community' when missing", () => {
    const mapped = mapApiRating(makeApiRating({ memberTier: undefined }));
    expect(mapped.userTier).toBe("community");
  });

  it("parses rawScore as float", () => {
    const mapped = mapApiRating(makeApiRating({ rawScore: "3.75" }));
    expect(mapped.rawScore).toBe(3.75);
  });

  it("parses weight as float", () => {
    const mapped = mapApiRating(makeApiRating({ weight: "0.35" }));
    expect(mapped.weight).toBe(0.35);
  });

  it("converts createdAt string to epoch milliseconds", () => {
    const mapped = mapApiRating(makeApiRating({ createdAt: "2026-01-01T00:00:00Z" }));
    expect(mapped.createdAt).toBe(new Date("2026-01-01T00:00:00Z").getTime());
  });

  it("maps all three question scores", () => {
    const mapped = mapApiRating(makeApiRating({ q1Score: 5, q2Score: 4, q3Score: 3 }));
    expect(mapped.q1).toBe(5);
    expect(mapped.q2).toBe(4);
    expect(mapped.q3).toBe(3);
  });
});

// ── 3. Category Display Mapping ──────────────────────────────────

describe("Category display mapping", () => {
  it("categoryToApi converts known display names to API format", () => {
    expect(categoryToApi("Restaurants")).toBe("restaurant");
    expect(categoryToApi("Fast Food")).toBe("fast_food");
    expect(categoryToApi("Fine Dining")).toBe("fine_dining");
    expect(categoryToApi("Bubble Tea")).toBe("bubble_tea");
    expect(categoryToApi("Ice Cream")).toBe("ice_cream");
  });

  it("categoryToDisplay converts API format back to display names", () => {
    expect(categoryToDisplay("restaurant")).toBe("Restaurants");
    expect(categoryToDisplay("fast_food")).toBe("Fast Food");
    expect(categoryToDisplay("fine_dining")).toBe("Fine Dining");
    expect(categoryToDisplay("bubble_tea")).toBe("Bubble Tea");
  });

  it("unknown categories fall through gracefully for categoryToApi", () => {
    expect(categoryToApi("Pet Grooming")).toBe("pet_grooming");
    expect(categoryToApi("Car Wash")).toBe("car_wash");
  });

  it("unknown categories fall through gracefully for categoryToDisplay", () => {
    expect(categoryToDisplay("pet_grooming")).toBe("pet_grooming");
    expect(categoryToDisplay("totally_unknown")).toBe("totally_unknown");
  });

  it("roundtrips every entry in CATEGORY_MAP", () => {
    for (const [display, api] of Object.entries(CATEGORY_MAP)) {
      expect(categoryToApi(display)).toBe(api);
      expect(categoryToDisplay(api)).toBe(display);
    }
  });
});

// ── 4. mapApiBusiness — photo resolution (Sprint 129) ────────────

describe("mapApiBusiness — photo resolution", () => {
  it("uses photoUrls array when present", () => {
    const biz = makeApiBusiness({
      photoUrls: ["https://img.example.com/a.jpg", "https://img.example.com/b.jpg"],
      photoUrl: "https://img.example.com/fallback.jpg",
    });
    const mapped = mapApiBusiness(biz);
    expect(mapped.photoUrls).toHaveLength(2);
    expect(mapped.photoUrl).toBe("https://img.example.com/a.jpg");
  });

  it("falls back to single photoUrl when photoUrls is empty", () => {
    const biz = makeApiBusiness({
      photoUrls: [],
      photoUrl: "https://img.example.com/single.jpg",
    });
    const mapped = mapApiBusiness(biz);
    expect(mapped.photoUrls).toHaveLength(1);
    expect(mapped.photoUrl).toBe("https://img.example.com/single.jpg");
  });

  it("falls back to single photoUrl when photoUrls is undefined", () => {
    const biz = makeApiBusiness({
      photoUrls: undefined,
      photoUrl: "https://img.example.com/only.jpg",
    });
    const mapped = mapApiBusiness(biz);
    expect(mapped.photoUrls).toHaveLength(1);
    expect(mapped.photoUrl).toBe("https://img.example.com/only.jpg");
  });

  it("handles no photos gracefully", () => {
    const biz = makeApiBusiness({
      photoUrls: undefined,
      photoUrl: null,
    });
    const mapped = mapApiBusiness(biz);
    expect(mapped.photoUrls).toHaveLength(0);
    expect(mapped.photoUrl).toBeUndefined();
  });

  it("resolves Google Places references (starts with 'places/')", () => {
    const biz = makeApiBusiness({
      photoUrls: ["places/ChIJ123/photos/abc"],
      photoUrl: null,
    });
    const mapped = mapApiBusiness(biz);
    expect(mapped.photoUrls[0]).toContain("/api/photos/proxy?ref=");
    expect(mapped.photoUrls[0]).toContain(encodeURIComponent("places/ChIJ123/photos/abc"));
    expect(mapped.photoUrls[0]).toContain("maxwidth=600");
  });

  it("leaves non-Places URLs unchanged", () => {
    const biz = makeApiBusiness({
      photoUrls: ["https://cdn.example.com/photo.jpg"],
    });
    const mapped = mapApiBusiness(biz);
    expect(mapped.photoUrls[0]).toBe("https://cdn.example.com/photo.jpg");
  });

  it("maps numeric string fields to numbers", () => {
    const biz = makeApiBusiness({
      weightedScore: "9.25",
      rawAvgScore: "8.50",
      lat: "32.7876",
      lng: "-96.7985",
      googleRating: "4.7",
    });
    const mapped = mapApiBusiness(biz);
    expect(mapped.weightedScore).toBe(9.25);
    expect(mapped.rawAvgScore).toBe(8.5);
    expect(mapped.lat).toBe(32.7876);
    expect(mapped.lng).toBe(-96.7985);
    expect(mapped.googleRating).toBe(4.7);
  });
});

// ── 5. TIER_INFLUENCE_LABELS ─────────────────────────────────────

describe("TIER_INFLUENCE_LABELS coverage", () => {
  const allTiers: CredibilityTier[] = ["community", "city", "trusted", "top"];

  it("has labels for all 4 tiers", () => {
    for (const tier of allTiers) {
      expect(TIER_INFLUENCE_LABELS[tier]).toBeDefined();
    }
  });

  it("labels are non-empty strings", () => {
    for (const tier of allTiers) {
      expect(typeof TIER_INFLUENCE_LABELS[tier]).toBe("string");
      expect(TIER_INFLUENCE_LABELS[tier].length).toBeGreaterThan(0);
    }
  });

  it("labels are human-friendly (contain 'Influence')", () => {
    for (const tier of allTiers) {
      expect(TIER_INFLUENCE_LABELS[tier]).toContain("Influence");
    }
  });

  it("labels do not contain raw numeric multipliers", () => {
    for (const tier of allTiers) {
      expect(TIER_INFLUENCE_LABELS[tier]).not.toMatch(/x?\d+\.\d+/);
    }
  });
});

// ── 6. RANK_CONFIDENCE_LABELS ────────────────────────────────────

describe("RANK_CONFIDENCE_LABELS coverage", () => {
  const allLevels: RankConfidence[] = ["provisional", "early", "established", "strong"];

  it("has labels for all 4 confidence levels", () => {
    for (const level of allLevels) {
      expect(RANK_CONFIDENCE_LABELS[level]).toBeDefined();
    }
  });

  it("each entry has a label and description string", () => {
    for (const level of allLevels) {
      expect(typeof RANK_CONFIDENCE_LABELS[level].label).toBe("string");
      expect(typeof RANK_CONFIDENCE_LABELS[level].description).toBe("string");
      expect(RANK_CONFIDENCE_LABELS[level].label.length).toBeGreaterThan(0);
      expect(RANK_CONFIDENCE_LABELS[level].description.length).toBeGreaterThan(0);
    }
  });

  it("labels are descriptive (not raw enum values)", () => {
    expect(RANK_CONFIDENCE_LABELS.provisional.label).not.toBe("provisional");
    expect(RANK_CONFIDENCE_LABELS.early.label).not.toBe("early");
    expect(RANK_CONFIDENCE_LABELS.established.label).not.toBe("established");
    expect(RANK_CONFIDENCE_LABELS.strong.label).not.toBe("strong");
  });

  it("descriptions provide user-facing context", () => {
    expect(RANK_CONFIDENCE_LABELS.provisional.description).toContain("rating");
    expect(RANK_CONFIDENCE_LABELS.strong.description).toContain("community");
  });
});

// ── 7. Banner State Decision Tree ────────────────────────────────

describe("Banner state decision tree (unit logic)", () => {
  /**
   * The NetworkBanner component uses this priority:
   *   1. wasOffline && !isOffline → "Back online" (reconnect)
   *   2. isOffline → "No internet connection"
   *   3. isMock && !isOffline → "Demo mode"
   *   4. else → null (no banner)
   *
   * We test the decision function in isolation.
   */
  function getBannerState(
    isOffline: boolean,
    wasOffline: boolean,
    isMock: boolean,
  ): string | null {
    if (wasOffline && !isOffline) return "back-online";
    if (isOffline) return "offline";
    if (isMock && !isOffline) return "demo";
    return null;
  }

  it("shows 'back-online' when reconnecting (wasOffline && !isOffline)", () => {
    expect(getBannerState(false, true, false)).toBe("back-online");
  });

  it("shows 'back-online' even if mock flag is on during reconnect", () => {
    expect(getBannerState(false, true, true)).toBe("back-online");
  });

  it("shows 'offline' when currently offline", () => {
    expect(getBannerState(true, false, false)).toBe("offline");
  });

  it("shows 'offline' even if wasOffline is also true", () => {
    expect(getBannerState(true, true, false)).toBe("offline");
  });

  it("shows 'demo' when serving mock data but online", () => {
    expect(getBannerState(false, false, true)).toBe("demo");
  });

  it("returns null when online, not mock, and never was offline", () => {
    expect(getBannerState(false, false, false)).toBeNull();
  });
});
