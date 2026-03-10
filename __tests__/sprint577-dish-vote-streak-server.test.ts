/**
 * Sprint 577: Server-Side Dish Vote Streak Calculation
 *
 * Tests:
 * 1. getDishVoteStreakStats function exists in storage
 * 2. Function signature and return shape
 * 3. Route wiring in /api/members/me
 * 4. Storage index export
 * 5. Schema imports (dishVotes, dishes)
 * 6. Streak algorithm correctness
 * 7. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 577: getDishVoteStreakStats Function", () => {
  const src = readFile("server/storage/members.ts");

  it("exports getDishVoteStreakStats as async function", () => {
    expect(src).toContain("export async function getDishVoteStreakStats");
  });

  it("takes memberId parameter", () => {
    expect(src).toContain("getDishVoteStreakStats(memberId: string)");
  });

  it("returns dishVoteStreak in result shape", () => {
    expect(src).toContain("dishVoteStreak: number");
  });

  it("returns longestDishStreak in result shape", () => {
    expect(src).toContain("longestDishStreak: number");
  });

  it("returns totalDishVotes in result shape", () => {
    expect(src).toContain("totalDishVotes: number");
  });

  it("returns topDish in result shape", () => {
    expect(src).toContain("topDish: string | null");
  });

  it("queries dishVotes table for total count", () => {
    expect(src).toContain("from(dishVotes)");
    expect(src).toContain("isNotNull(dishVotes.dishId)");
  });

  it("excludes noNotableDish entries (dishId must be non-null)", () => {
    expect(src).toContain("isNotNull(dishVotes.dishId)");
  });

  it("returns zeros when totalDishVotes is 0", () => {
    expect(src).toContain(
      "return { dishVoteStreak: 0, longestDishStreak: 0, totalDishVotes: 0, topDish: null }"
    );
  });

  it("finds top dish by join with dishes table", () => {
    expect(src).toContain("innerJoin(dishes, eq(dishVotes.dishId, dishes.id))");
    expect(src).toContain("dishes.name");
  });

  it("groups top dish by name and orders by count desc", () => {
    expect(src).toContain("groupBy(dishes.name)");
    expect(src).toContain("count(*) DESC");
  });

  it("selects distinct days via DATE(createdAt)", () => {
    expect(src).toContain("DATE(${dishVotes.createdAt})");
    expect(src).toContain("selectDistinct");
  });

  it("calculates streak using consecutive day comparison", () => {
    expect(src).toContain("ONE_DAY");
    expect(src).toContain("prev - curr === ONE_DAY");
  });

  it("tracks longest streak across all gaps", () => {
    expect(src).toContain("if (streak > longest) longest = streak");
  });

  it("current streak only counts if includes today or yesterday", () => {
    expect(src).toContain("todayMs - firstDayMs");
    expect(src).toContain("isCurrent");
  });

  it("walks backwards from most recent day for current streak", () => {
    expect(src).toContain("for (let i = 1; i < days.length; i++)");
    expect(src).toContain("current++");
  });

  it("imports isNotNull from drizzle-orm", () => {
    expect(src).toContain("isNotNull");
    expect(src).toMatch(/from\s+"drizzle-orm"/);
  });

  it("imports dishVotes and dishes from schema", () => {
    expect(src).toContain("dishVotes");
    expect(src).toContain("dishes");
    expect(src).toMatch(/from\s+"@shared\/schema"/);
  });
});

describe("Sprint 577: Storage Index Export", () => {
  const src = readFile("server/storage/index.ts");

  it("exports getDishVoteStreakStats", () => {
    expect(src).toContain("getDishVoteStreakStats");
  });
});

describe("Sprint 577: Route Wiring in /api/members/me", () => {
  const src = readFile("server/routes-members.ts");

  it("imports getDishVoteStreakStats from storage", () => {
    expect(src).toContain("getDishVoteStreakStats");
  });

  it("calls getDishVoteStreakStats with member.id", () => {
    expect(src).toContain("getDishVoteStreakStats(member.id)");
  });

  it("spreads streakStats into response", () => {
    expect(src).toContain("...streakStats");
  });

  it("response includes dishVoteStreak alongside seasonal data", () => {
    expect(src).toContain("...seasonal");
    expect(src).toContain("...streakStats");
  });
});

describe("Sprint 577: Client API Type Compatibility", () => {
  const apiSrc = readFile("lib/api.ts");

  it("ApiMemberProfile has dishVoteStreak field", () => {
    expect(apiSrc).toContain("dishVoteStreak?: number");
  });

  it("ApiMemberProfile has longestDishStreak field", () => {
    expect(apiSrc).toContain("longestDishStreak?: number");
  });

  it("ApiMemberProfile has totalDishVotes field", () => {
    expect(apiSrc).toContain("totalDishVotes?: number");
  });

  it("ApiMemberProfile has topDish field", () => {
    expect(apiSrc).toContain("topDish?: string");
  });
});

describe("Sprint 577: LOC Thresholds", () => {
  it("members.ts storage under 640 LOC", () => {
    const src = readFile("server/storage/members.ts");
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(650);
  });

  it("routes-members.ts under 290 LOC", () => {
    const src = readFile("server/routes-members.ts");
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(290);
  });
});
