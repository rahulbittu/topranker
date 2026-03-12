/**
 * Sprint 693: Pull-to-refresh polish — last-updated timestamps across screens.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Rankings (already had timestamp) ───────────────────────────────────

describe("Sprint 693: Rankings timestamp", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("shows dataUpdatedAt", () => {
    expect(src).toContain("dataUpdatedAt");
  });

  it("uses formatTimeAgo", () => {
    expect(src).toContain("formatTimeAgo");
  });
});

// ─── Discover timestamp ─────────────────────────────────────────────────

describe("Sprint 693: Discover timestamp", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports formatTimeAgo", () => {
    expect(src).toContain('import { formatTimeAgo } from "@/lib/data"');
  });

  it("destructures dataUpdatedAt from useInfiniteSearch", () => {
    expect(src).toContain("dataUpdatedAt");
  });
});

// ─── Challenger timestamp ───────────────────────────────────────────────

describe("Sprint 693: Challenger timestamp", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("imports formatTimeAgo", () => {
    expect(src).toContain('import { formatTimeAgo } from "@/lib/data"');
  });

  it("destructures dataUpdatedAt from useQuery", () => {
    expect(src).toContain("dataUpdatedAt");
  });

  it("shows last updated text", () => {
    expect(src).toContain("formatTimeAgo(dataUpdatedAt)");
  });

  it("has lastUpdated style", () => {
    expect(src).toContain("lastUpdated:");
  });
});

// ─── useInfiniteSearch exposes dataUpdatedAt ────────────────────────────

describe("Sprint 693: useInfiniteSearch hook", () => {
  const src = readFile("lib/hooks/useInfiniteSearch.ts");

  it("returns dataUpdatedAt", () => {
    expect(src).toContain("dataUpdatedAt");
  });

  it("destructures dataUpdatedAt from useInfiniteQuery", () => {
    expect(src).toContain("dataUpdatedAt,\n  } = useInfiniteQuery");
  });
});
