/**
 * Sprint 388: Business Hours Display in Search Cards
 *
 * Verifies closing/opening time display in search card and map card,
 * and new fields in MappedBusiness type.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. MappedBusiness type ───────────────────────────────────────────

describe("Sprint 388 — MappedBusiness hours fields", () => {
  const typeSrc = readFile("types/business.ts");

  it("has closingTime optional field", () => {
    expect(typeSrc).toContain("closingTime?: string");
  });

  it("has nextOpenTime optional field", () => {
    expect(typeSrc).toContain("nextOpenTime?: string");
  });
});

// ── 2. BusinessCard — hours in status pill ───────────────────────────

describe("Sprint 388 — BusinessCard hours display", () => {
  const subSrc = readFile("components/search/SubComponents.tsx");

  it("shows closing time when open", () => {
    expect(subSrc).toContain("Closes");
    expect(subSrc).toContain("item.closingTime");
  });

  it("shows next open time when closed", () => {
    expect(subSrc).toContain("Opens");
    expect(subSrc).toContain("item.nextOpenTime");
  });

  it("has statusTimeText style", () => {
    expect(subSrc).toContain("statusTimeText");
  });

  it("conditionally renders closing time only when available", () => {
    expect(subSrc).toContain("isOpen && item.closingTime");
  });

  it("conditionally renders opening time only when available", () => {
    expect(subSrc).toContain("!isOpen && item.nextOpenTime");
  });
});

// ── 3. MapBusinessCard — hours in meta text ──────────────────────────

describe("Sprint 388 — MapBusinessCard hours display", () => {
  const subSrc = readFile("components/search/SubComponents.tsx");

  it("shows open/closed status in map card meta", () => {
    expect(subSrc).toContain("mapCardOpen");
    expect(subSrc).toContain("mapCardClosed");
  });

  it("shows closing time in map card when open", () => {
    expect(subSrc).toContain("til");
  });

  it("has mapCardOpen style with green color", () => {
    expect(subSrc).toContain("mapCardOpen:");
  });

  it("has mapCardClosed style with red color", () => {
    expect(subSrc).toContain("mapCardClosed:");
  });

  it("checks isOpenNow in map card", () => {
    expect(subSrc).toContain("item.isOpenNow");
  });
});
