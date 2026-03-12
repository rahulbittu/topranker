/**
 * Sprint 733 — Rate Limiting + Abuse Prevention Hardening
 *
 * Owner: Nadia Kaur (Cybersecurity)
 *
 * Verifies:
 * - Dedicated rate limiters exist for ratings, feedback, and photo uploads
 * - Write endpoints use specific rate limiters (not just global apiRateLimiter)
 * - Rate limit thresholds are appropriate for each endpoint type
 */
import { describe, it, expect } from "vitest";

describe("Sprint 733 — Rate Limiting Hardening", () => {
  let rateLimiterSource: string;
  let routesRatingsSource: string;
  let routesSource: string;
  let routesPhotosSource: string;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    rateLimiterSource = fs.readFileSync(
      new URL("../server/rate-limiter.ts", import.meta.url),
      "utf-8",
    );
    routesRatingsSource = fs.readFileSync(
      new URL("../server/routes-ratings.ts", import.meta.url),
      "utf-8",
    );
    routesSource = fs.readFileSync(
      new URL("../server/routes.ts", import.meta.url),
      "utf-8",
    );
    routesPhotosSource = fs.readFileSync(
      new URL("../server/routes-rating-photos.ts", import.meta.url),
      "utf-8",
    );
    expect(rateLimiterSource).toBeTruthy();
  });

  // ── Rate Limiter Exports ──
  describe("Dedicated rate limiters", () => {
    it("exports ratingRateLimiter", () => {
      expect(rateLimiterSource).toContain("export const ratingRateLimiter");
    });

    it("exports feedbackRateLimiter", () => {
      expect(rateLimiterSource).toContain("export const feedbackRateLimiter");
    });

    it("exports uploadRateLimiter", () => {
      expect(rateLimiterSource).toContain("export const uploadRateLimiter");
    });

    it("rating limiter allows 10 req/min", () => {
      const section = rateLimiterSource.slice(
        rateLimiterSource.indexOf("ratingRateLimiter"),
        rateLimiterSource.indexOf("feedbackRateLimiter"),
      );
      expect(section).toContain("maxRequests: 10");
    });

    it("feedback limiter allows 5 req/min", () => {
      const section = rateLimiterSource.slice(
        rateLimiterSource.indexOf("feedbackRateLimiter"),
        rateLimiterSource.indexOf("uploadRateLimiter"),
      );
      expect(section).toContain("maxRequests: 5");
    });

    it("upload limiter allows 10 req/min", () => {
      const section = rateLimiterSource.slice(
        rateLimiterSource.indexOf("uploadRateLimiter"),
      );
      expect(section).toContain("maxRequests: 10");
    });

    it("uses unique key prefixes", () => {
      expect(rateLimiterSource).toContain('"rating"');
      expect(rateLimiterSource).toContain('"feedback"');
      expect(rateLimiterSource).toContain('"upload"');
    });
  });

  // ── Route Wiring ──
  describe("Route wiring", () => {
    it("ratings route uses ratingRateLimiter", () => {
      expect(routesRatingsSource).toContain("ratingRateLimiter");
      expect(routesRatingsSource).toContain('import { ratingRateLimiter } from "./rate-limiter"');
    });

    it("feedback route uses feedbackRateLimiter", () => {
      expect(routesSource).toContain("feedbackRateLimiter");
      expect(routesSource).toContain('feedbackRateLimiter');
    });

    it("photo upload route uses uploadRateLimiter", () => {
      expect(routesPhotosSource).toContain("uploadRateLimiter");
      expect(routesPhotosSource).toContain('import { uploadRateLimiter } from "./rate-limiter"');
    });

    it("rating limiter is placed before requireAuth", () => {
      expect(routesRatingsSource).toContain("ratingRateLimiter, requireAuth");
    });

    it("feedback limiter is placed before requireAuth", () => {
      expect(routesSource).toContain("feedbackRateLimiter, requireAuth");
    });

    it("upload limiter is placed before requireAuth", () => {
      expect(routesPhotosSource).toContain("uploadRateLimiter, requireAuth");
    });
  });

  // ── Existing Rate Limiters Still Present ──
  describe("Existing rate limiters preserved", () => {
    it("auth rate limiter exists (10 req/min)", () => {
      expect(rateLimiterSource).toContain("export const authRateLimiter");
    });

    it("API rate limiter exists (100 req/min)", () => {
      expect(rateLimiterSource).toContain("export const apiRateLimiter");
    });

    it("payment rate limiter exists (20 req/min)", () => {
      expect(rateLimiterSource).toContain("export const paymentRateLimiter");
    });

    it("claim verify rate limiter exists (5 req/min)", () => {
      expect(rateLimiterSource).toContain("export const claimVerifyRateLimiter");
    });
  });

  // ── Rate Limit Headers ──
  describe("Rate limit response headers", () => {
    it("sets X-RateLimit-Limit header", () => {
      expect(rateLimiterSource).toContain("X-RateLimit-Limit");
    });

    it("sets X-RateLimit-Remaining header", () => {
      expect(rateLimiterSource).toContain("X-RateLimit-Remaining");
    });

    it("sets X-RateLimit-Reset header", () => {
      expect(rateLimiterSource).toContain("X-RateLimit-Reset");
    });

    it("returns 429 on limit exceeded", () => {
      expect(rateLimiterSource).toContain("429");
      expect(rateLimiterSource).toContain("Too many requests");
    });
  });
});
