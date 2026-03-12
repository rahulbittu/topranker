/**
 * Sprint 697: ErrorState extraction to own component file.
 * Resolves A150-L1 — ErrorState was in NetworkBanner.tsx.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}

// ─── ErrorState.tsx ─────────────────────────────────────────────────────

describe("Sprint 697: ErrorState component file", () => {
  it("ErrorState.tsx exists", () => {
    expect(fileExists("components/ErrorState.tsx")).toBe(true);
  });

  const src = readFile("components/ErrorState.tsx");

  it("exports ErrorState function", () => {
    expect(src).toContain("export function ErrorState");
  });

  it("exports EmptyState function", () => {
    expect(src).toContain("export function EmptyState");
  });

  it("ErrorState has default title", () => {
    expect(src).toContain("Something went wrong");
  });

  it("ErrorState has default subtitle", () => {
    expect(src).toContain("Check your connection and try again");
  });

  it("ErrorState has retry button", () => {
    expect(src).toContain("onRetry");
    expect(src).toContain("Retry");
  });

  it("uses brand typography", () => {
    expect(src).toContain("PlayfairDisplay_700Bold");
    expect(src).toContain("DMSans_400Regular");
  });

  it("uses brand amber color", () => {
    expect(src).toContain("BRAND.colors.amber");
  });
});

// ─── NetworkBanner.tsx — re-exports ─────────────────────────────────────

describe("Sprint 697: NetworkBanner re-exports", () => {
  const src = readFile("components/NetworkBanner.tsx");

  it("re-exports ErrorState from ErrorState.tsx", () => {
    expect(src).toContain('export { ErrorState, EmptyState } from "@/components/ErrorState"');
  });

  it("no longer defines ErrorState inline", () => {
    expect(src).not.toContain("export function ErrorState");
  });

  it("no longer defines EmptyState inline", () => {
    expect(src).not.toContain("export function EmptyState");
  });

  it("no longer has errorContainer style", () => {
    expect(src).not.toContain("errorContainer:");
  });

  it("no longer imports TypedIcon", () => {
    expect(src).not.toContain("TypedIcon");
  });

  it("still exports NetworkBanner", () => {
    expect(src).toContain("export function NetworkBanner");
  });
});

// ─── Backward Compatibility ─────────────────────────────────────────────

describe("Sprint 697: backward compatibility — imports still work", () => {
  const screens = [
    "app/(tabs)/index.tsx",
    "app/(tabs)/search.tsx",
    "app/(tabs)/profile.tsx",
    "app/(tabs)/challenger.tsx",
  ];

  for (const file of screens) {
    it(`${file} imports ErrorState from NetworkBanner`, () => {
      const src = readFile(file);
      expect(src).toContain("ErrorState");
      expect(src).toContain("@/components/NetworkBanner");
    });
  }
});
