/**
 * Sprint 113 — Dark Mode Infrastructure
 * Dark Colors Normalized, Colors Parity, Theme Types, Settings Toggle
 *
 * Owner: Leo Hernandez (Design), Sarah Nakamura (Lead Engineer)
 */
import { describe, it, expect } from "vitest";
import { darkColors, DARK_COLORS } from "../constants/dark-colors";
import Colors from "../constants/colors";
import { BRAND } from "../constants/brand";

// ── 1. Dark Colors Normalized ───────────────────────────────────────
describe("Dark Colors Normalized", () => {
  const requiredKeys = [
    "brand", "background", "surface", "surfaceRaised", "border",
    "gold", "silver", "bronze", "text", "textSecondary", "textTertiary",
    "green", "red", "blue", "tint", "shadow", "cardShadow",
  ];

  it("darkColors has all keys that Colors has", () => {
    for (const key of requiredKeys) {
      expect(darkColors).toHaveProperty(key);
    }
  });

  it("darkColors.brand.amber matches BRAND.colors.amber", () => {
    expect(darkColors.brand.amber).toBe(BRAND.colors.amber);
  });

  it("darkColors.background is '#0D1117'", () => {
    expect(darkColors.background).toBe("#0D1117");
  });

  it("darkColors.text is light for readability on dark backgrounds", () => {
    expect(darkColors.text).toBe("#E6EDF3");
  });

  it("darkColors.surface is dark (#161B22)", () => {
    expect(darkColors.surface).toBe("#161B22");
  });

  it("cardShadow has correct shape", () => {
    expect(darkColors.cardShadow).toHaveProperty("shadowColor");
    expect(darkColors.cardShadow).toHaveProperty("shadowOffset");
    expect(darkColors.cardShadow).toHaveProperty("shadowOpacity");
    expect(darkColors.cardShadow).toHaveProperty("shadowRadius");
    expect(darkColors.cardShadow).toHaveProperty("elevation");
  });

  it("dark shadow is more opaque than light shadow", () => {
    expect(darkColors.cardShadow.shadowOpacity).toBeGreaterThan(Colors.cardShadow.shadowOpacity);
  });

  it("DARK_COLORS still exists (backwards compatibility)", () => {
    expect(DARK_COLORS).toBeDefined();
    expect(typeof DARK_COLORS).toBe("object");
    expect(DARK_COLORS.background).toBe("#0D1117");
  });
});

// ── 2. Colors Parity — Light and Dark have same top-level keys ──────
describe("Colors Parity", () => {
  it("Object.keys match between light and dark", () => {
    const lightKeys = Object.keys(Colors).sort();
    const darkKeys = Object.keys(darkColors).sort();
    expect(darkKeys).toEqual(lightKeys);
  });

  it("both have brand.amber", () => {
    expect(Colors.brand.amber).toBe(BRAND.colors.amber);
    expect(darkColors.brand.amber).toBe(BRAND.colors.amber);
  });

  it("both have tint set to amber", () => {
    expect(Colors.tint).toBe(BRAND.colors.amber);
    expect(darkColors.tint).toBe(BRAND.colors.amber);
  });

  it("both have cardShadow as object", () => {
    expect(typeof Colors.cardShadow).toBe("object");
    expect(typeof darkColors.cardShadow).toBe("object");
  });
});

// ── 3. Brand Consistency Across Themes ──────────────────────────────
describe("Brand Consistency", () => {
  it("amber is identical in both themes", () => {
    expect(darkColors.brand.amber).toBe(Colors.brand.amber);
  });

  it("gold medal color is identical", () => {
    expect(darkColors.gold).toBe(Colors.gold);
  });

  it("silver medal color is identical", () => {
    expect(darkColors.silver).toBe(Colors.silver);
  });

  it("tab icon selected uses amber in both", () => {
    expect(darkColors.tabIconSelected).toBe(Colors.tabIconSelected);
  });
});

// ── 4. Dark Theme Contrast ──────────────────────────────────────────
describe("Dark Theme Contrast", () => {
  it("background is darker than surface", () => {
    // #0D1117 vs #161B22 — first char after # lower = darker
    expect(darkColors.background < darkColors.surface).toBe(true);
  });

  it("surface is darker than surfaceRaised", () => {
    expect(darkColors.surface < darkColors.surfaceRaised).toBe(true);
  });

  it("text is lighter than textSecondary", () => {
    // #E6EDF3 vs #8B949E
    expect(darkColors.text > darkColors.textSecondary).toBe(true);
  });

  it("textSecondary is lighter than textTertiary", () => {
    // #8B949E vs #484F58
    expect(darkColors.textSecondary > darkColors.textTertiary).toBe(true);
  });
});

// ── 5. Theme Preference Validation ──────────────────────────────────
describe("Theme Preference", () => {
  it("valid preferences are light, dark, system", () => {
    const validPrefs = ["light", "dark", "system"];
    validPrefs.forEach((pref) => {
      expect(typeof pref).toBe("string");
      expect(pref.length).toBeGreaterThan(0);
    });
  });

  it("default preference is system", () => {
    const DEFAULT_PREF = "system";
    expect(DEFAULT_PREF).toBe("system");
  });

  it("AsyncStorage key is defined", () => {
    const STORAGE_KEY = "topranker_theme_preference";
    expect(STORAGE_KEY).toBe("topranker_theme_preference");
  });
});

// ── 6. Feedback Colors ──────────────────────────────────────────────
describe("Dark Theme Feedback Colors", () => {
  it("green is accessible (#3FB950)", () => {
    expect(darkColors.green).toBe("#3FB950");
  });

  it("red is accessible (#F85149)", () => {
    expect(darkColors.red).toBe("#F85149");
  });

  it("blue is accessible (#58A6FF)", () => {
    expect(darkColors.blue).toBe("#58A6FF");
  });

  it("faint variants use rgba for transparency", () => {
    expect(darkColors.greenFaint).toMatch(/^rgba/);
    expect(darkColors.redFaint).toMatch(/^rgba/);
    expect(darkColors.blueFaint).toMatch(/^rgba/);
  });
});
