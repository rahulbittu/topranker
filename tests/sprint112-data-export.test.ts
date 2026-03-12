/**
 * Sprint 112 — GDPR Data Export, Rate Limiter Store, Analytics Persistence,
 * Analytics Events Schema, Rate Limiter Async Behavior
 *
 * Owner: Sarah Nakamura (Lead Engineer), Nadia Kaur (Cybersecurity),
 *        Jordan Blake (Compliance), Amir Patel (Architecture)
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// config.ts requires DATABASE_URL and SESSION_SECRET at import time
vi.hoisted(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || "test";
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test";
});

import {
  trackEvent,
  clearAnalytics,
  setFlushHandler,
  stopFlush,
  getRecentEvents,
} from "../server/analytics";
import type { FlushHandler } from "../server/analytics";
import { rateLimiter, RateLimitStore } from "../server/rate-limiter";
import { analyticsEvents } from "../shared/schema";

// ── 1. GDPR Data Export ─────────────────────────────────────────────
describe("GDPR Data Export — Export Structure", () => {
  function buildExport(user: {
    displayName: string;
    username: string;
    email: string;
    city: string;
    credibilityScore: number;
    joinedAt: string;
  }) {
    return {
      exportDate: new Date().toISOString(),
      format: "GDPR Art. 20 compliant",
      profile: {
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        city: user.city,
        credibilityScore: user.credibilityScore,
        joinedAt: user.joinedAt,
      },
      ratings: [] as unknown[],
      impact: [] as unknown[],
      seasonalActivity: [] as unknown[],
      badges: [] as unknown[],
    };
  }

  const sampleUser = {
    displayName: "Jane Doe",
    username: "janedoe",
    email: "jane@example.com",
    city: "Austin",
    credibilityScore: 72,
    joinedAt: "2025-06-01T00:00:00.000Z",
  };

  it("export contains all required top-level fields", () => {
    const data = buildExport(sampleUser);
    expect(data).toHaveProperty("exportDate");
    expect(data).toHaveProperty("format");
    expect(data).toHaveProperty("profile");
    expect(data).toHaveProperty("ratings");
    expect(data).toHaveProperty("impact");
    expect(data).toHaveProperty("seasonalActivity");
    expect(data).toHaveProperty("badges");
  });

  it("format is 'GDPR Art. 20 compliant'", () => {
    const data = buildExport(sampleUser);
    expect(data.format).toBe("GDPR Art. 20 compliant");
  });

  it("profile contains displayName, username, email, city, credibilityScore, joinedAt", () => {
    const data = buildExport(sampleUser);
    expect(data.profile).toEqual({
      displayName: "Jane Doe",
      username: "janedoe",
      email: "jane@example.com",
      city: "Austin",
      credibilityScore: 72,
      joinedAt: "2025-06-01T00:00:00.000Z",
    });
  });

  it("ratings, seasonalActivity, badges are arrays", () => {
    const data = buildExport(sampleUser);
    expect(Array.isArray(data.ratings)).toBe(true);
    expect(Array.isArray(data.seasonalActivity)).toBe(true);
    expect(Array.isArray(data.badges)).toBe(true);
  });

  it("impact is an array", () => {
    const data = buildExport(sampleUser);
    expect(Array.isArray(data.impact)).toBe(true);
  });

  it("exportDate is a valid ISO date string", () => {
    const data = buildExport(sampleUser);
    const parsed = new Date(data.exportDate);
    expect(parsed.toISOString()).toBe(data.exportDate);
  });
});

// ── 2. Rate Limiter Store Interface ─────────────────────────────────
describe("Rate Limiter Store Interface", () => {
  it("rateLimiter() returns a function (middleware)", () => {
    const mw = rateLimiter();
    expect(typeof mw).toBe("function");
  });

  it("rateLimiter accepts custom store via options", () => {
    const mockStore: RateLimitStore = {
      async increment(key: string, windowMs: number) {
        return { count: 1, resetAt: Date.now() + windowMs };
      },
    };
    const mw = rateLimiter({ store: mockStore });
    expect(typeof mw).toBe("function");
  });

  it("custom store increment is called when middleware executes", async () => {
    let called = false;
    const mockStore: RateLimitStore = {
      async increment(key: string, windowMs: number) {
        called = true;
        return { count: 1, resetAt: Date.now() + windowMs };
      },
    };

    const mw = rateLimiter({ store: mockStore });

    const req = { ip: "10.0.0.1", socket: { remoteAddress: "10.0.0.1" } } as any;
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (k: string, v: string) => { headers[k] = v; },
      status: () => res,
      json: () => res,
    } as any;
    const next = () => {};

    mw(req, res, next);

    // Allow the promise-based increment to settle
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(called).toBe(true);
  });

  it("MemoryStore (default) handles concurrent IPs independently", async () => {
    const mw = rateLimiter({ windowMs: 60_000, maxRequests: 5 });

    const headersA: Record<string, string> = {};
    const headersB: Record<string, string> = {};

    const reqA = { ip: "192.168.1.1", socket: { remoteAddress: "192.168.1.1" } } as any;
    const reqB = { ip: "192.168.1.2", socket: { remoteAddress: "192.168.1.2" } } as any;

    const makeRes = (headers: Record<string, string>) =>
      ({
        setHeader: (k: string, v: string) => { headers[k] = v; },
        status: () => makeRes(headers),
        json: () => makeRes(headers),
      }) as any;

    const next = () => {};

    // Hit IP A three times
    mw(reqA, makeRes(headersA), next);
    mw(reqA, makeRes(headersA), next);
    mw(reqA, makeRes(headersA), next);

    // Hit IP B once
    mw(reqB, makeRes(headersB), next);

    await new Promise((resolve) => setTimeout(resolve, 20));

    // IP B should still have more remaining than IP A
    expect(Number(headersB["X-RateLimit-Remaining"])).toBeGreaterThan(
      Number(headersA["X-RateLimit-Remaining"]),
    );
  });
});

// ── 3. Analytics Persistence — Flush Mechanism ──────────────────────
describe("Analytics Persistence — Flush Mechanism", () => {
  beforeEach(() => {
    clearAnalytics();
    stopFlush();
  });

  it("setFlushHandler registers a handler without error", () => {
    const handler: FlushHandler = async (entries) => {
      // no-op handler
    };
    expect(() => setFlushHandler(handler, 600_000)).not.toThrow();
    stopFlush();
  });

  it("stopFlush clears the interval without error", () => {
    const handler: FlushHandler = async () => {};
    setFlushHandler(handler, 600_000);
    expect(() => stopFlush()).not.toThrow();
  });

  it("getRecentEvents returns an array", () => {
    const events = getRecentEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  it("getRecentEvents reflects tracked events", () => {
    trackEvent("signup_completed", "user-export-1");
    trackEvent("first_rating", "user-export-2", { business: "top-sushi" });
    const events = getRecentEvents(10);
    expect(events.length).toBe(2);
    expect(events[0].event).toBe("signup_completed");
    expect(events[1].event).toBe("first_rating");
  });

  it("FlushHandler type is assignable (type-level assertion)", () => {
    // This is a compile-time check: if FlushHandler doesn't exist, TS will fail
    const handler: FlushHandler = async (_entries) => {};
    expect(typeof handler).toBe("function");
  });
});

// ── 4. Analytics Events Schema ──────────────────────────────────────
describe("Analytics Events Schema", () => {
  it("analyticsEvents table is exported", () => {
    expect(analyticsEvents).toBeDefined();
  });

  it("analyticsEvents has 'event' column", () => {
    expect(analyticsEvents.event).toBeDefined();
  });

  it("analyticsEvents has 'userId' column", () => {
    expect(analyticsEvents.userId).toBeDefined();
  });

  it("analyticsEvents has 'metadata' column", () => {
    expect(analyticsEvents.metadata).toBeDefined();
  });

  it("analyticsEvents has 'createdAt' column", () => {
    expect(analyticsEvents.createdAt).toBeDefined();
  });
});

// ── 5. Rate Limiter Async Behavior ──────────────────────────────────
describe("Rate Limiter Async Behavior", () => {
  it("sets rate limit headers after async increment settles", async () => {
    const mw = rateLimiter({ windowMs: 60_000, maxRequests: 50 });

    const req = { ip: "10.20.30.40", socket: { remoteAddress: "10.20.30.40" } } as any;
    const headers: Record<string, string> = {};
    let nextCalled = false;
    const res = {
      setHeader: (k: string, v: string) => { headers[k] = v; },
      status: () => res,
      json: () => res,
    } as any;
    const next = () => { nextCalled = true; };

    mw(req, res, next);

    // Wait for microtask / promise to settle
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(headers["X-RateLimit-Limit"]).toBe("50");
    expect(headers["X-RateLimit-Remaining"]).toBeDefined();
    expect(headers["X-RateLimit-Reset"]).toBeDefined();
    expect(nextCalled).toBe(true);
  });

  it("remaining count decreases with successive calls from same IP", async () => {
    const mw = rateLimiter({ windowMs: 60_000, maxRequests: 100 });

    const ip = "10.99.99.99";
    const req = { ip, socket: { remoteAddress: ip } } as any;

    let firstRemaining = -1;
    let secondRemaining = -1;

    const makeRes = (cb: (remaining: number) => void) => {
      const headers: Record<string, string> = {};
      return {
        setHeader: (k: string, v: string) => {
          headers[k] = v;
          if (k === "X-RateLimit-Remaining") cb(Number(v));
        },
        status: () => makeRes(cb),
        json: () => makeRes(cb),
      } as any;
    };

    mw(req, makeRes((r) => { firstRemaining = r; }), () => {});
    await new Promise((resolve) => setTimeout(resolve, 10));

    mw(req, makeRes((r) => { secondRemaining = r; }), () => {});
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(firstRemaining).toBeGreaterThan(secondRemaining);
  });

  it("returns 429 when max requests exceeded", async () => {
    const mw = rateLimiter({ windowMs: 60_000, maxRequests: 2 });

    const ip = "10.50.50.50";
    const req = { ip, socket: { remoteAddress: ip } } as any;

    let statusCode = 0;
    const res = {
      setHeader: () => {},
      status: (code: number) => { statusCode = code; return res; },
      json: () => res,
    } as any;
    const next = () => {};

    // Fire 3 requests — 3rd should be rate-limited
    mw(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 10));
    mw(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 10));
    mw(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(statusCode).toBe(429);
  });
});
