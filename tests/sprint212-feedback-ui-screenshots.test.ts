/**
 * Sprint 212 — In-App Feedback UI + Screenshot Prep
 *
 * Validates:
 * 1. Feedback screen structure
 * 2. Category selection UI
 * 3. Star rating UI
 * 4. Message input
 * 5. Submit behavior
 * 6. Success state
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Feedback screen structure
// ---------------------------------------------------------------------------
describe("Feedback screen — app/feedback.tsx", () => {
  it("feedback screen exists", () => {
    expect(fileExists("app/feedback.tsx")).toBe(true);
  });

  const src = readFile("app/feedback.tsx");

  it("exports default FeedbackScreen component", () => {
    expect(src).toContain("export default function FeedbackScreen");
  });

  it("imports useAuth", () => {
    expect(src).toContain("useAuth");
  });

  it("imports getApiUrl", () => {
    expect(src).toContain("getApiUrl");
  });

  it("has header with title", () => {
    expect(src).toContain("Send Feedback");
  });

  it("has back button", () => {
    expect(src).toContain("router.back()");
  });
});

// ---------------------------------------------------------------------------
// 2. Category selection
// ---------------------------------------------------------------------------
describe("Category selection — app/feedback.tsx", () => {
  const src = readFile("app/feedback.tsx");

  it("defines CATEGORIES array", () => {
    expect(src).toContain("const CATEGORIES");
  });

  it("has bug category", () => {
    expect(src).toContain('"bug"');
    expect(src).toContain("Bug Report");
  });

  it("has feature category", () => {
    expect(src).toContain('"feature"');
    expect(src).toContain("Feature Request");
  });

  it("has praise category", () => {
    expect(src).toContain('"praise"');
    expect(src).toContain("Something Great");
  });

  it("has other category", () => {
    expect(src).toContain('"other"');
  });

  it("has category state", () => {
    expect(src).toContain("setCategory");
  });

  it("renders category chips", () => {
    expect(src).toContain("categoryChip");
  });
});

// ---------------------------------------------------------------------------
// 3. Star rating
// ---------------------------------------------------------------------------
describe("Star rating — app/feedback.tsx", () => {
  const src = readFile("app/feedback.tsx");

  it("defines RATINGS array", () => {
    expect(src).toContain("const RATINGS");
  });

  it("has rating state", () => {
    expect(src).toContain("setRating");
  });

  it("renders star icons", () => {
    expect(src).toContain('"star"');
    expect(src).toContain('"star-outline"');
  });

  it("uses amber color for active stars", () => {
    expect(src).toContain("BRAND.colors.amber");
  });
});

// ---------------------------------------------------------------------------
// 4. Message input
// ---------------------------------------------------------------------------
describe("Message input — app/feedback.tsx", () => {
  const src = readFile("app/feedback.tsx");

  it("has TextInput for message", () => {
    expect(src).toContain("TextInput");
  });

  it("has maxLength of 2000", () => {
    expect(src).toContain("maxLength={2000}");
  });

  it("shows character count", () => {
    expect(src).toContain("message.length");
    expect(src).toContain("/2000");
  });

  it("has placeholder text", () => {
    expect(src).toContain("Tell us what you think");
  });
});

// ---------------------------------------------------------------------------
// 5. Submit behavior
// ---------------------------------------------------------------------------
describe("Submit — app/feedback.tsx", () => {
  const src = readFile("app/feedback.tsx");

  it("sends POST to /api/feedback", () => {
    expect(src).toContain("/api/feedback");
  });

  it("sends rating, category, message in body", () => {
    expect(src).toContain("rating,");
    expect(src).toContain("category,");
    expect(src).toContain("message:");
  });

  it("disables button when not canSubmit", () => {
    expect(src).toContain("canSubmit");
  });

  it("shows loading indicator while submitting", () => {
    expect(src).toContain("ActivityIndicator");
  });

  it("validates required fields", () => {
    expect(src).toContain("rating > 0");
    expect(src).toContain("message.trim().length > 0");
  });
});

// ---------------------------------------------------------------------------
// 6. Success state
// ---------------------------------------------------------------------------
describe("Success state — app/feedback.tsx", () => {
  const src = readFile("app/feedback.tsx");

  it("has submitted state", () => {
    expect(src).toContain("submitted");
    expect(src).toContain("setSubmitted");
  });

  it("shows thank you message", () => {
    expect(src).toContain("Thank You");
  });

  it("has done button", () => {
    expect(src).toContain("doneButton");
  });

  it("shows success icon", () => {
    expect(src).toContain("checkmark-circle");
  });
});
