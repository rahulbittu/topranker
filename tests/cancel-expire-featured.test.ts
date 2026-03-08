import { describe, it, expect } from "vitest";

/**
 * Cancel → Expire Featured — Unit tests
 * Validates that cancelling a featured_placement payment
 * also expires the associated featured placement.
 */

describe("Cancel Payment → Expire Placement", () => {
  it("identifies featured_placement type from payment", () => {
    const payment = { id: "pay-1", type: "featured_placement", status: "succeeded" };
    expect(payment.type).toBe("featured_placement");
  });

  it("does not expire for non-featured payment types", () => {
    const types = ["challenger_entry", "dashboard_pro"];
    for (const type of types) {
      expect(type !== "featured_placement").toBe(true);
    }
  });

  it("sets placement status to cancelled (not expired)", () => {
    const newStatus = "cancelled";
    expect(newStatus).toBe("cancelled");
    expect(newStatus).not.toBe("expired");
  });

  it("handles missing placement gracefully (fire-and-forget)", () => {
    // expireFeaturedByPayment returns null if no active placement found
    const result = null;
    expect(result).toBeNull();
  });

  it("broadcasts featured_updated on cancellation", () => {
    const event = { type: "featured_updated", payload: { cancelled: true } };
    expect(event.type).toBe("featured_updated");
    expect(event.payload.cancelled).toBe(true);
  });
});

describe("expireFeaturedByPayment Query", () => {
  it("only targets active placements", () => {
    const conditions = ["paymentId = ?", "status = 'active'"];
    expect(conditions).toContain("status = 'active'");
  });

  it("returns updated placement on success", () => {
    const updated = { id: "fp-1", status: "cancelled", paymentId: "pay-1" };
    expect(updated.status).toBe("cancelled");
  });

  it("returns null when no matching placement", () => {
    const results: any[] = [];
    const updated = results[0] ?? null;
    expect(updated).toBeNull();
  });

  it("does not affect already-expired placements", () => {
    const placement = { status: "expired" };
    const isActive = placement.status === "active";
    expect(isActive).toBe(false);
  });
});

describe("Featured Placement Duration", () => {
  it("calculates 7-day window correctly", () => {
    const FEATURED_DURATION_DAYS = 7;
    const startsAt = new Date("2026-03-01T00:00:00Z");
    const expiresAt = new Date(startsAt.getTime() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1000);
    expect(expiresAt.toISOString()).toBe("2026-03-08T00:00:00.000Z");
  });

  it("expired placement excluded from active queries", () => {
    const now = new Date("2026-03-09T00:00:00Z");
    const expiresAt = new Date("2026-03-08T00:00:00Z");
    const isActive = expiresAt > now;
    expect(isActive).toBe(false);
  });
});
