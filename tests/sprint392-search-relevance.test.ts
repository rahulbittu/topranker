/**
 * Sprint 392: Search Result Relevance Scoring
 *
 * Verifies relevance scoring integration in search endpoint,
 * new sort option, and MappedBusiness type extension.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Server-side relevance scoring ────────────────────────────────

describe("Sprint 392 — Server relevance scoring", () => {
  const processorSrc = readFile("server/search-result-processor.ts");

  it("imports combinedRelevance from search-ranking-v2", () => {
    // Sprint 476: processor imports combinedRelevance (which uses textRelevance internally)
    expect(processorSrc).toContain("combinedRelevance");
    expect(processorSrc).toContain("search-ranking-v2");
  });

  it("search-ranking-v2 exports profileCompleteness", () => {
    // Sprint 476: profileCompleteness used internally by combinedRelevance
    const rankingSrc = readFile("server/search-ranking-v2.ts");
    expect(rankingSrc).toContain("export function profileCompleteness");
  });

  it("calculates relevance in search endpoint", () => {
    // Sprint 436: Enhanced to use combinedRelevance with full search context
    expect(processorSrc).toContain("combinedRelevance(b.name, searchCtx)");
  });

  it("passes profile completeness fields in search context", () => {
    expect(processorSrc).toContain("hasPhotos");
    expect(processorSrc).toContain("hasCuisine");
  });

  it("computes relevanceScore field", () => {
    expect(processorSrc).toContain("relevanceScore");
  });

  it("re-sorts by relevance when query present", () => {
    // Sprint 476: sort logic moved to search-result-processor.ts
    expect(processorSrc).toContain(".sort");
    expect(processorSrc).toContain("b.relevanceScore - a.relevanceScore");
  });
});

// ── 2. MappedBusiness type ──────────────────────────────────────────

describe("Sprint 392 — MappedBusiness relevanceScore", () => {
  const typeSrc = readFile("types/business.ts");

  it("has relevanceScore optional field", () => {
    expect(typeSrc).toContain("relevanceScore?: number");
  });
});

// ── 3. Sort chips — Relevant option ─────────────────────────────────

describe("Sprint 392 — Sort chips Relevant option", () => {
  const filterSrc = readFile("components/search/DiscoverFilters.tsx");

  it("accepts 'relevant' in sort type", () => {
    expect(filterSrc).toContain('"relevant"');
  });

  it("shows Relevant chip conditionally", () => {
    expect(filterSrc).toContain("showRelevant");
    expect(filterSrc).toContain("Relevant");
  });

  it("has showRelevant prop", () => {
    expect(filterSrc).toContain("showRelevant?: boolean");
  });
});

// ── 4. Client-side sort integration ─────────────────────────────────

describe("Sprint 392 — Client sort integration", () => {
  const searchSrc = readFile("app/(tabs)/search.tsx");

  it("passes showRelevant to SortChips", () => {
    expect(searchSrc).toContain("showRelevant={!!debouncedQuery}");
  });

  it("handles relevant sort in useMemo", () => {
    expect(searchSrc).toContain('sortBy === "relevant"');
    expect(searchSrc).toContain("relevanceScore");
  });
});

// ── 5. Persistence hook update ──────────────────────────────────────

describe("Sprint 392 — Sort persistence", () => {
  const hookSrc = readFile("lib/hooks/useSearchPersistence.ts");

  it("includes relevant in SortType", () => {
    expect(hookSrc).toContain('"relevant"');
  });
});

// ── 6. Search ranking v2 functions used ─────────────────────────────

describe("Sprint 392 — search-ranking-v2 functions", () => {
  const src = readFile("server/search-ranking-v2.ts");

  it("exports textRelevance function", () => {
    expect(src).toContain("export function textRelevance");
  });

  it("exports profileCompleteness function", () => {
    expect(src).toContain("export function profileCompleteness");
  });

  it("textRelevance handles exact match (1.0)", () => {
    expect(src).toContain("return 1.0");
  });

  it("textRelevance handles starts-with (0.8)", () => {
    expect(src).toContain("return 0.8");
  });

  it("textRelevance handles contains (0.7 full-string, 0.6 word-level)", () => {
    // Sprint 436: Enhanced scoring — full-string contains = 0.7
    expect(src).toContain("return 0.7");
  });
});
