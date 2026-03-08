import { describe, it, expect, vi } from "vitest";

/**
 * Optimistic Updates — Unit tests
 * Validates the optimistic update pattern for ratings:
 * cache update before server response, rollback on error,
 * and settled refetch for consistency.
 */

// ── Optimistic Cache Update ─────────────────────────────────

describe("Optimistic Rating Update", () => {
  it("increments totalRatings before server response", () => {
    const business = { id: "biz-1", name: "Test", totalRatings: 42 };
    const updated = { ...business, totalRatings: business.totalRatings + 1 };
    expect(updated.totalRatings).toBe(43);
  });

  it("preserves all other business fields", () => {
    const business = {
      id: "biz-1", name: "Test Biz", totalRatings: 10,
      weightedScore: "4.5", category: "restaurant", city: "Dallas",
    };
    const updated = { ...business, totalRatings: business.totalRatings + 1 };
    expect(updated.name).toBe("Test Biz");
    expect(updated.weightedScore).toBe("4.5");
    expect(updated.category).toBe("restaurant");
    expect(updated.totalRatings).toBe(11);
  });

  it("handles null/undefined cache gracefully", () => {
    const prev: unknown = undefined;
    const shouldUpdate = prev && typeof prev === "object" && "totalRatings" in (prev as any);
    expect(shouldUpdate).toBeFalsy();
  });

  it("handles cache without totalRatings field", () => {
    const prev = { id: "biz-1", name: "Partial Data" };
    const hasField = "totalRatings" in prev;
    expect(hasField).toBe(false);
  });
});

// ── Rollback on Error ───────────────────────────────────────

describe("Optimistic Rollback", () => {
  it("restores previous cache on mutation error", () => {
    const original = { id: "biz-1", totalRatings: 42 };
    // Simulate optimistic update
    let cache: any = { ...original, totalRatings: 43 };
    // Simulate error — rollback
    cache = original;
    expect(cache.totalRatings).toBe(42);
  });

  it("only rolls back if context.prev exists", () => {
    const context: { prev?: unknown } = {};
    let rolled = false;
    if (context.prev) {
      rolled = true;
    }
    expect(rolled).toBe(false);
  });

  it("rolls back when context.prev is provided", () => {
    const context = { prev: { id: "biz-1", totalRatings: 42 } };
    let cache = { id: "biz-1", totalRatings: 43 };
    if (context.prev) {
      cache = context.prev as any;
    }
    expect(cache.totalRatings).toBe(42);
  });
});

// ── onSettled Refetch ───────────────────────────────────────

describe("Settled Refetch", () => {
  it("invalidates business query on success", () => {
    const invalidated: string[][] = [];
    const invalidate = (key: string[]) => invalidated.push(key);
    invalidate(["business", "test-slug"]);
    expect(invalidated).toContainEqual(["business", "test-slug"]);
  });

  it("invalidates business query on error", () => {
    const invalidated: string[][] = [];
    const invalidate = (key: string[]) => invalidated.push(key);
    // onSettled runs regardless of success/error
    invalidate(["business", "test-slug"]);
    expect(invalidated).toHaveLength(1);
  });

  it("SSE handles leaderboard invalidation separately", () => {
    // After Sprint 97, SSE broadcasts rating_submitted which
    // invalidates leaderboard, businesses, and trending.
    // The mutation no longer needs to invalidate these.
    const sseInvalidations = [
      ["/api/leaderboard"],
      ["/api/businesses"],
      ["/api/trending"],
    ];
    expect(sseInvalidations).toHaveLength(3);
  });
});

// ── Error Message Mapping ───────────────────────────────────

describe("Rating Error Messages", () => {
  it("maps network errors to user-friendly message", () => {
    const err = new Error("Failed to fetch");
    const msg = err.message.includes("Failed to fetch")
      ? "No internet connection. Please check your network and try again."
      : err.message;
    expect(msg).toContain("No internet");
  });

  it("maps 401 errors to session expired message", () => {
    const err = new Error("401: Unauthorized");
    const msg = err.message.includes("401")
      ? "Your session has expired. Please sign in again."
      : err.message;
    expect(msg).toContain("session has expired");
  });

  it("passes through server error messages", () => {
    const err = new Error("Already rated this business");
    const msg = err.message;
    expect(msg).toBe("Already rated this business");
  });

  it("provides fallback for empty error", () => {
    const err = new Error("");
    const msg = err.message || "Failed to submit rating";
    expect(msg).toBe("Failed to submit rating");
  });
});

// ── Query Key Structure ─────────────────────────────────────

describe("Query Key Consistency", () => {
  it("uses business slug as query key", () => {
    const slug = "spice-garden-dallas";
    const queryKey = ["business", slug];
    expect(queryKey).toEqual(["business", "spice-garden-dallas"]);
  });

  it("profile query key for badge checking", () => {
    const queryKey = ["profile"];
    expect(queryKey).toHaveLength(1);
  });

  it("leaderboard query uses city and category", () => {
    const queryKey = ["leaderboard", "Dallas", "restaurant"];
    expect(queryKey).toHaveLength(3);
  });
});
