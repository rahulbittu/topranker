/**
 * Sprint 193 — Search Decomposition + Mobile Readiness
 *
 * Validates:
 * 1. SearchOverlays component extracted (AutocompleteDropdown, RecentSearchesPanel)
 * 2. search.tsx uses extracted components
 * 3. search.tsx LOC reduced
 * 4. SearchOverlays has proper TypeScript interfaces
 * 5. Mobile-ready patterns (accessibility labels, platform checks)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. SearchOverlays component
// ---------------------------------------------------------------------------
describe("SearchOverlays — extracted component", () => {
  const src = readFile("components/search/SearchOverlays.tsx");

  it("exports AutocompleteDropdown", () => {
    expect(src).toContain("export function AutocompleteDropdown");
  });

  it("exports RecentSearchesPanel", () => {
    expect(src).toContain("export function RecentSearchesPanel");
  });

  it("AutocompleteDropdown accepts results prop", () => {
    expect(src).toContain("results: AutocompleteSuggestion[]");
  });

  it("AutocompleteDropdown accepts onDismiss prop", () => {
    expect(src).toContain("onDismiss: () => void");
  });

  it("RecentSearchesPanel accepts searches prop", () => {
    expect(src).toContain("searches: string[]");
  });

  it("RecentSearchesPanel accepts onSelect prop", () => {
    expect(src).toContain("onSelect: (term: string) => void");
  });

  it("RecentSearchesPanel accepts onClear prop", () => {
    expect(src).toContain("onClear: () => void");
  });

  it("imports AutocompleteSuggestion type from api", () => {
    expect(src).toContain("AutocompleteSuggestion");
    expect(src).toContain("@/lib/api");
  });

  it("uses getCategoryDisplay for category rendering", () => {
    expect(src).toContain("getCategoryDisplay");
  });

  it("navigates to business on autocomplete selection", () => {
    expect(src).toContain('router.push');
    expect(src).toContain("item.slug");
  });

  it("has accessibility labels", () => {
    expect(src).toContain("accessibilityRole");
    expect(src).toContain("accessibilityLabel");
  });

  it("has its own StyleSheet", () => {
    expect(src).toContain("StyleSheet.create");
  });
});

// ---------------------------------------------------------------------------
// 2. search.tsx uses extracted components
// ---------------------------------------------------------------------------
describe("search.tsx — uses SearchOverlays", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports AutocompleteDropdown", () => {
    expect(src).toContain("AutocompleteDropdown");
    expect(src).toContain("SearchOverlays");
  });

  it("imports RecentSearchesPanel", () => {
    expect(src).toContain("RecentSearchesPanel");
  });

  it("uses AutocompleteDropdown component", () => {
    expect(src).toContain("<AutocompleteDropdown");
  });

  it("uses RecentSearchesPanel component", () => {
    expect(src).toContain("<RecentSearchesPanel");
  });

  it("no longer has inline autocomplete JSX", () => {
    // The old inline JSX had this pattern
    expect(src).not.toContain("autocompleteResults.map((item)");
  });

  it("no longer has inline recent search JSX", () => {
    expect(src).not.toContain("recentSearches.slice(0, 5).map((term)");
  });
});

// ---------------------------------------------------------------------------
// 3. search.tsx LOC reduced
// ---------------------------------------------------------------------------
describe("search.tsx — file size", () => {
  const filePath = path.resolve(__dirname, "..", "app/(tabs)/search.tsx");
  const content = fs.readFileSync(filePath, "utf-8");
  const lineCount = content.split("\n").length;

  it("is under 800 LOC after extraction", () => {
    expect(lineCount).toBeLessThan(800);
  });

  it("reduced from 870 to under 800", () => {
    // Extracted ~80 lines of autocomplete + recent search JSX and styles
    expect(lineCount).toBeLessThan(800);
  });
});

// ---------------------------------------------------------------------------
// 4. Component file exists and is well-structured
// ---------------------------------------------------------------------------
describe("SearchOverlays — file structure", () => {
  const filePath = path.resolve(__dirname, "..", "components/search/SearchOverlays.tsx");

  it("file exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const src = readFile("components/search/SearchOverlays.tsx");

  it("uses BRAND colors", () => {
    expect(src).toContain("BRAND.colors.amber");
  });

  it("uses TYPOGRAPHY constants", () => {
    expect(src).toContain("TYPOGRAPHY");
  });

  it("returns null for empty results", () => {
    expect(src).toContain("if (results.length === 0) return null");
  });

  it("returns null for empty searches", () => {
    expect(src).toContain("if (searches.length === 0) return null");
  });
});
