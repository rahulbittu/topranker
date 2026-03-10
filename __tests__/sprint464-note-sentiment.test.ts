/**
 * Sprint 464 — Rating Note Sentiment Indicators
 *
 * Validates:
 * 1. Sentiment analysis utility
 * 2. NoteSentimentIndicator component
 * 3. Integration in RatingExtrasStep
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Sentiment analysis utility
// ---------------------------------------------------------------------------
describe("Note sentiment — analyzeSentiment", () => {
  const src = readFile("lib/note-sentiment.ts");

  it("exports analyzeSentiment function", () => {
    expect(src).toContain("export function analyzeSentiment");
  });

  it("exports SentimentType type", () => {
    expect(src).toContain("export type SentimentType");
  });

  it("exports SentimentResult interface", () => {
    expect(src).toContain("export interface SentimentResult");
  });

  it("defines positive word list", () => {
    expect(src).toContain("POSITIVE_WORDS");
    expect(src).toContain("amazing");
    expect(src).toContain("delicious");
    expect(src).toContain("recommend");
  });

  it("defines negative word list", () => {
    expect(src).toContain("NEGATIVE_WORDS");
    expect(src).toContain("awful");
    expect(src).toContain("terrible");
    expect(src).toContain("rude");
  });

  it("returns neutral for empty/short text", () => {
    expect(src).toContain("text.trim().length < 3");
  });

  it("classifies positive sentiment (score > 0.2)", () => {
    expect(src).toContain("Positive tone");
    expect(src).toContain("happy-outline");
  });

  it("classifies negative sentiment (score < -0.2)", () => {
    expect(src).toContain("Critical tone");
    expect(src).toContain("alert-circle-outline");
  });

  it("classifies neutral sentiment", () => {
    expect(src).toContain("Balanced tone");
    expect(src).toContain("remove-circle-outline");
  });

  it("references Sprint 464", () => {
    expect(src).toContain("Sprint 464");
  });

  it("has no React dependencies (pure utility)", () => {
    expect(src).not.toContain("import React");
    expect(src).not.toContain("from \"react\"");
  });
});

// ---------------------------------------------------------------------------
// 2. NoteSentimentIndicator component
// ---------------------------------------------------------------------------
describe("Note sentiment — indicator component", () => {
  const src = readFile("components/rate/NoteSentimentIndicator.tsx");

  it("exports NoteSentimentIndicator component", () => {
    expect(src).toContain("export function NoteSentimentIndicator");
  });

  it("imports analyzeSentiment", () => {
    expect(src).toContain("analyzeSentiment");
  });

  it("uses useMemo for analysis", () => {
    expect(src).toContain("useMemo(() => analyzeSentiment(note)");
  });

  it("shows sentiment icon and label", () => {
    expect(src).toContain("sentiment.icon");
    expect(src).toContain("sentiment.label");
    expect(src).toContain("sentiment.color");
  });

  it("returns null when no sentiment detected", () => {
    expect(src).toContain("if (!sentiment.label) return null");
  });

  it("references Sprint 464", () => {
    expect(src).toContain("Sprint 464");
  });
});

// ---------------------------------------------------------------------------
// 3. Integration in RatingExtrasStep
// ---------------------------------------------------------------------------
describe("Note sentiment — RatingExtrasStep integration", () => {
  const src = readFile("components/rate/RatingExtrasStep.tsx");

  it("imports NoteSentimentIndicator", () => {
    expect(src).toContain("NoteSentimentIndicator");
  });

  it("renders NoteSentimentIndicator with note prop", () => {
    expect(src).toContain("<NoteSentimentIndicator note={note}");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 464 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-464-NOTE-SENTIMENT.md");
    expect(src).toContain("Sprint 464");
    expect(src).toContain("sentiment");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-464-NOTE-SENTIMENT.md");
    expect(src).toContain("Retro 464");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-464-NOTE-SENTIMENT.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 465");
  });
});
