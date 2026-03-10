/**
 * Sprint 398: Rating Confirmation Screen Enhancements
 *
 * Verifies verification boost breakdown, share CTA, and rate-another CTA
 * in the post-rating confirmation screen.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Verification boost breakdown ─────────────────────────────────

describe("Sprint 398 — Verification boost breakdown", () => {
  const src = readFile("components/rate/SubComponents.tsx");

  it("shows verification boosts earned section", () => {
    expect(src).toContain("Verification Boosts Earned");
    expect(src).toContain("verificationBoostCard");
  });

  it("shows photo boost (+15%)", () => {
    expect(src).toContain("Photo attached");
    expect(src).toContain("+15%");
  });

  it("shows dish boost (+5%)", () => {
    expect(src).toContain("Dish specified");
    expect(src).toContain("+5%");
  });

  it("shows receipt boost (+25%)", () => {
    expect(src).toContain("Receipt uploaded");
    expect(src).toContain("+25%");
  });

  it("shows time plausibility boost (+5%)", () => {
    expect(src).toContain("Time plausibility");
    expect(src).toContain("timeOnPageMs");
    expect(src).toContain(">= 30000");
  });

  it("respects 50% cap", () => {
    expect(src).toContain("Math.min(totalBoostPct, 50)");
    expect(src).toContain("Capped at 50% maximum boost");
  });

  it("has boost styles", () => {
    expect(src).toContain("boostHeader:");
    expect(src).toContain("boostRow:");
    expect(src).toContain("boostPct:");
  });
});

// ── 2. Share CTA ────────────────────────────────────────────────────

describe("Sprint 398 — Share rating CTA", () => {
  const src = readFile("components/rate/SubComponents.tsx");

  it("has share button in confirmation", () => {
    expect(src).toContain("shareButton");
    expect(src).toContain("Share");
  });

  it("uses Share API", () => {
    expect(src).toContain("Share.share");
  });

  it("uses sharing utility for URL generation", () => {
    expect(src).toContain("getShareUrl");
    expect(src).toContain("getShareText");
  });

  it("has share button styles", () => {
    expect(src).toContain("shareButton:");
    expect(src).toContain("shareButtonText:");
  });
});

// ── 3. Rate another place CTA ───────────────────────────────────────

describe("Sprint 398 — Rate another place CTA", () => {
  const src = readFile("components/rate/SubComponents.tsx");

  it("has rate another button", () => {
    expect(src).toContain("rateAnotherBtn");
    expect(src).toContain("Rate another place");
  });

  it("calls onRateAnother callback", () => {
    expect(src).toContain("onRateAnother");
  });

  it("has rate another styles", () => {
    expect(src).toContain("rateAnotherBtn:");
    expect(src).toContain("rateAnotherText:");
  });
});

// ── 4. Props passed from rate screen ────────────────────────────────

describe("Sprint 398 — Props wired from rate/[id].tsx", () => {
  const src = readFile("app/rate/[id].tsx");

  it("passes hasPhoto prop", () => {
    expect(src).toContain("hasPhoto=");
  });

  it("passes hasDish prop", () => {
    expect(src).toContain("hasDish=");
  });

  it("passes hasReceipt prop", () => {
    expect(src).toContain("hasReceipt=");
  });

  it("passes timeOnPageMs prop", () => {
    expect(src).toContain("timeOnPageMs={");
  });

  it("passes businessSlug prop", () => {
    expect(src).toContain("businessSlug={slug}");
  });

  it("passes onRateAnother navigating to search", () => {
    expect(src).toContain("onRateAnother");
    expect(src).toContain("/(tabs)/search");
  });
});

// ── 5. Existing features preserved ──────────────────────────────────

describe("Sprint 398 — Existing confirmation features preserved", () => {
  const src = readFile("components/rate/SubComponents.tsx");

  it("still shows rank change", () => {
    expect(src).toContain("rankChangeCard");
    expect(src).toContain("Before");
    expect(src).toContain("After");
  });

  it("still shows tier progress", () => {
    expect(src).toContain("tierProgressCard");
    expect(src).toContain("tierBarInner");
  });

  it("still shows score breakdown", () => {
    expect(src).toContain("scoreBreakdownCard");
    expect(src).toContain("Contribution");
  });

  it("still shows done button", () => {
    expect(src).toContain("doneButton");
    expect(src).toContain("onDone");
  });
});
