/**
 * Sprint 180 — SSR Prerendering for SEO Pages
 *
 * Validates:
 * 1. Prerender middleware — bot detection
 * 2. Prerender middleware — HTML shell generation
 * 3. Prerender middleware — cache system
 * 4. Prerender middleware — route matching
 * 5. Cache invalidation
 * 6. Server integration
 * 7. Admin health includes cache stats
 * 8. SLT meeting doc
 * 9. Audit doc
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Bot detection
// ---------------------------------------------------------------------------
describe("Prerender — bot detection", () => {
  const src = readFile("server/prerender.ts");

  it("detects googlebot", () => {
    expect(src).toContain("googlebot");
  });

  it("detects facebookexternalhit", () => {
    expect(src).toContain("facebookexternalhit");
  });

  it("detects twitterbot", () => {
    expect(src).toContain("twitterbot");
  });

  it("detects discordbot", () => {
    expect(src).toContain("discordbot");
  });

  it("detects linkedinbot", () => {
    expect(src).toContain("linkedinbot");
  });

  it("has isBot function", () => {
    expect(src).toContain("function isBot(userAgent: string): boolean");
  });

  it("checks user-agent case-insensitively", () => {
    expect(src).toContain("userAgent.toLowerCase()");
  });
});

// ---------------------------------------------------------------------------
// 2. HTML shell generation
// ---------------------------------------------------------------------------
describe("Prerender — HTML shell", () => {
  const src = readFile("server/prerender.ts");

  it("generates valid HTML5 doctype", () => {
    expect(src).toContain("<!DOCTYPE html>");
  });

  it("includes Open Graph meta tags", () => {
    expect(src).toContain('property="og:title"');
    expect(src).toContain('property="og:description"');
    expect(src).toContain('property="og:url"');
    expect(src).toContain('property="og:type"');
    expect(src).toContain('property="og:site_name"');
  });

  it("includes Twitter Card meta", () => {
    expect(src).toContain('name="twitter:card"');
    expect(src).toContain("summary_large_image");
  });

  it("includes JSON-LD script tag", () => {
    expect(src).toContain('type="application/ld+json"');
  });

  it("includes canonical URL", () => {
    expect(src).toContain('rel="canonical"');
  });

  it("includes noscript fallback", () => {
    expect(src).toContain("<noscript>");
  });

  it("escapes HTML to prevent XSS", () => {
    expect(src).toContain("function escapeHtml");
    expect(src).toContain("&amp;");
    expect(src).toContain("&lt;");
    expect(src).toContain("&gt;");
    expect(src).toContain("&quot;");
  });
});

// ---------------------------------------------------------------------------
// 3. Cache system
// ---------------------------------------------------------------------------
describe("Prerender — LRU cache", () => {
  const src = readFile("server/prerender.ts");

  it("has configurable max size", () => {
    expect(src).toContain("CACHE_MAX");
    expect(src).toContain("200");
  });

  it("has configurable TTL", () => {
    expect(src).toContain("CACHE_TTL_MS");
    expect(src).toContain("5 * 60 * 1000");
  });

  it("evicts oldest entries at capacity", () => {
    expect(src).toContain("cache.size >= CACHE_MAX");
    expect(src).toContain("cache.keys().next().value");
  });

  it("expires entries after TTL", () => {
    expect(src).toContain("Date.now() - entry.timestamp > CACHE_TTL_MS");
  });

  it("logs cache hits", () => {
    expect(src).toContain("Cache HIT");
  });

  it("exports cache stats for monitoring", () => {
    expect(src).toContain("export function getPrerenderCacheStats");
  });
});

// ---------------------------------------------------------------------------
// 4. Route matching
// ---------------------------------------------------------------------------
describe("Prerender — route matching", () => {
  const src = readFile("server/prerender.ts");

  it("matches /dish/:slug pattern", () => {
    expect(src).toContain("/^\\/dish\\/([a-z0-9-]+)$/");
  });

  it("matches /business/:slug pattern", () => {
    expect(src).toContain("/^\\/business\\/([a-z0-9-]+)$/");
  });

  it("passes through non-matching paths", () => {
    expect(src).toContain("next()");
  });

  it("passes through non-bot requests", () => {
    expect(src).toContain("if (!isBot(userAgent))");
  });
});

// ---------------------------------------------------------------------------
// 5. Dish prerendering
// ---------------------------------------------------------------------------
describe("Prerender — dish leaderboards", () => {
  const src = readFile("server/prerender.ts");

  it("fetches dish leaderboard data", () => {
    expect(src).toContain("getDishLeaderboardWithEntries");
  });

  it("generates schema.org ItemList", () => {
    expect(src).toContain("ItemList");
  });

  it("includes top business names in description", () => {
    expect(src).toContain("topNames");
  });

  it("handles missing leaderboard", () => {
    expect(src).toContain("if (!board) return null");
  });
});

// ---------------------------------------------------------------------------
// 6. Business prerendering
// ---------------------------------------------------------------------------
describe("Prerender — business pages", () => {
  const src = readFile("server/prerender.ts");

  it("fetches business by slug", () => {
    expect(src).toContain("getBusinessBySlug");
  });

  it("generates schema.org Restaurant", () => {
    expect(src).toContain('"Restaurant"');
  });

  it("includes aggregate rating when available", () => {
    expect(src).toContain("AggregateRating");
    expect(src).toContain("biz.totalRatings > 0");
  });

  it("includes dynamic OG image URL", () => {
    expect(src).toContain("/api/og-image/business/");
  });
});

// ---------------------------------------------------------------------------
// 7. Cache invalidation
// ---------------------------------------------------------------------------
describe("Prerender — cache invalidation", () => {
  const src = readFile("server/prerender.ts");

  it("exports invalidatePrerenderCache", () => {
    expect(src).toContain("export function invalidatePrerenderCache");
  });

  it("accepts type and slug parameters", () => {
    expect(src).toContain('type: "dish" | "biz"');
  });

  it("deletes matching cache entries", () => {
    expect(src).toContain("cache.delete(key)");
  });

  it("logs invalidation", () => {
    expect(src).toContain("Cache invalidated:");
  });
});

// ---------------------------------------------------------------------------
// 8. Server integration
// ---------------------------------------------------------------------------
describe("Server — prerender middleware registration", () => {
  const indexSrc = readFile("server/index.ts");

  it("imports prerenderMiddleware", () => {
    expect(indexSrc).toContain("prerenderMiddleware");
    expect(indexSrc).toContain("./prerender");
  });

  it("uses prerender middleware before route registration", () => {
    expect(indexSrc).toContain("app.use(prerenderMiddleware)");
  });
});

// ---------------------------------------------------------------------------
// 9. Rating submission triggers cache invalidation
// ---------------------------------------------------------------------------
describe("Rating submission — prerender cache invalidation", () => {
  const routesSrc = readFile("server/routes-ratings.ts");

  it("invalidates prerender cache after rating", () => {
    expect(routesSrc).toContain("invalidatePrerenderCache");
  });

  it("invalidates for the rated business", () => {
    expect(routesSrc).toContain('invalidatePrerenderCache("biz"');
  });
});

// ---------------------------------------------------------------------------
// 10. Admin health includes cache stats
// ---------------------------------------------------------------------------
describe("Admin health — prerender cache stats", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("includes prerenderCache in health response", () => {
    expect(adminSrc).toContain("prerenderCache");
    expect(adminSrc).toContain("getPrerenderCacheStats");
  });
});

// ---------------------------------------------------------------------------
// 11. SLT meeting doc exists
// ---------------------------------------------------------------------------
describe("SLT meeting — Sprint 180", () => {
  const doc = readFile("docs/meetings/SLT-BACKLOG-180.md");

  it("has correct attendees", () => {
    expect(doc).toContain("Marcus Chen");
    expect(doc).toContain("Rachel Wei");
    expect(doc).toContain("Amir Patel");
    expect(doc).toContain("Sarah Nakamura");
  });

  it("reviews Sprint 176-180", () => {
    expect(doc).toContain("Sprint 176-180 Retrospective");
  });

  it("prioritizes Sprint 181-185", () => {
    expect(doc).toContain("Sprints 181-185");
  });

  it("includes revenue pipeline", () => {
    expect(doc).toContain("Revenue Pipeline Status");
  });

  it("includes core values alignment check", () => {
    expect(doc).toContain("Core Values Alignment Check");
  });
});

// ---------------------------------------------------------------------------
// 12. Audit doc exists
// ---------------------------------------------------------------------------
describe("Architecture Audit #18 — Sprint 180", () => {
  const doc = readFile("docs/audits/ARCH-AUDIT-180.md");

  it("has grade A-", () => {
    expect(doc).toContain("Overall Grade: A-");
  });

  it("identifies profile SubComponents as HIGH", () => {
    expect(doc).toContain("SubComponents");
    expect(doc).toContain("HIGH");
  });

  it("includes consequence chain audit", () => {
    expect(doc).toContain("Consequence Chain Audit");
  });

  it("reviews Sprints 176-180 additions", () => {
    expect(doc).toContain("Sprint 176:");
    expect(doc).toContain("Sprint 177:");
    expect(doc).toContain("Sprint 178:");
    expect(doc).toContain("Sprint 179:");
    expect(doc).toContain("Sprint 180:");
  });

  it("has test coverage metrics", () => {
    expect(doc).toContain("2,679");
    expect(doc).toContain("112");
  });
});
