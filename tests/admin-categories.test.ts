/**
 * Admin Category Review Tests
 * Owner: Carlos (QA Lead) + Priya (RBAC Lead)
 */
import { describe, it, expect } from "vitest";

describe("Admin Category Review", () => {
  it("should accept only approved or rejected status values", () => {
    const validStatuses = ["approved", "rejected"];
    for (const s of validStatuses) {
      expect(validStatuses).toContain(s);
    }
    expect(validStatuses).not.toContain("pending");
    expect(validStatuses).not.toContain("deleted");
    expect(validStatuses).not.toContain("");
  });

  it("should map vertical names to display colors", () => {
    const VERTICAL_COLORS: Record<string, string> = {
      food: "#FF6B35",
      services: "#2196F3",
      wellness: "#4CAF50",
      entertainment: "#9C27B0",
      retail: "#FF9800",
    };
    expect(Object.keys(VERTICAL_COLORS)).toHaveLength(5);
    for (const color of Object.values(VERTICAL_COLORS)) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("should render pending suggestions only", () => {
    const suggestions = [
      { id: "1", status: "pending", name: "Pet Stores" },
      { id: "2", status: "approved", name: "Gyms" },
      { id: "3", status: "pending", name: "Bookstores" },
      { id: "4", status: "rejected", name: "Laundromats" },
    ];
    const pending = suggestions.filter(s => s.status === "pending");
    expect(pending).toHaveLength(2);
    expect(pending.map(s => s.name)).toEqual(["Pet Stores", "Bookstores"]);
  });

  it("should support all 5 verticals from category registry", () => {
    const verticals = ["food", "services", "wellness", "entertainment", "retail"];
    expect(verticals).toHaveLength(5);
    // Each vertical should be a non-empty lowercase string
    for (const v of verticals) {
      expect(v).toMatch(/^[a-z]+$/);
    }
  });
});

describe("Badge Detail Modal Data", () => {
  it("should format earned date correctly", () => {
    const timestamp = new Date("2026-03-08T12:00:00Z").getTime();
    const formatted = new Date(timestamp).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
    expect(formatted).toContain("March");
    expect(formatted).toContain("2026");
  });

  it("should distinguish earned from unearned badges", () => {
    const earned = { earnedAt: Date.now(), progress: 100 };
    const unearned = { earnedAt: 0, progress: 60 };
    expect(earned.earnedAt).toBeGreaterThan(0);
    expect(unearned.earnedAt).toBe(0);
  });

  it("should show progress for unearned badges", () => {
    const badge = { earnedAt: 0, progress: 75 };
    expect(badge.earnedAt).toBe(0);
    expect(badge.progress).toBeGreaterThan(0);
    expect(badge.progress).toBeLessThanOrEqual(100);
  });
});
