/**
 * Sprint 702: Empty state polish — shared component, dead style removal.
 * Challenger now uses shared EmptyState. Orphaned empty styles removed from search.tsx.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Challenger Empty State ─────────────────────────────────────────────

describe("Sprint 702: Challenger uses shared EmptyState", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("imports EmptyState from NetworkBanner", () => {
    expect(src).toContain("EmptyState");
    expect(src).toContain('from "@/components/NetworkBanner"');
  });

  it("uses EmptyState component with flash-outline icon", () => {
    expect(src).toContain('<EmptyState');
    expect(src).toContain('icon="flash-outline"');
  });

  it("has appropriate title", () => {
    expect(src).toContain('title="No active challenges"');
  });

  it("has appropriate subtitle", () => {
    expect(src).toContain("Rate more businesses to unlock challengers");
  });

  it("does NOT have inline empty state markup", () => {
    expect(src).not.toContain("styles.emptyState");
    expect(src).not.toContain("styles.emptyIcon");
    expect(src).not.toContain("styles.emptyText");
    expect(src).not.toContain("styles.emptySubtext");
  });

  it("does NOT import Ionicons (no longer needed)", () => {
    expect(src).not.toContain("Ionicons");
  });

  it("removed orphaned empty state styles from StyleSheet", () => {
    expect(src).not.toContain("emptyState:");
    expect(src).not.toContain("emptyIcon:");
    expect(src).not.toContain("emptyText:");
    expect(src).not.toContain("emptySubtext:");
  });
});

// ─── Discover Orphaned Styles ───────────────────────────────────────────

describe("Sprint 702: Discover dead empty styles removed", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("does NOT have orphaned emptyState style", () => {
    expect(src).not.toContain("emptyState:");
  });

  it("does NOT have orphaned emptyText style", () => {
    expect(src).not.toContain("emptyText:");
  });

  it("does NOT have orphaned emptySubtext style", () => {
    expect(src).not.toContain("emptySubtext:");
  });

  it("still uses DiscoverEmptyState component", () => {
    expect(src).toContain("DiscoverEmptyState");
  });
});

// ─── EmptyState Component ───────────────────────────────────────────────

describe("Sprint 702: EmptyState component from ErrorState.tsx", () => {
  const src = readFile("components/ErrorState.tsx");

  it("exports EmptyState function", () => {
    expect(src).toContain("export function EmptyState");
  });

  it("has configurable icon", () => {
    expect(src).toContain("icon =");
  });

  it("accepts title and subtitle", () => {
    expect(src).toContain("title: string");
    expect(src).toContain("subtitle?: string");
  });
});

// ─── Rankings Empty State Preserved ─────────────────────────────────────

describe("Sprint 702: Rankings empty state unchanged", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("still uses EmptyStateAnimation", () => {
    expect(src).toContain("EmptyStateAnimation");
  });
});
