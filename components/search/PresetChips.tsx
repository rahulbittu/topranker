/**
 * Sprint 471: Filter Preset Chips
 *
 * Horizontal chip bar for quick-apply filter presets.
 * Tap a preset to apply its filters, tap again to clear.
 * "Save" chip at end to create custom presets from current filters.
 */
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  type FilterPreset,
  getAllPresets,
  createCustomPreset,
  serializePresets,
  PRESETS_STORAGE_KEY,
} from "@/lib/search-filter-presets";
import type { SearchFilterState } from "@/lib/search-url-params";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const AMBER = BRAND.colors.amber;

interface PresetChipsProps {
  activePresetId: string | null;
  onApplyPreset: (preset: FilterPreset) => void;
  onClearPreset: () => void;
  currentFilters: SearchFilterState;
}

export function PresetChips({
  activePresetId,
  onApplyPreset,
  onClearPreset,
  currentFilters,
}: PresetChipsProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = useCallback(async () => {
    try {
      const customJson = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      setPresets(getAllPresets(customJson || undefined));
    } catch {
      setPresets(getAllPresets());
    }
  }, []);

  const handlePresetPress = useCallback((preset: FilterPreset) => {
    Haptics.selectionAsync();
    if (activePresetId === preset.id) {
      onClearPreset();
    } else {
      onApplyPreset(preset);
    }
  }, [activePresetId, onApplyPreset, onClearPreset]);

  const handleSavePreset = useCallback(() => {
    Haptics.selectionAsync();
    // Check if any filters are active
    const hasFilters = currentFilters.dietary?.length ||
      currentFilters.hours?.length ||
      currentFilters.distance ||
      currentFilters.price ||
      currentFilters.cuisine ||
      (currentFilters.filter && currentFilters.filter !== "All");
    if (!hasFilters) {
      Alert.alert("No Filters Active", "Apply some filters first, then save them as a preset.");
      return;
    }
    if (Platform.OS === "web") {
      const name = prompt("Preset name:");
      if (name && name.trim()) {
        saveNewPreset(name.trim());
      }
    } else {
      Alert.prompt(
        "Save Preset",
        "Give your filter preset a name:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: (name?: string) => {
              if (name && name.trim()) saveNewPreset(name.trim());
            },
          },
        ],
        "plain-text",
        "",
        "default"
      );
    }
  }, [currentFilters]);

  const saveNewPreset = useCallback(async (name: string) => {
    const newPreset = createCustomPreset(name, "bookmark-outline", currentFilters);
    const customOnly = [...presets.filter(p => !p.isBuiltIn), newPreset];
    const json = serializePresets([...presets, newPreset]);
    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, json);
    } catch { /* silently fail */ }
    setPresets(prev => [...prev, newPreset]);
    onApplyPreset(newPreset);
  }, [presets, currentFilters, onApplyPreset]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      style={styles.chipScroll}
    >
      {presets.map(preset => {
        const isActive = activePresetId === preset.id;
        return (
          <TouchableOpacity
            key={preset.id}
            onPress={() => handlePresetPress(preset)}
            style={[styles.presetChip, isActive && styles.presetChipActive]}
            accessibilityRole="button"
            accessibilityLabel={`${preset.name} preset${isActive ? ", active" : ""}`}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={preset.icon as IoniconsName}
              size={13}
              color={isActive ? "#fff" : AMBER}
              style={styles.presetIcon}
            />
            <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
              {preset.name}
            </Text>
            {isActive && (
              <Ionicons name="close-circle" size={13} color="rgba(255,255,255,0.7)" style={styles.presetClose} />
            )}
          </TouchableOpacity>
        );
      })}
      {/* Save current filters as preset */}
      <TouchableOpacity
        onPress={handleSavePreset}
        style={styles.saveChip}
        accessibilityRole="button"
        accessibilityLabel="Save current filters as preset"
      >
        <Ionicons name="add-circle-outline" size={13} color={Colors.textSecondary} />
        <Text style={styles.saveChipText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipScroll: { marginBottom: 8 },
  chipRow: { gap: 8, flexDirection: "row", alignItems: "center", paddingRight: 8 },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: `${AMBER}12`,
    borderWidth: 1,
    borderColor: `${AMBER}30`,
  },
  presetChipActive: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  presetIcon: { marginRight: 5 },
  presetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B6914",
    fontFamily: "DMSans_600SemiBold",
  },
  presetTextActive: { color: "#fff" },
  presetClose: { marginLeft: 5 },
  saveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  saveChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
});
