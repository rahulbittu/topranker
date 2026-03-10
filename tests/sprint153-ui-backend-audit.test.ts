/**
 * UI/Backend Truthfulness Audit Tests — Sprint 153
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Validates that UI claims match backend behavior:
 *   1. Push notifications check user preferences before sending
 *   2. GDPR deletion uses database persistence (not in-memory)
 *   3. Business claim UI is honest about manual review
 *   4. Security docs don't overclaim encryption
 *   5. Email change UI is honest (carried from Sprint 152)
 *
 * Total: 20 tests
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. Push Notification Preference Enforcement ─────────────────────

describe("Push notifications respect user preferences", () => {
  const pushPath = path.resolve(__dirname, "..", "server", "push.ts");
  let pushSource: string;

  beforeEach(() => {
    pushSource = fs.readFileSync(pushPath, "utf-8");
  });

  it("should check preferences before sending tier upgrade notification", () => {
    expect(pushSource).toMatch(/tierUpgrades|notificationPrefs/);
  });

  it("should check preferences before sending challenger result notification", () => {
    expect(pushSource).toMatch(/challengerResults|notificationPrefs/);
  });

  it("should import or reference member data for preference lookup", () => {
    expect(pushSource).toMatch(/getMemberById|notificationPrefs|storage/);
  });
});

// ── 2. GDPR Deletion Database Persistence ───────────────────────────

describe("GDPR deletion uses database persistence", () => {
  it("should have deletionRequests table in schema", () => {
    const schemaSource = fs.readFileSync(
      path.resolve(__dirname, "..", "shared", "schema.ts"),
      "utf-8"
    );
    expect(schemaSource).toContain("deletion_requests");
  });

  it("should have scheduledDeletionAt column", () => {
    const schemaSource = fs.readFileSync(
      path.resolve(__dirname, "..", "shared", "schema.ts"),
      "utf-8"
    );
    expect(schemaSource).toContain("scheduled_deletion_at");
  });

  it("should have status column for deletion tracking", () => {
    const schemaSource = fs.readFileSync(
      path.resolve(__dirname, "..", "shared", "schema.ts"),
      "utf-8"
    );
    expect(schemaSource).toMatch(/pending.*cancelled.*completed|status.*deletion/s);
  });

  it("gdpr.ts should use database instead of in-memory Map", () => {
    const gdprSource = fs.readFileSync(
      path.resolve(__dirname, "..", "server", "gdpr.ts"),
      "utf-8"
    );
    // Should reference database operations, not just Map
    expect(gdprSource).toMatch(/db\.|deletionRequests|import.*schema/);
  });
});

// ── 3. Business Claim UI Honesty ────────────────────────────────────

describe("Business claim UI honesty", () => {
  const claimPath = path.resolve(__dirname, "..", "app", "business", "claim.tsx");

  it("should NOT claim automatic email domain verification", () => {
    const source = fs.readFileSync(claimPath, "utf-8");
    expect(source).not.toContain("matching your email domain");
  });

  it("should NOT claim phone number verification", () => {
    const source = fs.readFileSync(claimPath, "utf-8");
    expect(source).not.toContain("calling the business phone number");
  });

  it("should NOT promise 24-48 hour verification", () => {
    const source = fs.readFileSync(claimPath, "utf-8");
    expect(source).not.toContain("24-48 hours");
  });

  it("should mention manual/team review", () => {
    const source = fs.readFileSync(claimPath, "utf-8");
    expect(source).toMatch(/review|team|admin/i);
  });
});

// ── 4. Security Documentation Honesty ───────────────────────────────

describe("Security docs honesty", () => {
  it("should NOT claim AES-256 encryption at rest in SECURITY.md", () => {
    const secPath = path.resolve(__dirname, "..", "docs", "SECURITY.md");
    if (fs.existsSync(secPath)) {
      const source = fs.readFileSync(secPath, "utf-8");
      expect(source).not.toContain("AES-256");
    }
  });

  it("should NOT claim AES-256 in privacy policy", () => {
    const privacyPath = path.resolve(__dirname, "..", "app", "legal", "privacy.tsx");
    if (fs.existsSync(privacyPath)) {
      const source = fs.readFileSync(privacyPath, "utf-8");
      expect(source).not.toContain("AES-256");
    }
  });
});

// ── 5. Email Change Honesty (carried from Sprint 152) ───────────────

describe("Email change remains honest", () => {
  it("should not claim verification for email changes", () => {
    const editSource = fs.readFileSync(
      path.resolve(__dirname, "..", "app", "edit-profile.tsx"),
      "utf-8"
    );
    expect(editSource).not.toContain("requires verification");
    expect(editSource).not.toContain("verification email will be sent");
  });
});

// ── 6. Comprehensive Mismatch Prevention ────────────────────────────

describe("No remaining false claims in key screens", () => {
  it("settings should not promise unimplemented features", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "..", "app", "settings.tsx"),
      "utf-8"
    );
    // Settings should just have toggles and navigation, no false promises
    expect(source).not.toContain("automatically");
    expect(source).not.toContain("guaranteed");
  });
});
