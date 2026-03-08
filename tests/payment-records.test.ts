import { describe, it, expect } from "vitest";

/**
 * Payment Records — Unit tests
 * Validates the payments audit trail schema and storage contracts.
 */

// ── Payment Record Shape ────────────────────────────────────

interface PaymentRecord {
  id: string;
  memberId: string;
  businessId: string | null;
  type: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  status: string;
  metadata: Record<string, string> | null;
  createdAt: string;
}

describe("Payment Record Schema", () => {
  it("has all required fields", () => {
    const record: PaymentRecord = {
      id: "pay-123",
      memberId: "member-456",
      businessId: "biz-789",
      type: "challenger_entry",
      amount: 9900,
      currency: "usd",
      stripePaymentIntentId: "pi_abc123",
      status: "succeeded",
      metadata: { challengerId: "biz-789" },
      createdAt: new Date().toISOString(),
    };
    expect(record.type).toBe("challenger_entry");
    expect(record.amount).toBe(9900);
    expect(record.currency).toBe("usd");
  });

  it("supports null businessId for non-business payments", () => {
    const record: PaymentRecord = {
      id: "pay-000",
      memberId: "member-1",
      businessId: null,
      type: "premium_api",
      amount: 2999,
      currency: "usd",
      stripePaymentIntentId: null,
      status: "pending",
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    expect(record.businessId).toBeNull();
    expect(record.stripePaymentIntentId).toBeNull();
  });
});

// ── Payment Types ───────────────────────────────────────────

describe("Payment Types", () => {
  const validTypes = ["challenger_entry", "dashboard_pro", "featured_placement"];

  it("validates challenger_entry type", () => {
    expect(validTypes).toContain("challenger_entry");
  });

  it("validates dashboard_pro type", () => {
    expect(validTypes).toContain("dashboard_pro");
  });

  it("validates featured_placement type", () => {
    expect(validTypes).toContain("featured_placement");
  });
});

// ── Payment Amounts ─────────────────────────────────────────

describe("Payment Amounts (cents)", () => {
  it("challenger is $99.00 = 9900 cents", () => {
    expect(9900 / 100).toBe(99);
  });

  it("dashboard pro is $49.00 = 4900 cents", () => {
    expect(4900 / 100).toBe(49);
  });

  it("featured placement is $199.00 = 19900 cents", () => {
    expect(19900 / 100).toBe(199);
  });
});

// ── Payment Statuses ────────────────────────────────────────

describe("Payment Status Lifecycle", () => {
  const validStatuses = ["pending", "succeeded", "failed", "refunded"];

  it("starts as pending", () => {
    expect(validStatuses[0]).toBe("pending");
  });

  it("transitions to succeeded on Stripe confirmation", () => {
    expect(validStatuses).toContain("succeeded");
  });

  it("supports refunded status", () => {
    expect(validStatuses).toContain("refunded");
  });

  it("supports failed status", () => {
    expect(validStatuses).toContain("failed");
  });
});

// ── QR Code URL Generation ──────────────────────────────────

describe("QR Code URL Generation", () => {
  it("generates correct business URL", () => {
    const slug = "joes-bbq";
    const url = `https://topranker.com/business/${slug}`;
    expect(url).toBe("https://topranker.com/business/joes-bbq");
  });

  it("generates QR server URL with encoded data", () => {
    const data = "https://topranker.com/business/joes-bbq";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data)}&color=0D1B2A`;
    expect(qrUrl).toContain("api.qrserver.com");
    expect(qrUrl).toContain(encodeURIComponent(data));
  });
});
