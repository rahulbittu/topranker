/**
 * Sprint 719 — User Feedback Collection Enhancement
 *
 * Owner: Priya Sharma (Design)
 *
 * Verifies:
 * - Feedback screen sends device context with submission
 * - Haptic feedback on category, star, and submit actions
 * - Analytics tracking on feedback submission
 * - Device context includes platform, version, build number
 * - Existing feedback form structure preserved
 */
import { describe, it, expect } from "vitest";

describe("Sprint 719 — Feedback Collection", () => {
  let source: string;

  it("loads feedback.tsx source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../app/feedback.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  // ── Device Context ──
  describe("Device context", () => {
    it("imports Constants from expo-constants", () => {
      expect(source).toContain("import Constants from");
    });

    it("constructs deviceContext object", () => {
      expect(source).toContain("deviceContext");
      expect(source).toContain("Platform.OS");
      expect(source).toContain("Platform.Version");
      expect(source).toContain("appVersion");
      expect(source).toContain("buildNumber");
    });

    it("sends deviceContext in submission body", () => {
      expect(source).toContain("deviceContext,");
    });
  });

  // ── Haptic Feedback ──
  describe("Haptic feedback", () => {
    it("imports hapticPress", () => {
      expect(source).toContain("import { hapticPress }");
    });

    it("fires haptic on category selection", () => {
      // Find the category chip onPress handler
      const categorySection = source.slice(
        source.indexOf("categoryChip"),
        source.indexOf("ratingRow") || source.indexOf("Rating"),
      );
      expect(categorySection).toContain("hapticPress()");
    });

    it("fires haptic on star rating", () => {
      const ratingSection = source.slice(
        source.indexOf("RATINGS.map"),
        source.indexOf("messageInput") || source.indexOf("YOUR FEEDBACK"),
      );
      expect(ratingSection).toContain("hapticPress()");
    });

    it("fires haptic on submit", () => {
      const submitSection = source.slice(
        source.indexOf("handleSubmit"),
        source.indexOf("setSubmitting(true)"),
      );
      expect(submitSection).toContain("hapticPress()");
    });
  });

  // ── Analytics ──
  describe("Analytics tracking", () => {
    it("imports track from analytics", () => {
      expect(source).toContain("import { track }");
    });

    it("tracks feedback_submitted on success", () => {
      expect(source).toContain("feedback_submitted");
    });
  });

  // ── Form Structure Preserved ──
  describe("Existing form structure", () => {
    it("has 4 categories", () => {
      expect(source).toContain('"bug"');
      expect(source).toContain('"feature"');
      expect(source).toContain('"praise"');
      expect(source).toContain('"other"');
    });

    it("has 5-star rating", () => {
      expect(source).toContain("[1, 2, 3, 4, 5]");
    });

    it("has message input with 2000 char limit", () => {
      expect(source).toContain("maxLength={2000}");
    });

    it("shows success screen after submission", () => {
      expect(source).toContain("Thank You!");
      expect(source).toContain("checkmark-circle");
    });

    it("has accessible submit button", () => {
      expect(source).toContain('accessibilityLabel="Submit feedback"');
    });

    it("posts to /api/feedback", () => {
      expect(source).toContain("/api/feedback");
    });
  });
});
