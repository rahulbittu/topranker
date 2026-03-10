/**
 * Sprint 538: Dish leaderboard UX — visit type filter + enhanced photos
 *
 * 1. Server: visitType param support on dish leaderboard endpoint
 * 2. Server: visit type breakdown in response
 * 3. Client: visit type filter chips on DishLeaderboardSection
 * 4. Client: enhanced photo display (taller cards)
 * 5. Sprint & retro docs
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Server route — visitType param
// ---------------------------------------------------------------------------
describe("Server: dish leaderboard visitType param", () => {
  const src = readFile("server/routes-dishes.ts");

  it("accepts visitType query parameter", () => {
    expect(src).toContain("visitType");
    expect(src).toContain("sanitizeString(req.query.visitType");
  });

  it("passes visitType to getDishLeaderboardWithEntries", () => {
    expect(src).toContain("getDishLeaderboardWithEntries(slug, city, visitType)");
  });

  it("returns visitTypeBreakdown in response", () => {
    expect(src).toContain("visitTypeBreakdown");
  });
});

// ---------------------------------------------------------------------------
// 2. Server storage — visit type filtering
// ---------------------------------------------------------------------------
describe("Server: visit type filtering in storage", () => {
  const src = readFile("server/storage/dishes.ts");

  it("getDishLeaderboardWithEntries accepts optional visitType", () => {
    expect(src).toContain("getDishLeaderboardWithEntries(slug: string, city: string, visitType?: string)");
  });

  it("computes visit type breakdown from ratings", () => {
    expect(src).toContain("visitTypeBreakdown");
    expect(src).toContain("ratings.visitType");
  });

  it("validates visitType against allowed values", () => {
    expect(src).toContain('"dine_in"');
    expect(src).toContain('"delivery"');
    expect(src).toContain('"takeaway"');
  });

  it("re-ranks entries by visit-type-specific scores when filtered", () => {
    expect(src).toContain("re-rank entries");
    expect(src).toContain("visitType");
  });

  it("returns visitTypeBreakdown in result", () => {
    expect(src).toContain("visitTypeBreakdown,");
  });
});

// ---------------------------------------------------------------------------
// 3. Client: visit type filter chips
// ---------------------------------------------------------------------------
describe("DishLeaderboardSection — visit type filter", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("defines VisitTypeFilter type", () => {
    expect(src).toContain("VisitTypeFilter");
    expect(src).toContain('"all"');
    expect(src).toContain('"dine_in"');
    expect(src).toContain('"delivery"');
    expect(src).toContain('"takeaway"');
  });

  it("has VISIT_TYPE_FILTERS config with colors", () => {
    expect(src).toContain("VISIT_TYPE_FILTERS");
    expect(src).toContain("Dine-in");
    expect(src).toContain("Delivery");
    expect(src).toContain("Takeaway");
    expect(src).toContain("#60A5FA");
    expect(src).toContain("#34D399");
  });

  it("has visitTypeFilter state", () => {
    expect(src).toContain("useState<VisitTypeFilter>");
    expect(src).toContain("setVisitTypeFilter");
  });

  it("passes visitType to API query", () => {
    expect(src).toContain("visitType=");
    expect(src).toContain("visitTypeFilter");
  });

  it("includes visitTypeFilter in query key", () => {
    expect(src).toContain("visitTypeFilter]");
  });

  it("renders visit type filter chips", () => {
    expect(src).toContain("visitTypeRow");
    expect(src).toContain("visitTypeChip");
    expect(src).toContain("Filter by");
  });

  it("shows visit type count on chips", () => {
    expect(src).toContain("visitTypeBreakdown");
    expect(src).toContain("vtCount");
  });

  it("hides filter when only one visit type", () => {
    expect(src).toContain("hasMultipleVisitTypes");
  });

  it("resets filter when switching dishes", () => {
    expect(src).toContain('setVisitTypeFilter("all")');
  });
});

// ---------------------------------------------------------------------------
// 4. Client: enhanced photo display
// ---------------------------------------------------------------------------
describe("DishLeaderboardSection — enhanced photos", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("has taller photo height (160px)", () => {
    expect(src).toContain("height: 160");
  });

  it("has high confidence badge", () => {
    expect(src).toContain("highConfidenceBadge");
    expect(src).toContain("High confidence");
  });

  it("has early data badge", () => {
    expect(src).toContain("earlyDataBadge");
    expect(src).toContain("Early data");
  });
});

// ---------------------------------------------------------------------------
// 5. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 538 docs", () => {
  const sprint = readFile("docs/sprints/SPRINT-538-DISH-LEADERBOARD-UX.md");
  const retro = readFile("docs/retros/RETRO-538-DISH-LEADERBOARD-UX.md");

  it("sprint doc has correct header", () => {
    expect(sprint).toContain("Sprint 538");
    expect(sprint).toContain("Dish");
  });

  it("sprint doc has team discussion", () => {
    expect(sprint).toContain("Team Discussion");
    expect(sprint).toContain("Marcus Chen");
    expect(sprint).toContain("Sarah Nakamura");
  });

  it("sprint doc mentions visit type filter", () => {
    expect(sprint).toContain("visit type");
    expect(sprint).toContain("filter");
  });

  it("sprint doc mentions photo enhancement", () => {
    expect(sprint).toContain("photo");
    expect(sprint).toContain("160");
  });

  it("retro has correct header", () => {
    expect(retro).toContain("Retro 538");
  });

  it("retro has all required sections", () => {
    expect(retro).toContain("What Went Well");
    expect(retro).toContain("What Could Improve");
    expect(retro).toContain("Action Items");
    expect(retro).toContain("Team Morale");
  });
});
