/**
 * Sprint 167 — Dish Leaderboard UI: Discovery Integration + Components
 *
 * Validates:
 * 1. DishLeaderboardSection component exists with correct structure
 * 2. Discovery screen integrates dish leaderboard section
 * 3. Suggest modal component exists
 * 4. UI follows brand guidelines (amber, typography, chip rail)
 * 5. Low-data honesty: building state, early data badge, provisional badge
 * 6. Product messaging rules: no "AI-ranked", no "we recommend"
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. DishLeaderboardSection component
// ---------------------------------------------------------------------------
describe("DishLeaderboardSection component", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("exports DishLeaderboardSection", () => {
    expect(src).toContain("export function DishLeaderboardSection");
  });

  it("accepts city prop", () => {
    expect(src).toContain("city: string");
  });

  it("fetches dish leaderboards from API", () => {
    expect(src).toContain("/api/dish-leaderboards");
  });

  it("fetches dish leaderboard details for selected dish", () => {
    expect(src).toContain("/api/dish-leaderboards/");
  });

  it("renders section title 'Best In'", () => {
    expect(src).toContain("Best In");
  });

  it("renders subtitle 'Community-ranked by dish'", () => {
    expect(src).toContain("Community-ranked by dish");
  });
});

// ---------------------------------------------------------------------------
// 2. Chip rail UI
// ---------------------------------------------------------------------------
describe("Chip rail UI", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("renders chips from boards data", () => {
    expect(src).toContain("boards.map");
  });

  it("shows dish emoji on chips", () => {
    expect(src).toContain("dishEmoji");
  });

  it("has '+ Suggest' chip", () => {
    expect(src).toContain("+ Suggest");
  });

  it("uses amber color for active chip", () => {
    expect(src).toContain("chipActive");
    // Uses BRAND.colors.amber constant (resolves to #C49A1A at runtime)
    expect(src).toContain("AMBER");
  });

  it("toggles active dish on chip press", () => {
    expect(src).toContain("setActiveDish");
  });
});

const BRAND_AMBER = "#C49A1A";

// ---------------------------------------------------------------------------
// 3. Entry cards
// ---------------------------------------------------------------------------
describe("Dish entry cards", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("renders rank badge with position number", () => {
    expect(src).toContain("rankBadge");
    expect(src).toContain("rankPosition");
  });

  it("shows business name and neighborhood", () => {
    expect(src).toContain("businessName");
    expect(src).toContain("neighborhood");
  });

  it("shows dish-specific score", () => {
    expect(src).toContain("dishScore");
  });

  it("shows rater count with dish name context", () => {
    expect(src).toContain("ratings");
    expect(src).toContain("dishRatingCount");
  });

  it("navigates to business page on press", () => {
    expect(src).toContain("businessSlug");
    expect(src).toContain("router.push");
  });

  it("uses SafeImage with fallback", () => {
    expect(src).toContain("SafeImage");
    expect(src).toContain("fallbackGradient");
  });
});

// ---------------------------------------------------------------------------
// 4. Low-data honesty
// ---------------------------------------------------------------------------
describe("Low-data honesty UI", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("shows building state when below threshold", () => {
    expect(src).toContain("buildingCard");
    expect(src).toContain("is building...");
  });

  it("shows how many more reviews are needed", () => {
    expect(src).toContain("minRatingsNeeded");
    expect(src).toContain("more reviews");
  });

  it("shows 'Early data' badge for entries with < 5 ratings", () => {
    expect(src).toContain("Early data");
    expect(src).toContain("dishRatingCount < 5");
  });

  it("shows 'Early Rankings' provisional badge", () => {
    expect(src).toContain("Early Rankings");
    expect(src).toContain("isProvisional");
  });
});

// ---------------------------------------------------------------------------
// 5. Suggest modal
// ---------------------------------------------------------------------------
describe("Dish suggest modal", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("has DishSuggestModal component", () => {
    expect(src).toContain("DishSuggestModal");
  });

  it("shows suggestion input", () => {
    expect(src).toContain('placeholder');
    expect(src).toContain("Dosa, Shawarma, Pho");
  });

  it("submits via POST /api/dish-suggestions", () => {
    expect(src).toContain("/api/dish-suggestions");
    expect(src).toContain("POST");
  });

  it("shows existing suggestions with vote counts", () => {
    expect(src).toContain("voteCount");
    expect(src).toContain("Community suggestions");
  });

  it("supports voting on suggestions", () => {
    expect(src).toContain("/vote");
  });

  it("has rate limit 10 votes disclaimer", () => {
    expect(src).toContain("10 community votes");
  });
});

// ---------------------------------------------------------------------------
// 6. Discovery screen integration
// ---------------------------------------------------------------------------
describe("Discovery screen integration", () => {
  const searchSrc = readFile("app/(tabs)/search.tsx");

  it("imports DishLeaderboardSection", () => {
    expect(searchSrc).toContain("DishLeaderboardSection");
  });

  it("renders DishLeaderboardSection with city prop", () => {
    expect(searchSrc).toContain("<DishLeaderboardSection");
    expect(searchSrc).toContain("city={city}");
  });

  it("only shows dish section when not searching", () => {
    expect(searchSrc).toContain("!debouncedQuery");
  });
});

// ---------------------------------------------------------------------------
// 7. Product messaging rules
// ---------------------------------------------------------------------------
describe("Product messaging rules", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  const BANNED_PHRASES = [
    "AI-ranked",
    "Algorithm suggests",
    "Top picks",
    "We recommend",
    "Verified best",
    "Scientifically ranked",
  ];

  for (const phrase of BANNED_PHRASES) {
    it(`does NOT contain banned phrase: "${phrase}"`, () => {
      expect(src.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  }
});

// ---------------------------------------------------------------------------
// 8. Brand consistency
// ---------------------------------------------------------------------------
describe("Brand consistency", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("uses BRAND.colors.amber for accent color", () => {
    expect(src).toContain("BRAND.colors.amber");
  });

  it("uses TYPOGRAPHY for headings", () => {
    expect(src).toContain("TYPOGRAPHY.display.fontFamily");
  });

  it("uses consistent border radius (14 for cards, 19 for chips)", () => {
    expect(src).toContain("borderRadius: 14");
    expect(src).toContain("borderRadius: 19");
  });
});
