/**
 * Unit Tests — Rate Limiter (M3 Audit Fix)
 * Owner: Nadia Kaur (VP Security)
 *
 * Tests the in-memory rate limiting system for API endpoints.
 */

import { describe, it, expect } from "vitest";

// Test the rate limiter logic extracted from routes.ts
function createTestRateLimiter(maxRequests: number, windowMs: number) {
  const bucket = new Map<string, { count: number; resetAt: number }>();

  return {
    check(ip: string): { allowed: boolean; count: number } {
      const now = Date.now();
      const entry = bucket.get(ip);
      if (entry && entry.resetAt > now) {
        if (entry.count >= maxRequests) {
          return { allowed: false, count: entry.count };
        }
        entry.count++;
        return { allowed: true, count: entry.count };
      }
      bucket.set(ip, { count: 1, resetAt: now + windowMs });
      return { allowed: true, count: 1 };
    },
    bucket,
  };
}

describe("Rate Limiter", () => {
  describe("Auth rate limiter (10 req/min)", () => {
    it("allows first 10 requests", () => {
      const limiter = createTestRateLimiter(10, 60000);
      for (let i = 0; i < 10; i++) {
        expect(limiter.check("192.168.1.1").allowed).toBe(true);
      }
    });

    it("blocks 11th request", () => {
      const limiter = createTestRateLimiter(10, 60000);
      for (let i = 0; i < 10; i++) {
        limiter.check("192.168.1.1");
      }
      expect(limiter.check("192.168.1.1").allowed).toBe(false);
    });

    it("tracks IPs independently", () => {
      const limiter = createTestRateLimiter(10, 60000);
      for (let i = 0; i < 10; i++) {
        limiter.check("192.168.1.1");
      }
      // IP 1 is blocked
      expect(limiter.check("192.168.1.1").allowed).toBe(false);
      // IP 2 is still allowed
      expect(limiter.check("192.168.1.2").allowed).toBe(true);
    });
  });

  describe("API rate limiter (100 req/min)", () => {
    it("allows first 100 requests", () => {
      const limiter = createTestRateLimiter(100, 60000);
      for (let i = 0; i < 100; i++) {
        expect(limiter.check("10.0.0.1").allowed).toBe(true);
      }
    });

    it("blocks 101st request", () => {
      const limiter = createTestRateLimiter(100, 60000);
      for (let i = 0; i < 100; i++) {
        limiter.check("10.0.0.1");
      }
      expect(limiter.check("10.0.0.1").allowed).toBe(false);
    });
  });

  describe("Window expiry", () => {
    it("resets after window expires", () => {
      const limiter = createTestRateLimiter(2, 100); // 100ms window
      limiter.check("1.1.1.1");
      limiter.check("1.1.1.1");
      expect(limiter.check("1.1.1.1").allowed).toBe(false);

      // Manually expire the window
      const entry = limiter.bucket.get("1.1.1.1")!;
      entry.resetAt = Date.now() - 1;

      // Should be allowed again
      expect(limiter.check("1.1.1.1").allowed).toBe(true);
    });

    it("returns correct count", () => {
      const limiter = createTestRateLimiter(10, 60000);
      expect(limiter.check("2.2.2.2").count).toBe(1);
      expect(limiter.check("2.2.2.2").count).toBe(2);
      expect(limiter.check("2.2.2.2").count).toBe(3);
    });
  });
});
