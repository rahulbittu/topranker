/**
 * Sprint 471: Filter Preset Chips UI
 *
 * Tests:
 * 1. PresetChips component exists with correct structure
 * 2. Integration with search.tsx — PresetChips rendered in ListHeaderComponent
 * 3. Preset data layer — built-in presets are available
 * 4. Custom preset creation and serialization
 * 5. Toggle behavior (apply/clear)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 471: Filter Preset Chips UI", () => {
  describe("PresetChips component", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/search/PresetChips.tsx"),
      "utf-8"
    );

    it("exports PresetChips function component", () => {
      expect(src).toContain("export function PresetChips");
    });

    it("accepts activePresetId, onApplyPreset, onClearPreset, currentFilters props", () => {
      expect(src).toContain("activePresetId");
      expect(src).toContain("onApplyPreset");
      expect(src).toContain("onClearPreset");
      expect(src).toContain("currentFilters");
    });

    it("renders preset chips from getAllPresets", () => {
      expect(src).toContain("getAllPresets");
      expect(src).toContain("presets.map");
    });

    it("loads custom presets from AsyncStorage on mount", () => {
      expect(src).toContain("AsyncStorage.getItem(PRESETS_STORAGE_KEY)");
    });

    it("toggles preset — tap applies, tap again clears", () => {
      expect(src).toContain("activePresetId === preset.id");
      expect(src).toContain("onClearPreset()");
      expect(src).toContain("onApplyPreset(preset)");
    });

    it("shows active state styling for selected preset", () => {
      expect(src).toContain("presetChipActive");
      expect(src).toContain("presetTextActive");
    });

    it("renders close icon on active preset chip", () => {
      expect(src).toContain("close-circle");
      expect(src).toContain("isActive &&");
    });

    it("has Save button to create custom presets", () => {
      expect(src).toContain("Save");
      expect(src).toContain("handleSavePreset");
      expect(src).toContain("add-circle-outline");
    });

    it("saves custom preset to AsyncStorage", () => {
      expect(src).toContain("AsyncStorage.setItem(PRESETS_STORAGE_KEY");
      expect(src).toContain("createCustomPreset");
    });

    it("validates filters exist before saving", () => {
      expect(src).toContain("No Filters Active");
    });

    it("uses horizontal ScrollView for chip layout", () => {
      expect(src).toContain("ScrollView");
      expect(src).toContain("horizontal");
    });

    it("uses amber brand color for active chips", () => {
      expect(src).toContain("AMBER");
      expect(src).toContain("BRAND.colors.amber");
    });

    it("has dashed border save chip (distinct from preset chips)", () => {
      expect(src).toContain("borderStyle: \"dashed\"");
    });
  });

  describe("Search screen integration", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/(tabs)/search.tsx"),
      "utf-8"
    );

    it("imports PresetChips component", () => {
      expect(src).toContain("import { PresetChips }");
      expect(src).toContain("components/search/PresetChips");
    });

    it("imports FilterPreset type", () => {
      expect(src).toContain("import type { FilterPreset }");
    });

    it("tracks activePresetId state", () => {
      expect(src).toContain("activePresetId, setActivePresetId");
      expect(src).toContain("useState<string | null>(null)");
    });

    it("renders PresetChips above FilterChips in ListHeader", () => {
      const presetIdx = src.indexOf("<PresetChips");
      const filterIdx = src.indexOf("<FilterChips");
      expect(presetIdx).toBeGreaterThan(0);
      expect(filterIdx).toBeGreaterThan(presetIdx);
    });

    it("passes activePresetId to PresetChips", () => {
      expect(src).toContain("activePresetId={activePresetId}");
    });

    it("has handleApplyPreset that sets all filter states from preset", () => {
      expect(src).toContain("handleApplyPreset");
      expect(src).toContain("preset.filters");
      expect(src).toContain("setActivePresetId(preset.id)");
    });

    it("has handleClearPreset that resets all filters", () => {
      expect(src).toContain("handleClearPreset");
      expect(src).toContain("setActivePresetId(null)");
    });

    it("computes currentFilters for save functionality", () => {
      expect(src).toContain("useSearchActions");
      expect(src).toContain("currentFilters={currentFilters}");
    });
  });

  describe("Filter presets data layer", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../lib/search-filter-presets.ts"),
      "utf-8"
    );

    it("has 5 built-in presets", () => {
      expect(src).toContain("quick-lunch");
      expect(src).toContain("date-night");
      expect(src).toContain("vegetarian");
      expect(src).toContain("top-rated");
      expect(src).toContain("halal");
    });

    it("exports createCustomPreset function", () => {
      expect(src).toContain("export function createCustomPreset");
    });

    it("exports serializePresets that filters out built-in", () => {
      expect(src).toContain("export function serializePresets");
      expect(src).toContain("filter(p => !p.isBuiltIn)");
    });

    it("exports getAllPresets combining built-in and custom", () => {
      expect(src).toContain("export function getAllPresets");
      expect(src).toContain("...BUILT_IN_PRESETS, ...custom");
    });

    it("exports PRESETS_STORAGE_KEY for AsyncStorage", () => {
      expect(src).toContain("PRESETS_STORAGE_KEY");
      expect(src).toContain("topranker:filter-presets");
    });
  });
});
