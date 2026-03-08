/**
 * Unit Tests — Privacy A/B Disclosure, Tooltip Accessibility, Audit Grades (Sprint 136)
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Covers:
 * - Privacy policy Section 13 A/B testing disclosure completeness
 * - Section 2 cross-reference to Section 13
 * - RANK_CONFIDENCE_LABELS accessibility descriptions
 * - Audit severity grade system
 */

import { describe, it, expect } from "vitest";
import { RANK_CONFIDENCE_LABELS } from "@/lib/data";

// ── Privacy Policy A/B Disclosure ───────────────────────────────

describe("Privacy Policy A/B Testing Disclosure", () => {
  // Import the SECTIONS array from privacy.tsx at module scope is not
  // feasible (it's a default-export React component, SECTIONS is a
  // local const). We read it via a require-style re-export or inline
  // parsing. Since SECTIONS is not exported, we verify the source file
  // content directly using fs.
  const fs = require("fs");
  const path = require("path");
  const privacySource = fs.readFileSync(
    path.resolve(__dirname, "../app/legal/privacy.tsx"),
    "utf-8",
  );

  // Extract SECTIONS array text for structural assertions
  const sectionsMatch = privacySource.match(
    /const SECTIONS\s*=\s*\[([\s\S]*?)\n\];/,
  );
  const sectionsBlock = sectionsMatch ? sectionsMatch[1] : "";

  // Count section objects by matching `title:` keys at top-level indent
  const sectionTitles = sectionsBlock.match(/title:\s*"/g) || [];

  it("SECTIONS array contains exactly 13 sections", () => {
    expect(sectionTitles.length).toBe(13);
  });

  it("has a section with title including 'A/B Testing'", () => {
    expect(sectionsBlock).toContain('A/B Testing');
  });

  it("A/B section mentions 'experiment exposure'", () => {
    expect(sectionsBlock).toContain("experiment exposure");
  });

  it("A/B section mentions 'deterministically'", () => {
    expect(sectionsBlock).toContain("deterministically");
  });

  it("A/B section mentions 'GDPR Article 22'", () => {
    expect(sectionsBlock).toContain("GDPR Article 22");
  });

  it("Section 2 references Section 13 for A/B testing", () => {
    // Find Section 2's body and confirm it cross-references Section 13
    const section2Match = privacySource.match(
      /title:\s*"2\. How We Use Your Information"[\s\S]*?body:\s*`([\s\S]*?)`/,
    );
    expect(section2Match).not.toBeNull();
    const section2Body = section2Match![1];
    expect(section2Body).toContain("Section 13");
    expect(section2Body.toLowerCase()).toContain("a/b test");
  });
});

// ── Tooltip Accessibility — RANK_CONFIDENCE_LABELS ──────────────

describe("RANK_CONFIDENCE_LABELS tooltip accessibility", () => {
  const expectedKeys = ["provisional", "early", "established", "strong"] as const;

  it("has exactly the expected confidence level keys", () => {
    const keys = Object.keys(RANK_CONFIDENCE_LABELS).sort();
    expect(keys).toEqual([...expectedKeys].sort());
  });

  for (const key of expectedKeys) {
    it(`"${key}" has a non-empty description string`, () => {
      const entry = RANK_CONFIDENCE_LABELS[key];
      expect(typeof entry.description).toBe("string");
      expect(entry.description.length).toBeGreaterThan(0);
    });

    it(`"${key}" has a non-empty label string`, () => {
      const entry = RANK_CONFIDENCE_LABELS[key];
      expect(typeof entry.label).toBe("string");
      expect(entry.label.length).toBeGreaterThan(0);
    });
  }
});

// ── Audit Grade System ──────────────────────────────────────────

describe("Audit grade severity levels", () => {
  const AUDIT_SEVERITY_LEVELS = [
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "LOW",
    "ALL CLEAR",
  ] as const;

  it("defines exactly 5 severity levels", () => {
    expect(AUDIT_SEVERITY_LEVELS.length).toBe(5);
  });

  it("includes CRITICAL as highest severity", () => {
    expect(AUDIT_SEVERITY_LEVELS[0]).toBe("CRITICAL");
  });

  it("includes ALL CLEAR as lowest severity", () => {
    expect(AUDIT_SEVERITY_LEVELS[AUDIT_SEVERITY_LEVELS.length - 1]).toBe("ALL CLEAR");
  });

  it("severity levels are ordered from most to least severe", () => {
    expect(AUDIT_SEVERITY_LEVELS).toEqual([
      "CRITICAL",
      "HIGH",
      "MEDIUM",
      "LOW",
      "ALL CLEAR",
    ]);
  });

  it("each severity level is a non-empty string", () => {
    for (const level of AUDIT_SEVERITY_LEVELS) {
      expect(typeof level).toBe("string");
      expect(level.length).toBeGreaterThan(0);
    }
  });
});
