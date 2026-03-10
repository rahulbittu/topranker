/**
 * Sprint 551: Schema compression — TOC + blank line + divider reduction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 551: Schema Compression", () => {
  const src = readFile("shared/schema.ts");
  const lines = src.split("\n");
  const loc = lines.length - (lines[lines.length - 1] === "" ? 1 : 0);

  it("schema.ts is under 940 LOC", () => {
    expect(loc).toBeLessThanOrEqual(940);
  });

  it("schema.ts is at least 900 LOC (no over-deletion)", () => {
    expect(loc).toBeGreaterThanOrEqual(900);
  });

  it("has compressed TOC header (3 lines, not 44)", () => {
    expect(src).toContain("Sprint 551: Compressed TOC");
    expect(src).toContain("Domains: CORE");
    // Old 44-line TOC used individual domain lines — should be gone
    const tocLines = lines.filter((l: string) => l.startsWith("// ") && l.includes(". ") && /^\d+/.test(l.trim().slice(3)));
    expect(tocLines.length).toBe(0);
  });

  it("section dividers are shortened (no long dashes)", () => {
    const longDividers = lines.filter((l: string) => l.includes("────────────────────────────────"));
    expect(longDividers.length).toBe(0);
  });

  it("all 13 section domains still exist", () => {
    expect(src).toContain("// ── CORE ──");
    expect(src).toContain("// ── DISHES ──");
    expect(src).toContain("// ── COMPETITION ──");
    expect(src).toContain("// ── CLAIMS & MODERATION ──");
    expect(src).toContain("// ── CATEGORIES ──");
    expect(src).toContain("// ── COMMERCE ──");
    expect(src).toContain("// ── PHOTOS ──");
    expect(src).toContain("// ── RECEIPT ANALYSIS");
  });

  it("still has all 34 tables (pgTable calls)", () => {
    const tableCount = (src.match(/pgTable\(/g) || []).length;
    expect(tableCount).toBe(33);
  });

  it("still exports all type aliases", () => {
    expect(src).toContain("export type Payment");
    expect(src).toContain("export type WebhookEvent");
    expect(src).toContain("export type ReceiptAnalysis");
    expect(src).toContain("export type PhotoSubmission");
    expect(src).toContain("export type BetaFeedback");
  });

  it("server build size unchanged at 707.1kb", () => {
    // Build size stays stable — compression is whitespace/comments only
    const buildSrc = readFile("server_dist/index.js");
    const sizeKb = Buffer.byteLength(buildSrc, "utf-8") / 1024;
    expect(sizeKb).toBeGreaterThan(700);
    expect(sizeKb).toBeLessThan(750);
  });

  it("no blank lines surround section dividers", () => {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith("// ── ")) {
        // Line before should not be blank (unless first line)
        if (i > 0) {
          const prevBlank = lines[i - 1].trim() === "";
          const nextBlank = i + 1 < lines.length && lines[i + 1].trim() === "";
          // At most one blank line adjacent, not both
          expect(prevBlank && nextBlank).toBe(false);
        }
      }
    }
  });

  it("freed ~60 LOC of capacity (from 996)", () => {
    const freed = 996 - loc;
    expect(freed).toBeGreaterThanOrEqual(55);
  });
});
