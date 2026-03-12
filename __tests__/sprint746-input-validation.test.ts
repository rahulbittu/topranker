/**
 * Sprint 746: Input Validation Hardening
 *
 * Validates:
 * 1. isReceipt boolean is strictly validated in photo upload route
 * 2. Rating flag booleans (q1-q5) are strictly validated
 * 3. Admin claim rejection reason is sanitized
 * 4. Dead console.log assignment removed from server/index.ts
 * 5. Business action URLs validated for protocol (http/https only)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readSource(filePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

describe("Sprint 746: Photo Upload — isReceipt Validation", () => {
  const src = readSource("server/routes-rating-photos.ts");

  it("extracts isReceipt as rawIsReceipt", () => {
    expect(src).toContain("isReceipt: rawIsReceipt");
  });

  it("validates isReceipt with strict equality", () => {
    expect(src).toContain("rawIsReceipt === true");
  });

  it("does not use unvalidated isReceipt from req.body", () => {
    // The only direct use should be the strict validation line
    const lines = src.split("\n");
    const isReceiptUses = lines.filter(l =>
      l.includes("isReceipt") &&
      !l.includes("rawIsReceipt") &&
      !l.includes("isVerifiedReceipt") &&
      !l.includes("// Sprint")
    );
    // All remaining uses should be the validated `isReceipt` local variable
    isReceiptUses.forEach(line => {
      expect(line).not.toContain("req.body");
    });
  });
});

describe("Sprint 746: Rating Flags — Boolean Validation", () => {
  const src = readSource("server/routes-ratings.ts");

  it("validates q1NoSpecificExperience with === true", () => {
    expect(src).toContain("q1NoSpecificExperience: req.body.q1NoSpecificExperience === true");
  });

  it("validates q2ScoreMismatchNote with === true", () => {
    expect(src).toContain("q2ScoreMismatchNote: req.body.q2ScoreMismatchNote === true");
  });

  it("validates q3InsiderSuspected with === true", () => {
    expect(src).toContain("q3InsiderSuspected: req.body.q3InsiderSuspected === true");
  });

  it("validates q4CoordinatedPattern with === true", () => {
    expect(src).toContain("q4CoordinatedPattern: req.body.q4CoordinatedPattern === true");
  });

  it("validates q5CompetitorBombing with === true", () => {
    expect(src).toContain("q5CompetitorBombing: req.body.q5CompetitorBombing === true");
  });

  it("still sanitizes explanation string", () => {
    expect(src).toContain("sanitizeString(req.body.explanation, 500)");
  });
});

describe("Sprint 746: Admin Claim Rejection — Sanitization", () => {
  const src = readSource("server/routes-admin-claims-verification.ts");

  it("imports sanitizeString", () => {
    expect(src).toContain('import { sanitizeString } from "./sanitize"');
  });

  it("sanitizes rejection reason", () => {
    expect(src).toContain("sanitizeString(req.body?.reason, 500)");
  });

  it("does not pass raw req.body.reason to rejectClaim", () => {
    expect(src).not.toContain("rejectClaim(req.params.id, req.body?.reason)");
  });
});

describe("Sprint 746: Dead Code Removal — server/index.ts", () => {
  const src = readSource("server/index.ts");

  it("does not assign console.log to a variable", () => {
    expect(src).not.toContain("const log = console.log");
  });

  it("still creates express app", () => {
    expect(src).toContain("const app = express()");
  });
});

describe("Sprint 746: Business Action URL Protocol Validation", () => {
  const src = readSource("server/routes-businesses.ts");

  it("validates URL protocol for action fields", () => {
    expect(src).toContain('["http:", "https:"].includes(parsed.protocol)');
  });

  it("rejects non-http/https protocols", () => {
    expect(src).toContain("must use http or https protocol");
  });

  it("rejects invalid URL format", () => {
    expect(src).toContain("is not a valid URL");
  });

  it("uses URL constructor for validation", () => {
    expect(src).toContain("new URL(val)");
  });
});
