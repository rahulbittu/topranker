/**
 * Sprint 396: Extract BusinessBottomSection from business/[id].tsx
 *
 * Verifies extracted component has rate button, claim card, report/claim links,
 * and parent file is reduced.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. BusinessBottomSection component ──────────────────────────────

describe("Sprint 396 — BusinessBottomSection component", () => {
  const src = readFile("components/business/BusinessBottomSection.tsx");

  it("exports BusinessBottomSection function", () => {
    expect(src).toContain("export function BusinessBottomSection");
  });

  it("exports BusinessBottomSectionProps interface", () => {
    expect(src).toContain("export interface BusinessBottomSectionProps");
  });

  it("has rate button with Rate This Place text", () => {
    expect(src).toContain("Rate This Place");
  });

  it("has update rating text", () => {
    expect(src).toContain("Update Your Rating");
  });

  it("has rate gating logic", () => {
    expect(src).toContain("memberDaysActive >= 3");
  });

  it("has claim card", () => {
    expect(src).toContain("Own this business?");
    expect(src).toContain("Claim Listing");
  });

  it("has report link", () => {
    expect(src).toContain("Report Suspicious Activity");
  });

  it("has claim link", () => {
    expect(src).toContain("Own this business? Claim it");
  });

  it("has sign in to rate fallback", () => {
    expect(src).toContain("Sign In to Rate");
  });
});

// ── 2. Business detail after extraction ─────────────────────────────

describe("Sprint 396 — Business detail (slim)", () => {
  const src = readFile("app/business/[id].tsx");

  it("imports BusinessBottomSection", () => {
    expect(src).toContain("BusinessBottomSection");
    expect(src).toContain("components/business/BusinessBottomSection");
  });

  it("renders BusinessBottomSection", () => {
    expect(src).toContain("<BusinessBottomSection");
  });

  it("does not contain rate button inline", () => {
    expect(src).not.toContain("Rate This Place");
    expect(src).not.toContain("rateButton:");
  });

  it("does not contain claim card inline", () => {
    expect(src).not.toContain("claimCard:");
    expect(src).not.toContain("claimBtnText:");
  });

  it("is under 560 LOC", () => {
    // Sprint 541: +9 LOC for photoMeta + communityPhotoCount wiring
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(560);
  });
});
