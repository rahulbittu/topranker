/**
 * Sprint 455 — Governance (SLT-455 + Audit #49 + Critique)
 *
 * Validates:
 * 1. SLT meeting doc
 * 2. Architecture audit
 * 3. Critique request
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. SLT Meeting
// ---------------------------------------------------------------------------
describe("SLT-455 meeting", () => {
  const src = readFile("docs/meetings/SLT-BACKLOG-455.md");

  it("exists with correct title", () => {
    expect(src).toContain("SLT Backlog Review — Sprint 455");
  });

  it("reviews sprints 451-454", () => {
    expect(src).toContain("Sprint 451");
    expect(src).toContain("Sprint 452");
    expect(src).toContain("Sprint 453");
    expect(src).toContain("Sprint 454");
  });

  it("has 456-460 roadmap", () => {
    expect(src).toContain("456");
    expect(src).toContain("460");
  });

  it("has file health table", () => {
    expect(src).toContain("File Health");
    expect(src).toContain("search.tsx");
    expect(src).toContain("DiscoverFilters");
  });

  it("identifies DiscoverFilters extraction need", () => {
    expect(src).toContain("95.3%");
    expect(src).toContain("EXTRACT");
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture Audit
// ---------------------------------------------------------------------------
describe("Arch Audit #49", () => {
  const src = readFile("docs/audits/ARCH-AUDIT-455.md");

  it("exists with correct title", () => {
    expect(src).toContain("Architecture Audit #49");
  });

  it("has grade A", () => {
    expect(src).toContain("Overall Grade: A");
  });

  it("has 49th consecutive A-range", () => {
    expect(src).toContain("49th consecutive");
  });

  it("has findings", () => {
    expect(src).toContain("M-1");
    expect(src).toContain("M-2");
    expect(src).toContain("L-1");
    expect(src).toContain("L-2");
  });

  it("tracks test count", () => {
    expect(src).toContain("8,444");
  });
});

// ---------------------------------------------------------------------------
// 3. Critique Request
// ---------------------------------------------------------------------------
describe("Critique request 451-454", () => {
  const src = readFile("docs/critique/inbox/SPRINT-451-454-REQUEST.md");

  it("exists", () => {
    expect(src).toContain("Critique Request: Sprints 451");
  });

  it("has 5 questions", () => {
    expect(src).toContain("### 1.");
    expect(src).toContain("### 2.");
    expect(src).toContain("### 3.");
    expect(src).toContain("### 4.");
    expect(src).toContain("### 5.");
  });

  it("covers URL security", () => {
    expect(src).toContain("URL Param Security");
  });

  it("covers admin auth", () => {
    expect(src).toContain("Authentication Gap");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 455 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-455-GOVERNANCE.md");
    expect(src).toContain("Sprint 455");
    expect(src).toContain("Governance");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-455-GOVERNANCE.md");
    expect(src).toContain("Retro 455");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-455-GOVERNANCE.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 456");
  });
});
