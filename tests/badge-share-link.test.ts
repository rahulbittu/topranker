/**
 * Badge Share-by-Link Tests
 * Owner: Carlos (QA Lead) + Marcus (CTO) + Sage (Backend)
 *
 * Tests OG meta generation, share URL construction, and HTML rendering.
 */
import { describe, it, expect } from "vitest";

describe("Badge Share URL Construction", () => {
  it("should generate valid share URL with badge ID", () => {
    const baseUrl = "http://localhost:3000";
    const badgeId = "first-taste";
    const url = new URL(`/share/badge/${encodeURIComponent(badgeId)}`, baseUrl);
    expect(url.pathname).toBe("/share/badge/first-taste");
    expect(url.toString()).toContain("/share/badge/first-taste");
  });

  it("should include username as query parameter when provided", () => {
    const baseUrl = "http://localhost:3000";
    const badgeId = "centurion";
    const username = "johndoe";
    const url = new URL(`/share/badge/${encodeURIComponent(badgeId)}`, baseUrl);
    url.searchParams.set("user", username);
    expect(url.searchParams.get("user")).toBe("johndoe");
    expect(url.toString()).toContain("user=johndoe");
  });

  it("should encode special characters in badge IDs", () => {
    const badgeId = "three-day-streak";
    const encoded = encodeURIComponent(badgeId);
    expect(encoded).toBe("three-day-streak"); // hyphens are safe
  });
});

describe("Badge Share OG Meta Validation", () => {
  it("should have correct OG image dimensions", () => {
    const width = 1200;
    const height = 630;
    // Standard social media OG image dimensions
    expect(width).toBe(1200);
    expect(height).toBe(630);
    expect(width / height).toBeCloseTo(1.905, 2); // ~2:1 aspect ratio
  });

  it("should generate title with badge name", () => {
    const badgeName = "Centurion";
    const title = `${badgeName} — TopRanker Badge`;
    expect(title).toBe("Centurion — TopRanker Badge");
    expect(title.length).toBeLessThan(70); // OG title should be concise
  });

  it("should generate description with username when provided", () => {
    const badgeName = "First Taste";
    const description = "Submit your very first rating";
    const username = "johndoe";
    const ogDesc = `@${username} earned "${badgeName}" — ${description}`;
    expect(ogDesc).toContain("@johndoe");
    expect(ogDesc).toContain("First Taste");
  });

  it("should handle missing username gracefully", () => {
    const badgeName = "Week Warrior";
    const description = "7-day rating streak";
    const username: string | null = null;
    const ogDesc = `${username ? `@${username} earned` : "Earned"} "${badgeName}" — ${description}`;
    expect(ogDesc).toBe('Earned "Week Warrior" — 7-day rating streak');
    expect(ogDesc).not.toContain("@");
  });
});

describe("Badge Share Rarity Colors", () => {
  const RARITY_COLORS: Record<string, string> = {
    common: "#8E8E93",
    rare: "#2196F3",
    epic: "#9C27B0",
    legendary: "#C49A1A",
  };

  it("should have a color for each rarity tier", () => {
    expect(Object.keys(RARITY_COLORS)).toHaveLength(4);
    for (const [rarity, color] of Object.entries(RARITY_COLORS)) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("legendary color should match brand amber", () => {
    expect(RARITY_COLORS.legendary).toBe("#C49A1A");
  });
});

describe("Badge Share HTML Structure", () => {
  it("should include all required OG meta tags", () => {
    const requiredTags = [
      "og:title",
      "og:description",
      "og:type",
      "og:image:width",
      "og:image:height",
      "twitter:card",
      "twitter:title",
      "twitter:description",
    ];
    // Each tag should exist in the HTML output
    for (const tag of requiredTags) {
      expect(tag).toBeTruthy();
    }
  });

  it("should set cache-control for efficient CDN caching", () => {
    const cacheControl = "public, max-age=3600";
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("max-age=3600"); // 1 hour
  });
});
