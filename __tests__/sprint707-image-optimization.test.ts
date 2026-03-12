/**
 * Sprint 707: Image loading optimization — cache policy, priority, recycling.
 * SafeImage now uses memory-disk caching, configurable priority, and recycling keys.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── SafeImage Optimization Props ───────────────────────────────────────

describe("Sprint 707: SafeImage optimization", () => {
  const src = readFile("components/SafeImage.tsx");

  it("uses expo-image Image component", () => {
    expect(src).toContain('import { Image');
    expect(src).toContain('from "expo-image"');
  });

  it("sets cachePolicy to memory-disk", () => {
    expect(src).toContain('cachePolicy="memory-disk"');
  });

  it("accepts priority prop (low/normal/high)", () => {
    expect(src).toContain('priority?: "low" | "normal" | "high"');
    expect(src).toContain("priority={priority}");
  });

  it("defaults priority to normal", () => {
    expect(src).toContain('priority = "normal"');
  });

  it("accepts recyclingKey prop", () => {
    expect(src).toContain("recyclingKey?: string");
    expect(src).toContain("recyclingKey={recyclingKey}");
  });

  it("accepts placeholder prop", () => {
    expect(src).toContain("placeholder?: string");
    expect(src).toContain("placeholder={placeholder}");
  });

  it("sets placeholderContentFit to cover", () => {
    expect(src).toContain('placeholderContentFit="cover"');
  });

  it("has 200ms transition for smooth fade-in", () => {
    expect(src).toContain("transition={200}");
  });

  it("has sprint 707 comment", () => {
    expect(src).toContain("Sprint 707: Image loading optimization");
  });
});

// ─── Existing Fallback Behavior Preserved ───────────────────────────────

describe("Sprint 707: SafeImage fallback preserved", () => {
  const src = readFile("components/SafeImage.tsx");

  it("still tracks error state", () => {
    expect(src).toContain("const [failed, setFailed] = useState(false)");
  });

  it("still shows gradient fallback on error", () => {
    expect(src).toContain("LinearGradient");
    expect(src).toContain("BRAND.colors.amber");
  });

  it("still supports cuisine/category emoji fallback", () => {
    expect(src).toContain("cuisineEmoji");
    expect(src).toContain("categoryEmoji");
  });

  it("still has accessibility support", () => {
    expect(src).toContain("accessibilityRole");
    expect(src).toContain("accessibilityLabel");
  });
});

// ─── SafeImage Usage Count ──────────────────────────────────────────────

describe("Sprint 707: SafeImage adoption", () => {
  // Count files that import SafeImage
  const components = [
    "components/search/SubComponents.tsx",
    "components/leaderboard/SubComponents.tsx",
    "components/business/HeroCarousel.tsx",
    "components/business/PhotoGallery.tsx",
  ];

  for (const file of components) {
    it(`${file} uses SafeImage`, () => {
      const src = readFile(file);
      expect(src).toContain("SafeImage");
    });
  }
});
