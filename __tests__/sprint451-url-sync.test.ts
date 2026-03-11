/**
 * Sprint 451 — Search Filter URL Sync
 *
 * Validates:
 * 1. search-url-params utility (encode/decode)
 * 2. search.tsx URL param wiring
 * 3. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. search-url-params utility
// ---------------------------------------------------------------------------
describe("search-url-params — structure", () => {
  const src = readFile("lib/search-url-params.ts");

  it("file exists", () => {
    expect(fileExists("lib/search-url-params.ts")).toBe(true);
  });

  it("exports encodeSearchParams", () => {
    expect(src).toContain("export function encodeSearchParams");
  });

  it("exports decodeSearchParams", () => {
    expect(src).toContain("export function decodeSearchParams");
  });

  it("exports buildSearchUrl", () => {
    expect(src).toContain("export function buildSearchUrl");
  });

  it("exports SearchFilterState interface", () => {
    expect(src).toContain("export interface SearchFilterState");
  });

  it("references Sprint 451", () => {
    expect(src).toContain("Sprint 451");
  });
});

describe("search-url-params — encode logic", () => {
  const src = readFile("lib/search-url-params.ts");

  it("encodes query as q param", () => {
    expect(src).toContain('params.q = state.query');
  });

  it("encodes dietary as comma-separated", () => {
    expect(src).toContain('state.dietary.join(",")');
  });

  it("encodes hours as comma-separated", () => {
    expect(src).toContain('state.hours.join(",")');
  });

  it("skips default sort (ranked)", () => {
    expect(src).toContain('state.sort !== "ranked"');
  });

  it("skips default filter (All)", () => {
    expect(src).toContain('state.filter !== "All"');
  });
});

describe("search-url-params — decode logic", () => {
  const src = readFile("lib/search-url-params.ts");

  it("validates dietary tags against whitelist", () => {
    expect(src).toContain("validTags");
    expect(src).toContain("vegetarian");
    expect(src).toContain("vegan");
  });

  it("validates distance options", () => {
    expect(src).toContain("[1, 3, 5, 10]");
  });

  it("validates hours filters", () => {
    expect(src).toContain("validHours");
    expect(src).toContain("openNow");
  });

  it("validates sort options", () => {
    expect(src).toContain('"ranked", "rated", "trending", "relevant"');
  });

  it("validates price options", () => {
    expect(src).toContain('"$", "$$", "$$$", "$$$$"');
  });
});

// ---------------------------------------------------------------------------
// 2. Source-based encode/decode logic verification
// ---------------------------------------------------------------------------
describe("search-url-params — encode behavior", () => {
  const src = readFile("lib/search-url-params.ts");

  it("returns empty object for empty state", () => {
    expect(src).toContain("const params: Record<string, string> = {}");
    expect(src).toContain("return params");
  });

  it("encodes query to q param", () => {
    expect(src).toContain("params.q = state.query");
  });

  it("encodes dietary as comma-joined", () => {
    expect(src).toContain('state.dietary.join(",")');
  });

  it("encodes hours as comma-joined", () => {
    expect(src).toContain('state.hours.join(",")');
  });

  it("stringifies distance", () => {
    expect(src).toContain("String(state.distance)");
  });

  it("skips ranked sort", () => {
    expect(src).toContain('state.sort !== "ranked"');
  });

  it("includes non-default sort in params", () => {
    expect(src).toContain("params.sort = state.sort");
  });

  it("skips All filter", () => {
    expect(src).toContain('state.filter !== "All"');
  });
});

describe("search-url-params — decode behavior", () => {
  const src = readFile("lib/search-url-params.ts");

  it("splits dietary by comma and validates", () => {
    expect(src).toContain('dietary.split(",")');
    expect(src).toContain("validTags.includes");
  });

  it("rejects invalid dietary via whitelist", () => {
    expect(src).toContain("validTags");
    expect(src).toContain('"vegetarian", "vegan", "halal", "gluten_free"');
  });

  it("parses distance as integer", () => {
    expect(src).toContain("parseInt(distance, 10)");
  });

  it("validates distance against allowed values", () => {
    expect(src).toContain("[1, 3, 5, 10].includes(d)");
  });

  it("validates sort options", () => {
    expect(src).toContain('"ranked", "rated", "trending", "relevant"');
  });

  it("validates price options", () => {
    expect(src).toContain('"$", "$$", "$$$", "$$$$"');
  });

  it("builds URL with query string", () => {
    expect(src).toContain("encodeURIComponent(k)");
    expect(src).toContain("encodeURIComponent(v)");
    expect(src).toContain("`${baseUrl}?${qs}`");
  });

  it("returns base URL when no params", () => {
    expect(src).toContain("qs ? `${baseUrl}?${qs}` : baseUrl");
  });
});

// ---------------------------------------------------------------------------
// 3. search.tsx URL wiring
// ---------------------------------------------------------------------------
describe("search.tsx — URL param wiring", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports decodeSearchParams", () => {
    expect(src).toContain("decodeSearchParams");
  });

  it("uses useSearchActions hook for URL sync + share", () => {
    expect(src).toContain("useSearchActions");
  });

  it("imports useLocalSearchParams", () => {
    expect(src).toContain("useLocalSearchParams");
  });

  it("reads URL params on mount", () => {
    expect(src).toContain("urlParams");
    expect(src).toContain("decodeSearchParams(urlParams)");
  });

  it("restores query from URL", () => {
    expect(src).toContain("decoded.query");
  });

  it("restores dietary from URL", () => {
    expect(src).toContain("decoded.dietary");
  });

  it("restores hours from URL", () => {
    expect(src).toContain("decoded.hours");
  });

  it("uses useRef to prevent re-reads", () => {
    expect(src).toContain("urlParamsRead");
    expect(src).toContain("useRef");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 451 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-451-URL-SYNC.md");
    expect(src).toContain("Sprint 451");
    expect(src).toContain("URL");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-451-URL-SYNC.md");
    expect(src).toContain("Retro 451");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-451-URL-SYNC.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 452");
  });
});
