/**
 * Sprint 107 — Full Team Integration Tests
 * Covers: Accessibility, Security, Changelog, Revenue, Body Limits,
 *         Onboarding Tips, Typography Migration
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

// ─── 1. Accessibility Statement ────────────────────────────────────────────

describe("Accessibility Statement", () => {
  const filePath = path.join(ROOT, "app", "legal", "accessibility.tsx");
  const src = fs.readFileSync(filePath, "utf-8");

  it("defines exactly 6 sections", () => {
    // SECTIONS array entries: count objects with `title:` inside the array
    const sectionTitles = src.match(/title:\s*"/g);
    expect(sectionTitles).toHaveLength(6);
  });

  it('includes "Our Commitment" and "Feedback" sections', () => {
    expect(src).toContain('"Our Commitment"');
    expect(src).toContain('"Feedback"');
  });

  it('LAST_UPDATED is "March 8, 2026"', () => {
    expect(src).toContain('LAST_UPDATED = "March 8, 2026"');
  });
});

// ─── 2. Security Document ──────────────────────────────────────────────────

describe("Security Document", () => {
  const securityPath = path.join(ROOT, "docs", "SECURITY.md");

  it("docs/SECURITY.md exists", () => {
    expect(fs.existsSync(securityPath)).toBe(true);
  });

  it('contains "Security Headers" and "Rate Limiting" sections', () => {
    const content = fs.readFileSync(securityPath, "utf-8");
    expect(content).toContain("## Security Headers");
    expect(content).toContain("## Rate Limiting");
  });
});

// ─── 3. CHANGELOG ──────────────────────────────────────────────────────────

describe("CHANGELOG", () => {
  const changelogPath = path.join(ROOT, "CHANGELOG.md");

  it("CHANGELOG.md exists", () => {
    expect(fs.existsSync(changelogPath)).toBe(true);
  });

  it("contains entries for Sprint 97 through Sprint 106", () => {
    const content = fs.readFileSync(changelogPath, "utf-8");
    for (let sprint = 97; sprint <= 106; sprint++) {
      expect(content).toContain(`Sprint ${sprint}`);
    }
  });
});

// ─── 4. Revenue Metrics ────────────────────────────────────────────────────

describe("Revenue Metrics", () => {
  const paymentsPath = path.join(ROOT, "server", "storage", "payments.ts");
  const storageSrc = fs.readFileSync(paymentsPath, "utf-8");

  it("getRevenueMetrics function is exported", () => {
    expect(storageSrc).toContain("export async function getRevenueMetrics()");
  });

  it("returns object with totalRevenue, byType, activeSubscriptions, cancelledPayments", () => {
    // Verify the return shape is defined in the source
    expect(storageSrc).toContain("totalRevenue");
    expect(storageSrc).toContain("byType");
    expect(storageSrc).toContain("activeSubscriptions");
    expect(storageSrc).toContain("cancelledPayments");
  });

  it("initializes type map with known payment types", () => {
    expect(storageSrc).toContain("challenger_entry");
    expect(storageSrc).toContain("dashboard_pro");
    expect(storageSrc).toContain("featured_placement");
  });
});

// ─── 5. Body Size Limits ───────────────────────────────────────────────────

describe("Body Size Limits", () => {
  const indexPath = path.join(ROOT, "server", "index.ts");
  const src = fs.readFileSync(indexPath, "utf-8");

  it('"limit" is configured on body parsers', () => {
    const limitMatches = src.match(/limit:\s*"/g);
    expect(limitMatches).not.toBeNull();
    expect(limitMatches!.length).toBeGreaterThanOrEqual(2);
  });

  it('"1mb" appears as limit value for json and urlencoded parsers', () => {
    expect(src).toContain('limit: "1mb"');
  });
});

// ─── 6. Onboarding Tips Coverage ───────────────────────────────────────────

describe("Onboarding Tips Coverage", () => {
  it('Rankings has "banner_dismissed" key', () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app", "(tabs)", "index.tsx"),
      "utf-8",
    );
    expect(src).toContain("banner_dismissed");
  });

  it('Discover has "discover_tip_dismissed" key', () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app", "(tabs)", "search.tsx"),
      "utf-8",
    );
    expect(src).toContain("discover_tip_dismissed");
  });

  it('Challenger has "challenger_tip_dismissed" key', () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app", "(tabs)", "challenger.tsx"),
      "utf-8",
    );
    expect(src).toContain("challenger_tip_dismissed");
  });
});

// ─── 7. Typography Migration Completeness ──────────────────────────────────

describe("Typography Migration Completeness", () => {
  it("search.tsx imports TYPOGRAPHY", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app", "(tabs)", "search.tsx"),
      "utf-8",
    );
    expect(src).toMatch(/import\s*\{[^}]*TYPOGRAPHY[^}]*\}\s*from/);
  });

  it("challenger.tsx imports TYPOGRAPHY", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app", "(tabs)", "challenger.tsx"),
      "utf-8",
    );
    expect(src).toMatch(/import\s*\{[^}]*TYPOGRAPHY[^}]*\}\s*from/);
  });

  it("profile.tsx imports TYPOGRAPHY", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app", "(tabs)", "profile.tsx"),
      "utf-8",
    );
    expect(src).toMatch(/import\s*\{[^}]*TYPOGRAPHY[^}]*\}\s*from/);
  });
});
