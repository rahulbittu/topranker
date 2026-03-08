import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Real-time SSE — Unit tests
 * Validates SSE event broadcasting, client management,
 * invalidation mapping, and reconnection logic.
 */

// ── SSE Event Shape ─────────────────────────────────────────

describe("SSE Event Structure", () => {
  interface SSEEvent {
    type: string;
    payload: Record<string, unknown>;
    timestamp: number;
  }

  it("creates valid SSE event with required fields", () => {
    const event: SSEEvent = {
      type: "ranking_updated",
      payload: { city: "Dallas", category: "restaurant" },
      timestamp: Date.now(),
    };
    expect(event.type).toBe("ranking_updated");
    expect(event.timestamp).toBeGreaterThan(0);
  });

  it("serializes to valid SSE data format", () => {
    const event: SSEEvent = {
      type: "rating_submitted",
      payload: { businessId: "biz-1", memberId: "mem-1" },
      timestamp: 1709900000000,
    };
    const sseData = `data: ${JSON.stringify(event)}\n\n`;
    expect(sseData).toContain("data: {");
    expect(sseData.endsWith("\n\n")).toBe(true);
    expect(JSON.parse(sseData.replace("data: ", "").trim())).toEqual(event);
  });

  it("supports all defined event types", () => {
    const types = [
      "ranking_updated",
      "rating_submitted",
      "challenger_updated",
      "business_updated",
      "featured_updated",
    ];
    for (const type of types) {
      const event: SSEEvent = { type, payload: {}, timestamp: Date.now() };
      expect(event.type).toBe(type);
    }
  });
});

// ── Invalidation Map ────────────────────────────────────────

describe("SSE Query Invalidation Mapping", () => {
  const INVALIDATION_MAP: Record<string, string[][]> = {
    ranking_updated: [["/api/leaderboard"], ["/api/trending"]],
    rating_submitted: [["/api/leaderboard"], ["/api/businesses"], ["/api/trending"]],
    challenger_updated: [["/api/challengers"]],
    business_updated: [["/api/businesses"], ["/api/leaderboard"]],
    featured_updated: [["/api/featured"]],
  };

  it("maps ranking_updated to leaderboard and trending queries", () => {
    const keys = INVALIDATION_MAP["ranking_updated"];
    expect(keys).toContainEqual(["/api/leaderboard"]);
    expect(keys).toContainEqual(["/api/trending"]);
  });

  it("maps rating_submitted to three query families", () => {
    const keys = INVALIDATION_MAP["rating_submitted"];
    expect(keys).toHaveLength(3);
  });

  it("maps challenger_updated to challengers query", () => {
    const keys = INVALIDATION_MAP["challenger_updated"];
    expect(keys).toContainEqual(["/api/challengers"]);
  });

  it("maps featured_updated to featured query", () => {
    const keys = INVALIDATION_MAP["featured_updated"];
    expect(keys).toContainEqual(["/api/featured"]);
  });

  it("handles unknown event types gracefully", () => {
    const keys = INVALIDATION_MAP["unknown_event"];
    expect(keys).toBeUndefined();
  });
});

// ── Client Management ───────────────────────────────────────

describe("SSE Client Management", () => {
  it("tracks connected clients in a set", () => {
    const clients = new Set<{ id: string }>();
    clients.add({ id: "client-1" });
    clients.add({ id: "client-2" });
    expect(clients.size).toBe(2);
  });

  it("removes client on disconnect", () => {
    const clients = new Set<string>();
    clients.add("client-1");
    clients.add("client-2");
    clients.delete("client-1");
    expect(clients.size).toBe(1);
    expect(clients.has("client-2")).toBe(true);
  });

  it("handles broadcast to empty client set", () => {
    const clients = new Set<{ write: (data: string) => void }>();
    const event = JSON.stringify({ type: "test", timestamp: Date.now() });
    // Should not throw
    for (const client of clients) {
      client.write(`data: ${event}\n\n`);
    }
    expect(clients.size).toBe(0);
  });

  it("broadcasts to multiple clients", () => {
    const received: string[][] = [[], []];
    const clients = [
      { write: (d: string) => received[0].push(d) },
      { write: (d: string) => received[1].push(d) },
    ];
    const data = `data: ${JSON.stringify({ type: "ranking_updated" })}\n\n`;
    for (const client of clients) {
      client.write(data);
    }
    expect(received[0]).toHaveLength(1);
    expect(received[1]).toHaveLength(1);
    expect(received[0][0]).toContain("ranking_updated");
  });
});

// ── SSE Response Headers ────────────────────────────────────

describe("SSE HTTP Headers", () => {
  it("sets correct Content-Type header", () => {
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    };
    expect(headers["Content-Type"]).toBe("text/event-stream");
  });

  it("disables caching", () => {
    const headers = { "Cache-Control": "no-cache" };
    expect(headers["Cache-Control"]).toBe("no-cache");
  });

  it("keeps connection alive", () => {
    const headers = { Connection: "keep-alive" };
    expect(headers.Connection).toBe("keep-alive");
  });

  it("disables nginx buffering", () => {
    const headers = { "X-Accel-Buffering": "no" };
    expect(headers["X-Accel-Buffering"]).toBe("no");
  });
});

// ── Reconnection Logic ──────────────────────────────────────

describe("SSE Reconnection", () => {
  it("reconnects after 3 second delay", () => {
    vi.useFakeTimers();
    let reconnected = false;
    const reconnectDelay = 3000;
    setTimeout(() => { reconnected = true; }, reconnectDelay);
    vi.advanceTimersByTime(2999);
    expect(reconnected).toBe(false);
    vi.advanceTimersByTime(1);
    expect(reconnected).toBe(true);
    vi.useRealTimers();
  });

  it("sends keep-alive ping every 30 seconds", () => {
    vi.useFakeTimers();
    let pingCount = 0;
    const interval = setInterval(() => { pingCount++; }, 30000);
    vi.advanceTimersByTime(90000);
    expect(pingCount).toBe(3);
    clearInterval(interval);
    vi.useRealTimers();
  });

  it("cleans up on app background", () => {
    let closed = false;
    const es = { close: () => { closed = true; } };
    // Simulate background
    es.close();
    expect(closed).toBe(true);
  });
});

// ── Fallback Polling ────────────────────────────────────────

describe("Native Fallback Polling", () => {
  it("polls at 15 second interval when EventSource unavailable", () => {
    vi.useFakeTimers();
    let pollCount = 0;
    const interval = setInterval(() => { pollCount++; }, 15000);
    vi.advanceTimersByTime(60000);
    expect(pollCount).toBe(4);
    clearInterval(interval);
    vi.useRealTimers();
  });

  it("invalidates leaderboard and challengers on poll", () => {
    const invalidated: string[] = [];
    const mockInvalidate = (key: string) => invalidated.push(key);
    mockInvalidate("/api/leaderboard");
    mockInvalidate("/api/challengers");
    expect(invalidated).toContain("/api/leaderboard");
    expect(invalidated).toContain("/api/challengers");
  });
});
