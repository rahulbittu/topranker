/**
 * Sprint 159 — Rate gating error UX tests
 *
 * Verifies:
 * 1. Friendly error messages for rate gating scenarios
 * 2. Error banner has dismiss capability
 * 3. Auto-dismiss timer exists
 * 4. Business detail pre-checks account age
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Rate gating error messages", () => {
  const hookSrc = fs.readFileSync(
    path.resolve(__dirname, "../lib/hooks/useRatingSubmit.ts"),
    "utf-8"
  );
  const rateSrc = fs.readFileSync(
    path.resolve(__dirname, "../app/rate/[id].tsx"),
    "utf-8"
  );

  it("shows friendly message for already-rated-today", () => {
    expect(hookSrc).toContain("You've already rated this place today");
    expect(hookSrc).toContain("Come back tomorrow");
  });

  it("shows friendly message for account-too-new", () => {
    expect(hookSrc).toContain("needs a few more days");
    expect(hookSrc).toContain("prevent fake reviews");
  });

  it("shows friendly message for suspended accounts", () => {
    expect(hookSrc).toContain("suspended");
    expect(hookSrc).toContain("contact support");
  });

  it("has auto-dismiss timer for error banner", () => {
    expect(rateSrc).toContain("setTimeout(() => setSubmitError");
    expect(rateSrc).toContain("8000");
  });

  it("error banner is tappable to dismiss", () => {
    expect(rateSrc).toContain("Dismiss error");
    expect(rateSrc).toContain('onPress={() => setSubmitError("")');
  });

  it("error banner shows close icon", () => {
    expect(rateSrc).toContain('"close"');
  });
});

describe("Business detail pre-checks account age", () => {
  const bizSrc = fs.readFileSync(
    path.resolve(__dirname, "../components/business/BusinessBottomSection.tsx"),
    "utf-8"
  );

  it("checks memberDays >= 3 before showing rate button", () => {
    expect(bizSrc).toContain("memberDaysActive >= 3");
  });

  it("shows days remaining when gated", () => {
    expect(bizSrc).toContain("more days active to unlock");
  });
});
