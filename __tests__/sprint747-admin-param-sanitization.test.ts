/**
 * Sprint 747: Admin Route Parameter Sanitization
 *
 * Validates:
 * 1. Admin template name validated with alphanumeric pattern
 * 2. Push template create/update fields sanitized
 * 3. Admin promotion city param sanitized
 * 4. Admin claim document metadata sanitized
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readSource(filePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

describe("Sprint 747: Admin Email Template — Name Validation", () => {
  const src = readSource("server/routes-admin-templates.ts");

  it("imports sanitizeString", () => {
    expect(src).toContain('import { sanitizeString } from "./sanitize"');
  });

  it("sanitizes template name param", () => {
    expect(src).toContain("sanitizeString(req.params.name, 100)");
  });

  it("validates template name with alphanumeric pattern", () => {
    expect(src).toContain("/^[a-zA-Z0-9_-]+$/");
  });

  it("rejects invalid template names", () => {
    expect(src).toContain("Invalid template name");
  });
});

describe("Sprint 747: Push Template — Field Sanitization", () => {
  const src = readSource("server/routes-admin-push-templates.ts");

  it("imports sanitizeString", () => {
    expect(src).toContain('import { sanitizeString } from "./sanitize"');
  });

  it("sanitizes template ID on create", () => {
    expect(src).toContain("sanitizeString(req.body.id, 100)");
  });

  it("sanitizes template name", () => {
    expect(src).toContain("sanitizeString(req.body.name, 200)");
  });

  it("sanitizes template category", () => {
    expect(src).toContain("sanitizeString(req.body.category, 100)");
  });

  it("sanitizes template title", () => {
    expect(src).toContain("sanitizeString(req.body.title, 200)");
  });

  it("sanitizes template body", () => {
    expect(src).toContain("sanitizeString(req.body.body, 1000)");
  });

  it("validates active field as boolean on update", () => {
    expect(src).toContain('typeof req.body.active === "boolean"');
  });
});

describe("Sprint 747: Admin Promotion — City Sanitization", () => {
  const src = readSource("server/routes-admin-promotion.ts");

  it("imports sanitizeString", () => {
    expect(src).toContain('import { sanitizeString } from "./sanitize"');
  });

  it("sanitizes city param in status route", () => {
    // Should sanitize before passing to getPromotionStatus
    const lines = src.split("\n");
    const sanitizeCity = lines.some(l => l.includes("sanitizeString(req.params.city, 100)"));
    expect(sanitizeCity).toBe(true);
  });

  it("does not pass raw req.params.city to functions", () => {
    // After sanitization, all function calls should use the sanitized `city` variable
    expect(src).not.toContain("getPromotionStatus(req.params.city)");
    expect(src).not.toContain("promoteCity(req.params.city");
  });
});

describe("Sprint 747: Admin Claim Document — Metadata Sanitization", () => {
  const src = readSource("server/routes-admin-claims-verification.ts");

  it("sanitizes fileName", () => {
    expect(src).toContain('sanitizeString(req.body.fileName, 200)');
  });

  it("sanitizes fileType", () => {
    expect(src).toContain('sanitizeString(req.body.fileType, 50)');
  });

  it("sanitizes documentType", () => {
    expect(src).toContain('sanitizeString(req.body.documentType, 100)');
  });

  it("converts fileSize to Number", () => {
    expect(src).toContain("Number(req.body.fileSize)");
  });
});
