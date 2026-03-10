/**
 * Sprint 477: Date Range Filter — extracted from RatingHistorySection
 * Resolves H-1 from Audit #53 (RatingHistorySection at 98.2%)
 *
 * Chip-based date range filter: All Time, 7 Days, 30 Days, 90 Days, Custom.
 * Pure UI component that reports the active filter to the parent.
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { filterByDateRange } from "@/lib/rating-export-utils";

const AMBER = BRAND.colors.amber;

export type DateRangePreset = "all" | "7d" | "30d" | "90d" | "custom";

const DATE_RANGE_PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

export function getPresetDates(preset: DateRangePreset): { start?: string; end?: string } {
  if (preset === "all") return {};
  const now = new Date();
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 86400000);
  return { start: start.toISOString().split("T")[0] };
}

export function applyDateFilter(
  items: any[],
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string,
): any[] {
  if (preset === "all") return items;
  if (preset === "custom") {
    return filterByDateRange(items, customStart, customEnd);
  }
  const { start } = getPresetDates(preset);
  return filterByDateRange(items, start);
}

interface DateRangeFilterProps {
  activePreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStart?: string;
  customEnd?: string;
  onCustomRangeSet: (start: string, end?: string) => void;
}

export function DateRangeFilter({
  activePreset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomRangeSet,
}: DateRangeFilterProps) {
  const handleCustomRange = useCallback(() => {
    if (Platform.OS === "web") {
      const start = prompt("Start date (YYYY-MM-DD):");
      const end = prompt("End date (YYYY-MM-DD):");
      if (start) {
        onCustomRangeSet(start, end || undefined);
        onPresetChange("custom");
      }
    } else {
      Alert.prompt("Start Date", "Enter start date (YYYY-MM-DD):", [
        { text: "Cancel", style: "cancel" },
        { text: "Set", onPress: (start?: string) => {
          if (start) {
            onCustomRangeSet(start, undefined);
            onPresetChange("custom");
          }
        }},
      ], "plain-text");
    }
  }, [onCustomRangeSet, onPresetChange]);

  return (
    <>
      <View style={s.dateFilterRow}>
        {DATE_RANGE_PRESETS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[s.dateChip, activePreset === key && s.dateChipActive]}
            onPress={() => onPresetChange(key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${label}`}
            accessibilityState={{ selected: activePreset === key }}
          >
            <Text style={[s.dateChipText, activePreset === key && s.dateChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[s.dateChip, activePreset === "custom" && s.dateChipActive]}
          onPress={handleCustomRange}
          accessibilityRole="button"
          accessibilityLabel="Custom date range"
        >
          <Ionicons name="calendar-outline" size={11} color={activePreset === "custom" ? "#fff" : Colors.textSecondary} />
          <Text style={[s.dateChipText, activePreset === "custom" && s.dateChipTextActive]}>Custom</Text>
        </TouchableOpacity>
      </View>

      {activePreset === "custom" && customStart && (
        <View style={s.customRangeIndicator}>
          <Ionicons name="calendar" size={12} color={AMBER} />
          <Text style={s.customRangeText}>
            {customStart}{customEnd ? ` to ${customEnd}` : " onwards"}
          </Text>
          <TouchableOpacity onPress={() => onPresetChange("all")} hitSlop={8}>
            <Ionicons name="close-circle" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

// Re-exports for backward compatibility
export { DATE_RANGE_PRESETS };

const s = StyleSheet.create({
  dateFilterRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateChipActive: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
  dateChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  customRangeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  customRangeText: {
    flex: 1,
    fontSize: 11,
    color: AMBER,
    fontFamily: "DMSans_500Medium",
  },
});
