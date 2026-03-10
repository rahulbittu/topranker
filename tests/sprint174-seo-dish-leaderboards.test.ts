/**
 * Sprint 174 — SEO for Dish Leaderboard Pages
 *
 * Validates:
 * 1. Dedicated dish leaderboard page exists with dynamic meta
 * 2. Sitemap.xml endpoint serves valid sitemap
 * 3. robots.txt endpoint with crawl directives
 * 4. JSON-LD structured data for dish leaderboards
 * 5. Base HTML SEO improvements
 * 6. Navigation from DishLeaderboardSection to dedicated page
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. Dedicated dish leaderboard page
// ---------------------------------------------------------------------------
describe("dish leaderboard page — app/dish/[slug].tsx", () => {
  const pageSrc = readFile("app/dish/[slug].tsx");

  it("file exists", () => {
    expect(pageSrc.length).toBeGreaterThan(0);
  });

  it("uses Head component for dynamic meta tags", () => {
    expect(pageSrc).toContain("Head");
    expect(pageSrc).toContain("expo-router/head");
  });

  it("sets dynamic page title with dish name", () => {
    expect(pageSrc).toContain("<title>{pageTitle}</title>");
  });

  it("sets dynamic meta description", () => {
    expect(pageSrc).toContain('name="description"');
    expect(pageSrc).toContain("pageDescription");
  });

  it("sets canonical URL", () => {
    expect(pageSrc).toContain('rel="canonical"');
    expect(pageSrc).toContain("canonicalUrl");
  });

  it("includes Open Graph tags", () => {
    expect(pageSrc).toContain('property="og:title"');
    expect(pageSrc).toContain('property="og:description"');
    expect(pageSrc).toContain('property="og:url"');
    expect(pageSrc).toContain('property="og:image"');
    expect(pageSrc).toContain('property="og:site_name"');
  });

  it("includes Twitter Card tags", () => {
    expect(pageSrc).toContain('name="twitter:card"');
    expect(pageSrc).toContain("summary_large_image");
    expect(pageSrc).toContain('name="twitter:title"');
  });

  it("includes JSON-LD structured data", () => {
    expect(pageSrc).toContain("application/ld+json");
    expect(pageSrc).toContain("JSON.stringify(jsonLd)");
  });

  it("fetches dish leaderboard data from API", () => {
    expect(pageSrc).toContain("/api/dish-leaderboards/");
    expect(pageSrc).toContain("dish-leaderboard-page");
  });

  it("renders ranked entries with business links", () => {
    // Sprint 317: Entry card extracted to DishEntryCard component
    expect(pageSrc).toContain("DishEntryCard");
    expect(pageSrc).toContain("dishName={board.dishName}");
  });

  it("handles loading state", () => {
    expect(pageSrc).toContain("isLoading");
    expect(pageSrc).toContain("ActivityIndicator");
  });

  it("handles not found state", () => {
    expect(pageSrc).toContain("Leaderboard not found");
  });

  it("renders hero banner with dish info", () => {
    expect(pageSrc).toContain("heroBanner");
    expect(pageSrc).toContain("dishEmoji");
  });

  it("renders provisional badge for early rankings", () => {
    expect(pageSrc).toContain("isProvisional");
    expect(pageSrc).toContain("Early Rankings");
  });
});

// ---------------------------------------------------------------------------
// 2. JSON-LD structured data
// ---------------------------------------------------------------------------
describe("dish leaderboard — JSON-LD structured data", () => {
  const pageSrc = readFile("app/dish/[slug].tsx");

  it("uses schema.org ItemList type", () => {
    expect(pageSrc).toContain('"@context": "https://schema.org"');
    expect(pageSrc).toContain('"@type": "ItemList"');
  });

  it("includes list items with position", () => {
    expect(pageSrc).toContain('"@type": "ListItem"');
    expect(pageSrc).toContain("position: idx + 1");
  });

  it("includes business name and URL in list items", () => {
    expect(pageSrc).toContain("name: entry.businessName");
    expect(pageSrc).toContain("url:");
    expect(pageSrc).toContain("entry.businessSlug");
  });

  it("limits to top 10 entries", () => {
    expect(pageSrc).toContain(".slice(0, 10)");
  });
});

// ---------------------------------------------------------------------------
// 3. SEO routes — sitemap.xml + robots.txt
// ---------------------------------------------------------------------------
describe("SEO routes — server/routes-seo.ts", () => {
  const seoSrc = readFile("server/routes-seo.ts");

  it("file exists and exports registerSeoRoutes", () => {
    expect(seoSrc).toContain("export function registerSeoRoutes");
  });

  it("serves robots.txt", () => {
    expect(seoSrc).toContain('"/robots.txt"');
    expect(seoSrc).toContain("User-agent: *");
    expect(seoSrc).toContain("Allow: /dish/");
    expect(seoSrc).toContain("Disallow: /admin/");
    expect(seoSrc).toContain("Disallow: /api/");
    expect(seoSrc).toContain("Sitemap:");
  });

  it("serves sitemap.xml", () => {
    expect(seoSrc).toContain('"/sitemap.xml"');
    expect(seoSrc).toContain("urlset");
    expect(seoSrc).toContain("sitemaps.org");
  });

  it("sitemap includes dish leaderboard URLs", () => {
    expect(seoSrc).toContain("/dish/");
    expect(seoSrc).toContain("board.slug");
  });

  it("sitemap includes static pages", () => {
    expect(seoSrc).toContain("/auth/login");
    expect(seoSrc).toContain("/auth/signup");
    expect(seoSrc).toContain("/legal/terms");
    expect(seoSrc).toContain("/legal/privacy");
  });

  it("sitemap queries dish leaderboards from all cities", () => {
    expect(seoSrc).toContain("getDishLeaderboards");
    expect(seoSrc).toContain("dallas");
  });

  it("serves JSON-LD API endpoint", () => {
    expect(seoSrc).toContain('"/api/seo/dish/:slug"');
    expect(seoSrc).toContain("schema.org");
  });

  it("sets correct content types", () => {
    expect(seoSrc).toContain("application/xml");
    expect(seoSrc).toContain("text/plain");
  });
});

// ---------------------------------------------------------------------------
// 4. SEO routes registered in main routes.ts
// ---------------------------------------------------------------------------
describe("SEO routes — registration", () => {
  const routesSrc = readFile("server/routes.ts");

  it("imports registerSeoRoutes", () => {
    expect(routesSrc).toContain("registerSeoRoutes");
    expect(routesSrc).toContain("./routes-seo");
  });

  it("registers SEO routes", () => {
    expect(routesSrc).toContain("registerSeoRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 5. Base HTML SEO improvements
// ---------------------------------------------------------------------------
describe("base HTML — +html.tsx SEO", () => {
  const htmlSrc = readFile("app/+html.tsx");

  it("has og:site_name", () => {
    expect(htmlSrc).toContain('og:site_name');
    expect(htmlSrc).toContain("TopRanker");
  });

  it("has og:url", () => {
    expect(htmlSrc).toContain('og:url');
  });

  it("has Twitter Card tags", () => {
    expect(htmlSrc).toContain("twitter:card");
    expect(htmlSrc).toContain("summary_large_image");
  });

  it("has canonical URL", () => {
    expect(htmlSrc).toContain('rel="canonical"');
  });
});

// ---------------------------------------------------------------------------
// 6. DishLeaderboardSection navigation to dedicated page
// ---------------------------------------------------------------------------
describe("DishLeaderboardSection — navigation link", () => {
  const sectionSrc = readFile("components/DishLeaderboardSection.tsx");

  it("has navigation to dish page", () => {
    expect(sectionSrc).toContain('/dish/[slug]');
  });

  it("passes dish slug as param", () => {
    expect(sectionSrc).toContain("activeBoard.dishSlug");
  });

  it("has 'Full ranking' link text", () => {
    expect(sectionSrc).toContain("Full ranking");
  });

  it("has seeAllBtn style", () => {
    expect(sectionSrc).toContain("seeAllBtn");
    expect(sectionSrc).toContain("seeAllText");
  });
});
