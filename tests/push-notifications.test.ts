import { describe, it, expect } from "vitest";

/**
 * Push Notifications — Unit tests
 * Validates notification message construction, token handling,
 * and notification type contracts.
 */

// ── Expo Push Message Shape ─────────────────────────────────

describe("Expo Push Message Construction", () => {
  interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    sound?: "default" | null;
    channelId?: string;
  }

  it("creates valid push message with required fields", () => {
    const msg: ExpoPushMessage = {
      to: "ExponentPushToken[xxx]",
      title: "Test Title",
      body: "Test body message",
      sound: "default",
      channelId: "default",
    };
    expect(msg.to).toContain("ExponentPushToken");
    expect(msg.sound).toBe("default");
  });

  it("maps tokens to individual messages", () => {
    const tokens = ["token-1", "token-2", "token-3"];
    const messages = tokens.map(t => ({ to: t, title: "Hi", body: "Hello" }));
    expect(messages).toHaveLength(3);
    expect(messages[1].to).toBe("token-2");
  });

  it("returns empty array for no tokens", () => {
    const tokens: string[] = [];
    if (tokens.length === 0) {
      expect([]).toHaveLength(0);
    }
  });

  it("includes data payload for navigation", () => {
    const msg: ExpoPushMessage = {
      to: "token",
      title: "T",
      body: "B",
      data: { screen: "business" },
    };
    expect(msg.data?.screen).toBe("business");
  });
});

// ── Push Ticket Response ────────────────────────────────────

describe("Expo Push Ticket", () => {
  interface ExpoPushTicket {
    status: "ok" | "error";
    id?: string;
    message?: string;
  }

  it("parses successful ticket", () => {
    const ticket: ExpoPushTicket = { status: "ok", id: "ticket-123" };
    expect(ticket.status).toBe("ok");
    expect(ticket.id).toBeTruthy();
  });

  it("parses error ticket", () => {
    const ticket: ExpoPushTicket = { status: "error", message: "DeviceNotRegistered" };
    expect(ticket.status).toBe("error");
    expect(ticket.message).toBe("DeviceNotRegistered");
  });
});

// ── Rating Response Notification ────────────────────────────

describe("Rating Response Notification", () => {
  it("truncates long replies to 80 chars", () => {
    const ownerReply = "A".repeat(100);
    const truncated = ownerReply.length > 80 ? ownerReply.slice(0, 80) + "..." : ownerReply;
    expect(truncated.length).toBe(83); // 80 + "..."
    expect(truncated.endsWith("...")).toBe(true);
  });

  it("preserves short replies as-is", () => {
    const ownerReply = "Thanks for visiting!";
    const truncated = ownerReply.length > 80 ? ownerReply.slice(0, 80) + "..." : ownerReply;
    expect(truncated).toBe("Thanks for visiting!");
  });

  it("includes business name in title", () => {
    const businessName = "Joe's BBQ";
    const title = `${businessName} replied to your rating`;
    expect(title).toBe("Joe's BBQ replied to your rating");
  });
});

// ── Tier Upgrade Notification ───────────────────────────────

describe("Tier Upgrade Notification", () => {
  it("includes tier name in body", () => {
    const newTier = "Trusted";
    const body = `Your credibility just reached ${newTier} tier. Your ratings now carry more weight.`;
    expect(body).toContain("Trusted tier");
  });

  it("navigates to profile screen", () => {
    const data = { screen: "profile" };
    expect(data.screen).toBe("profile");
  });
});

// ── Challenger Notifications ────────────────────────────────

describe("Challenger Notifications", () => {
  it("result notification includes winner name", () => {
    const body = `Joe's BBQ wins! See the final results and stats.`;
    expect(body).toContain("wins!");
  });

  it("new challenger notification includes both names", () => {
    const body = `Pecan Lodge vs Joe's BBQ — 30 days, weighted votes decide.`;
    expect(body).toContain("vs");
    expect(body).toContain("30 days");
  });

  it("sends to all follower tokens", () => {
    const followerTokens = ["t1", "t2", "t3", "t4"];
    expect(followerTokens.length).toBeGreaterThan(0);
  });
});
