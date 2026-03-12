/**
 * Sprint 394: Business Claim Verification Improvements
 *
 * Verifies enhanced claim form with business email, website,
 * verification method selector, and updated server endpoint.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Enhanced claim form ──────────────────────────────────────────

describe("Sprint 394 — Enhanced claim form fields", () => {
  const src = readFile("app/business/claim.tsx");

  it("has businessEmail state", () => {
    expect(src).toContain("businessEmail");
    expect(src).toContain("setBusinessEmail");
  });

  it("has website state", () => {
    expect(src).toContain("website");
    expect(src).toContain("setWebsite");
  });

  it("has verificationMethod state", () => {
    expect(src).toContain("verificationMethod");
    expect(src).toContain("setVerificationMethod");
  });

  it("renders business email input", () => {
    expect(src).toContain("Business Email");
    expect(src).toContain("mail-outline");
    expect(src).toContain("owner@restaurant.com");
  });

  it("renders website input", () => {
    expect(src).toContain("Business Website");
    expect(src).toContain("globe-outline");
  });

  it("renders verification method chips", () => {
    expect(src).toContain("methodChip");
    expect(src).toContain("Email");
    expect(src).toContain("Phone");
    expect(src).toContain("Document");
  });

  it("shows context-specific method hints", () => {
    expect(src).toContain("verification code to your business email");
    expect(src).toContain("call or text the business phone");
    expect(src).toContain("business license");
  });
});

// ── 2. Form sends enhanced data ─────────────────────────────────────

describe("Sprint 394 — Claim form data submission", () => {
  const src = readFile("app/business/claim.tsx");

  it("sends businessEmail in request body", () => {
    expect(src).toContain("businessEmail:");
  });

  it("sends website in request body", () => {
    expect(src).toContain("website:");
  });

  it("sends verificationMethod in request body", () => {
    expect(src).toContain("verificationMethod");
  });
});

// ── 3. Server endpoint accepts new fields ───────────────────────────

describe("Sprint 394 — Server claim endpoint (Sprint 659: extracted to routes-claims.ts)", () => {
  const src = readFile("server/routes-claims.ts");

  it("parses businessEmail from body", () => {
    expect(src).toContain("req.body.businessEmail");
  });

  it("parses website from body", () => {
    expect(src).toContain("req.body.website");
  });

  it("parses verificationMethod from body", () => {
    expect(src).toContain("req.body.verificationMethod");
  });

  it("includes method in verification string", () => {
    expect(src).toContain("method:");
  });

  it("includes email in verification string when provided", () => {
    expect(src).toContain("email:");
  });

  it("includes website in verification string when provided", () => {
    expect(src).toContain("website:");
  });
});

// ── 4. Styles ───────────────────────────────────────────────────────

describe("Sprint 394 — Claim form styles", () => {
  const src = readFile("app/business/claim.tsx");

  it("has methodRow style", () => {
    expect(src).toContain("methodRow:");
  });

  it("has methodChip style", () => {
    expect(src).toContain("methodChip:");
  });

  it("has methodChipActive style", () => {
    expect(src).toContain("methodChipActive:");
  });

  it("has methodHint style", () => {
    expect(src).toContain("methodHint:");
  });
});
