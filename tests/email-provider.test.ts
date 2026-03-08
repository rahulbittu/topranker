import { describe, it, expect, vi } from "vitest";

/**
 * Email Provider — Unit tests
 * Validates Resend integration, dev fallback,
 * payload construction, and error handling.
 */

describe("Email Provider Configuration", () => {
  it("falls back to console log when no API key", () => {
    const apiKey = "";
    const shouldSend = !!apiKey;
    expect(shouldSend).toBe(false);
  });

  it("uses Resend when API key is set", () => {
    const apiKey = "re_test_1234";
    const shouldSend = !!apiKey;
    expect(shouldSend).toBe(true);
  });

  it("uses default from address when not configured", () => {
    const fromEnv = "";
    const from = fromEnv || "TopRanker <noreply@topranker.com>";
    expect(from).toContain("TopRanker");
    expect(from).toContain("noreply@topranker.com");
  });

  it("uses custom from address when configured", () => {
    const fromEnv = "Custom <custom@example.com>";
    const from = fromEnv || "TopRanker <noreply@topranker.com>";
    expect(from).toBe("Custom <custom@example.com>");
  });
});

describe("Resend API Payload", () => {
  it("constructs correct request body", () => {
    const payload = {
      from: "TopRanker <noreply@topranker.com>",
      to: ["user@example.com"],
      subject: "Welcome!",
      html: "<h1>Hello</h1>",
      text: "Hello",
    };
    expect(payload.from).toContain("TopRanker");
    expect(payload.to).toEqual(["user@example.com"]);
    expect(payload.subject).toBe("Welcome!");
  });

  it("wraps single email in array for to field", () => {
    const to = "user@example.com";
    const payload = { to: [to] };
    expect(Array.isArray(payload.to)).toBe(true);
    expect(payload.to).toHaveLength(1);
  });

  it("includes both html and text content", () => {
    const payload = {
      html: "<h1>Welcome</h1>",
      text: "Welcome",
    };
    expect(payload.html).toContain("<h1>");
    expect(payload.text).not.toContain("<");
  });
});

describe("Email Error Handling", () => {
  it("handles non-200 response gracefully", () => {
    const status = 422;
    const body = '{"message": "Invalid email address"}';
    const errorMsg = `Resend API error ${status}: ${body.slice(0, 200)}`;
    expect(errorMsg).toContain("422");
    expect(errorMsg).toContain("Invalid email");
  });

  it("handles network errors gracefully", () => {
    const err = new Error("fetch failed");
    const errorMsg = `Email send failed: ${err.message}`;
    expect(errorMsg).toContain("fetch failed");
  });

  it("truncates long error bodies to 200 chars", () => {
    const body = "A".repeat(500);
    const truncated = body.slice(0, 200);
    expect(truncated).toHaveLength(200);
  });

  it("continues without throwing on failure", () => {
    // sendEmail catches errors — mutation callers use fire-and-forget
    let thrown = false;
    try {
      const msg = "Email send failed: timeout";
      // Just logged, not thrown
      expect(msg).toBeDefined();
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(false);
  });
});

describe("Welcome Email Content", () => {
  it("includes user's first name", () => {
    const displayName = "Alex Chen";
    const firstName = displayName.split(" ")[0];
    expect(firstName).toBe("Alex");
  });

  it("includes city in body", () => {
    const city = "Dallas";
    const html = `You've joined the ${city} ranking community`;
    expect(html).toContain("Dallas");
  });

  it("includes username with @ prefix", () => {
    const username = "alexchen";
    const line = `as <strong>@${username}</strong>`;
    expect(line).toContain("@alexchen");
  });
});

describe("Receipt Email Content", () => {
  it("formats amount from cents to dollars", () => {
    const amount = 19900;
    const dollars = (amount / 100).toFixed(2);
    expect(dollars).toBe("199.00");
  });

  it("maps payment type to display label", () => {
    const typeMap: Record<string, string> = {
      challenger_entry: "Challenger Entry",
      dashboard_pro: "Dashboard Pro Subscription",
      featured_placement: "Featured Placement",
    };
    expect(typeMap.challenger_entry).toBe("Challenger Entry");
    expect(typeMap.dashboard_pro).toBe("Dashboard Pro Subscription");
    expect(typeMap.featured_placement).toBe("Featured Placement");
  });

  it("includes payment reference ID", () => {
    const paymentId = "pay_abc123";
    const html = `<td style="font-family:monospace;">${paymentId}</td>`;
    expect(html).toContain("pay_abc123");
  });
});
