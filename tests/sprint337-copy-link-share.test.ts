/**
 * Sprint 337: Copy-Link Share Option
 *
 * Verifies that copy-to-clipboard sharing is available alongside
 * native share across business detail, ranked cards, and dish pages.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Sharing utility — copyShareLink ─────────────────────────────────

describe("Sprint 337 — sharing utility", () => {
  const sharingSrc = readFile("lib/sharing.ts");

  it("exports copyShareLink function", () => {
    expect(sharingSrc).toContain("export async function copyShareLink");
  });

  it("uses expo-clipboard", () => {
    expect(sharingSrc).toContain("expo-clipboard");
  });

  it("calls setStringAsync with url", () => {
    expect(sharingSrc).toContain("setStringAsync(url)");
  });

  it("shows Alert on successful copy", () => {
    expect(sharingSrc).toContain("Link Copied");
  });

  it("returns boolean success indicator", () => {
    expect(sharingSrc).toContain("return true");
    expect(sharingSrc).toContain("return false");
  });

  it("accepts optional label parameter", () => {
    expect(sharingSrc).toContain("label?: string");
  });
});

// ── 2. Business detail — copy link button ──────────────────────────────

describe("Sprint 337 — business detail copy link", () => {
  const actionBarSrc = readFile("components/business/BusinessActionBar.tsx");

  it("has WhatsApp action button (Sprint 539: replaced Copy Link)", () => {
    expect(actionBarSrc).toContain('label="WhatsApp"');
  });

  it("uses logo-whatsapp icon (Sprint 539: replaced copy-outline)", () => {
    expect(actionBarSrc).toContain('icon="logo-whatsapp"');
  });
});

// ── 3. Ranked card — long-press copy link ──────────────────────────────

describe("Sprint 337 — ranked card copy link", () => {
  const subSrc = readFile("components/leaderboard/RankedCard.tsx");

  it("imports copyShareLink", () => {
    expect(subSrc).toContain("copyShareLink");
  });

  it("has onLongPress handler for copy", () => {
    expect(subSrc).toContain("onLongPress");
  });

  it("calls copyShareLink on long press", () => {
    const longPressIdx = subSrc.indexOf("onLongPress");
    const section = subSrc.slice(longPressIdx, longPressIdx + 300);
    expect(section).toContain("copyShareLink");
  });

  it("has accessibility hint for long press", () => {
    expect(subSrc).toContain("Long press to copy link");
  });

  it("uses medium haptic for long press", () => {
    expect(subSrc).toContain("ImpactFeedbackStyle.Medium");
  });
});

// ── 4. Dish leaderboard — copy link button ─────────────────────────────

describe("Sprint 337 — dish leaderboard copy link", () => {
  const dishSrc = readFile("app/dish/[slug].tsx");

  it("imports copyShareLink", () => {
    expect(dishSrc).toContain("copyShareLink");
  });

  it("has copy-outline icon button", () => {
    expect(dishSrc).toContain('name="copy-outline"');
  });

  it("tracks dish_leaderboard_copy_link analytics", () => {
    expect(dishSrc).toContain("dish_leaderboard_copy_link");
  });

  it("has both share and copy buttons in header", () => {
    expect(dishSrc).toContain('name="share-outline"');
    expect(dishSrc).toContain('name="copy-outline"');
  });
});
