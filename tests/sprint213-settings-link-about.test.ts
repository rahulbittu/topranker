/**
 * Sprint 213 — Settings Feedback Link + About/Marketing Page
 *
 * Validates:
 * 1. Feedback link in settings
 * 2. About page structure
 * 3. Features section
 * 4. How It Works section
 * 5. CTA section
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Settings feedback link
// ---------------------------------------------------------------------------
describe("Feedback link in settings — app/settings.tsx", () => {
  const src = readFile("app/settings.tsx");

  it("has HELP & FEEDBACK section", () => {
    expect(src).toContain("HELP & FEEDBACK");
  });

  it("has Send Feedback link", () => {
    expect(src).toContain("Send Feedback");
  });

  it("navigates to /feedback", () => {
    expect(src).toContain('router.push("/feedback")');
  });

  it("uses chatbox icon", () => {
    expect(src).toContain("chatbox-ellipses-outline");
  });
});

// ---------------------------------------------------------------------------
// 2. About page structure
// ---------------------------------------------------------------------------
describe("About page — app/about.tsx", () => {
  it("about page exists", () => {
    expect(fileExists("app/about.tsx")).toBe(true);
  });

  const src = readFile("app/about.tsx");

  it("exports default AboutPage component", () => {
    expect(src).toContain("export default function AboutPage");
  });

  it("has header with title", () => {
    expect(src).toContain("About TopRanker");
  });

  it("has hero section", () => {
    expect(src).toContain("Rankings You Can Trust");
  });

  it("mentions no fake reviews", () => {
    expect(src).toContain("No fake reviews");
  });

  it("mentions trust-weighted", () => {
    expect(src).toContain("trust-weighted");
  });
});

// ---------------------------------------------------------------------------
// 3. Features section
// ---------------------------------------------------------------------------
describe("Features — app/about.tsx", () => {
  const src = readFile("app/about.tsx");

  it("has Why TopRanker section", () => {
    expect(src).toContain("Why TopRanker?");
  });

  it("lists Trust-Weighted Rankings feature", () => {
    expect(src).toContain("Trust-Weighted Rankings");
  });

  it("lists Credibility Tiers feature", () => {
    expect(src).toContain("Credibility Tiers");
  });

  it("lists Challenger Battles feature", () => {
    expect(src).toContain("Challenger Battles");
  });

  it("lists Trust Network feature", () => {
    expect(src).toContain("Trust Network");
  });
});

// ---------------------------------------------------------------------------
// 4. How It Works section
// ---------------------------------------------------------------------------
describe("How It Works — app/about.tsx", () => {
  const src = readFile("app/about.tsx");

  it("has How It Works section", () => {
    expect(src).toContain("How It Works");
  });

  it("has 4 steps", () => {
    expect(src).toContain("Rate restaurants");
    expect(src).toContain("Build credibility");
    expect(src).toContain("influence grows");
    expect(src).toContain("Discover the best");
  });
});

// ---------------------------------------------------------------------------
// 5. CTA section
// ---------------------------------------------------------------------------
describe("CTA — app/about.tsx", () => {
  const src = readFile("app/about.tsx");

  it("has Ready to join CTA", () => {
    expect(src).toContain("Ready to join?");
  });

  it("has Get Started button", () => {
    expect(src).toContain("Get Started");
  });

  it("links to signup", () => {
    expect(src).toContain('router.push("/auth/signup")');
  });

  it("has trust message at bottom", () => {
    expect(src).toContain("Built with integrity");
  });

  it("has subtext", () => {
    expect(src).toContain("Your taste matters");
  });
});
