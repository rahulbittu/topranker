/**
 * Sprint 689: ErrorState component consolidation across tab screens.
 * All screens now use the shared ErrorState from NetworkBanner.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── ErrorState Usage in Tab Screens ────────────────────────────────────

describe("Sprint 689: Rankings uses shared ErrorState", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("imports ErrorState from NetworkBanner", () => {
    expect(src).toContain('import { ErrorState } from "@/components/NetworkBanner"');
  });

  it("uses ErrorState component for error rendering", () => {
    expect(src).toContain("<ErrorState");
    expect(src).toContain('title="Could not load rankings"');
  });

  it("passes onRetry callback", () => {
    expect(src).toContain("onRetry={() => refetch()}");
  });

  it("does NOT have inline error state markup", () => {
    expect(src).not.toContain('name="cloud-offline-outline" size={36}');
  });
});

describe("Sprint 689: Discover uses shared ErrorState", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports ErrorState from NetworkBanner", () => {
    expect(src).toContain('import { ErrorState } from "@/components/NetworkBanner"');
  });

  it("uses ErrorState component", () => {
    expect(src).toContain("<ErrorState");
    expect(src).toContain('title="Could not load results"');
  });

  it("does NOT have inline error state markup", () => {
    expect(src).not.toContain('name="cloud-offline-outline" size={36}');
  });
});

describe("Sprint 689: Profile uses shared ErrorState", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports ErrorState from NetworkBanner", () => {
    expect(src).toContain('import { ErrorState } from "@/components/NetworkBanner"');
  });

  it("uses ErrorState component", () => {
    expect(src).toContain("<ErrorState");
    expect(src).toContain("Couldn't load your profile");
  });

  it("does NOT have inline error container", () => {
    expect(src).not.toContain("styles.errorContainer");
  });
});

describe("Sprint 689: Challenger uses shared ErrorState", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("imports ErrorState from NetworkBanner", () => {
    expect(src).toContain('ErrorState');
    expect(src).toContain('@/components/NetworkBanner');
  });

  it("uses ErrorState component", () => {
    expect(src).toContain("<ErrorState");
    expect(src).toContain("Couldn't load challenges");
  });

  it("does NOT have inline error state markup", () => {
    expect(src).not.toContain("styles.errorState");
  });
});

// ─── ErrorState Component Quality ───────────────────────────────────────

describe("Sprint 689: ErrorState component features", () => {
  const src = readFile("components/ErrorState.tsx");

  it("has default title and subtitle", () => {
    expect(src).toContain('title = "Something went wrong"');
    expect(src).toContain('subtitle = "Check your connection and try again"');
  });

  it("has customizable icon", () => {
    expect(src).toContain('icon = "cloud-offline-outline"');
  });

  it("renders retry button when onRetry provided", () => {
    expect(src).toContain("onRetry");
    expect(src).toContain("Retry");
  });

  it("uses brand typography", () => {
    expect(src).toContain("PlayfairDisplay_700Bold");
    expect(src).toContain("DMSans_400Regular");
  });
});
