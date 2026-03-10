/**
 * Sprint 382: Receipt Verification UI
 *
 * Verifies receipt upload section in rating extras step,
 * receipt state in rate page, and receipt upload in submit hook.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. RatingExtrasStep — receipt upload section ─────────────────────

describe("Sprint 382 — receipt upload UI", () => {
  const extrasSrc = readFile("components/rate/RatingExtrasStep.tsx");

  it("accepts receiptUri prop", () => {
    expect(extrasSrc).toContain("receiptUri");
  });

  it("accepts setReceiptUri prop", () => {
    expect(extrasSrc).toContain("setReceiptUri");
  });

  it("has receipt-outline icon", () => {
    expect(extrasSrc).toContain("receipt-outline");
  });

  it("shows Upload Receipt title", () => {
    expect(extrasSrc).toContain("Upload Receipt");
  });

  it("shows +25% boost badge", () => {
    expect(extrasSrc).toContain("+25% boost");
  });

  it("has Verified Purchase badge on receipt preview", () => {
    expect(extrasSrc).toContain("Verified Purchase");
  });

  it("has receipt hint text about order confirmation", () => {
    expect(extrasSrc).toContain("Upload your receipt or order confirmation");
  });

  it("has pickReceipt function", () => {
    expect(extrasSrc).toContain("pickReceipt");
  });

  it("has captureReceipt function for camera", () => {
    expect(extrasSrc).toContain("captureReceipt");
  });

  it("has remove receipt button", () => {
    expect(extrasSrc).toContain("Remove receipt");
  });

  it("has receiptSection style", () => {
    expect(extrasSrc).toContain("receiptSection");
  });

  it("has receiptPreview style", () => {
    expect(extrasSrc).toContain("receiptPreview");
  });

  it("has receiptVerifiedBadge style", () => {
    expect(extrasSrc).toContain("receiptVerifiedBadge");
  });

  it("conditionally renders receipt section when setReceiptUri is provided", () => {
    expect(extrasSrc).toContain("setReceiptUri && (");
  });

  it("uses shield-checkmark icon for verified receipt", () => {
    expect(extrasSrc).toContain("shield-checkmark");
  });
});

// ── 2. Rate page — receipt state ─────────────────────────────────────

describe("Sprint 382 — rate page receipt state", () => {
  const rateSrc = readFile("app/rate/[id].tsx");

  it("has receiptUri state", () => {
    expect(rateSrc).toContain("receiptUri");
  });

  it("passes receiptUri to RatingExtrasStep", () => {
    expect(rateSrc).toContain("receiptUri={receiptUri}");
  });

  it("passes setReceiptUri to RatingExtrasStep", () => {
    expect(rateSrc).toContain("setReceiptUri={setReceiptUri}");
  });

  it("passes receiptUri to useRatingSubmit", () => {
    const submitIdx = rateSrc.indexOf("submitMutation = useRatingSubmit");
    const section = rateSrc.slice(submitIdx, submitIdx + 500);
    expect(section).toContain("receiptUri");
  });
});

// ── 3. useRatingSubmit — receipt upload logic ────────────────────────

describe("Sprint 382 — rating submit receipt upload", () => {
  const submitSrc = readFile("lib/hooks/useRatingSubmit.ts");

  it("has uploadRatingReceipt function", () => {
    expect(submitSrc).toContain("uploadRatingReceipt");
  });

  it("sets isReceipt: true for receipt uploads", () => {
    expect(submitSrc).toContain("isReceipt: true");
  });

  it("accepts receiptUri in options interface", () => {
    expect(submitSrc).toContain("receiptUri");
  });

  it("calls uploadRatingReceipt when receiptUri exists", () => {
    const receiptIdx = submitSrc.indexOf("uploadRatingReceipt(ratingId");
    expect(receiptIdx).toBeGreaterThan(-1);
  });

  it("receipt upload is async and non-blocking", () => {
    expect(submitSrc).toContain("Receipt upload failure is non-critical");
  });

  it("keeps photo and receipt uploads separate", () => {
    expect(submitSrc).toContain("isReceipt: false");
    expect(submitSrc).toContain("isReceipt: true");
  });
});
