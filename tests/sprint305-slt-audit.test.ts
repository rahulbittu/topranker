/**
 * Sprint 305: SLT Meeting + Arch Audit #43
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const fileExists = (relPath: string) => fs.existsSync(path.join(ROOT, relPath));
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 305 — SLT Meeting + Arch Audit #43", () => {
  // ─── Governance docs exist ─────────────────────────────────

  it("SLT-BACKLOG-305.md exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-305.md")).toBe(true);
  });

  it("ARCH-AUDIT-43.md exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-43.md")).toBe(true);
  });

  it("critique request for Sprint 300-304 exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-300-304-REQUEST.md")).toBe(true);
  });

  it("sprint doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-305-SLT-AUDIT.md")).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fileExists("docs/retros/RETRO-305-SLT-AUDIT.md")).toBe(true);
  });

  // ─── SLT content ──────────────────────────────────────────

  it("SLT mentions Sprint 301-304 review", () => {
    const doc = readFile("docs/meetings/SLT-BACKLOG-305.md");
    expect(doc).toContain("301");
    expect(doc).toContain("304");
  });

  it("SLT includes roadmap for 306-310", () => {
    const doc = readFile("docs/meetings/SLT-BACKLOG-305.md");
    expect(doc).toContain("306");
    expect(doc).toContain("310");
  });

  it("SLT mentions anti-requirement violations", () => {
    const doc = readFile("docs/meetings/SLT-BACKLOG-305.md");
    expect(doc).toContain("anti-requirement");
  });

  // ─── Audit content ────────────────────────────────────────

  it("audit grade is A", () => {
    const doc = readFile("docs/audits/ARCH-AUDIT-43.md");
    expect(doc).toContain("Grade: A");
  });

  it("audit mentions 19th consecutive A-range", () => {
    const doc = readFile("docs/audits/ARCH-AUDIT-43.md");
    expect(doc).toContain("19th consecutive");
  });

  it("audit reports 0 critical issues", () => {
    const doc = readFile("docs/audits/ARCH-AUDIT-43.md");
    expect(doc).toMatch(/Critical.*0/);
  });

  it("audit reports 5,865 tests", () => {
    const doc = readFile("docs/audits/ARCH-AUDIT-43.md");
    expect(doc).toContain("5,865");
  });
});
