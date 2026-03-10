/**
 * Sprint 433: Rating History Export (CSV)
 * Sprint 454: JSON export, summary stats, date range filter
 * Sprint 461: Extracted utilities to lib/rating-export-utils.ts
 *
 * UI component for export button with format toggle and summary stats.
 */
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

import {
  type ExportableRating, type ExportFormat,
  ratingsToCSV, ratingsToJSON, computeExportSummary,
} from "@/lib/rating-export-utils";

// Re-exports for backward compatibility
export { ratingsToCSV, ratingsToJSON, computeExportSummary, filterByDateRange, escapeCSV, getVisitTypeLabel } from "@/lib/rating-export-utils";
export type { ExportableRating, ExportFormat } from "@/lib/rating-export-utils";

const AMBER = BRAND.colors.amber;

export interface RatingExportButtonProps {
  ratings: ExportableRating[];
  username: string;
}

export function RatingExportButton({ ratings, username }: RatingExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");

  const summary = useMemo(() => computeExportSummary(ratings), [ratings]);

  const handleExport = async () => {
    if (ratings.length === 0) {
      Alert.alert("No Ratings", "Rate some restaurants first to export your history.");
      return;
    }

    setExporting(true);
    try {
      const isJson = format === "json";
      const content = isJson ? ratingsToJSON(ratings, username) : ratingsToCSV(ratings);
      const ext = isJson ? "json" : "csv";
      const mime = isJson ? "application/json" : "text/csv;charset=utf-8;";
      const filename = `topranker-ratings-${username}-${new Date().toISOString().split("T")[0]}.${ext}`;

      if (Platform.OS === "web") {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({
          message: content,
          title: filename,
        });
      }
    } catch {
      Alert.alert("Export Failed", "Could not export your ratings. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.topRow}>
        <View style={s.infoRow}>
          <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
          <Text style={s.infoText}>
            {ratings.length} rating{ratings.length !== 1 ? "s" : ""} available
          </Text>
        </View>
        {/* Sprint 454: Format toggle */}
        <View style={s.formatToggle}>
          <TouchableOpacity
            style={[s.formatBtn, format === "csv" && s.formatBtnActive]}
            onPress={() => setFormat("csv")}
            activeOpacity={0.7}
          >
            <Text style={[s.formatText, format === "csv" && s.formatTextActive]}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.formatBtn, format === "json" && s.formatBtnActive]}
            onPress={() => setFormat("json")}
            activeOpacity={0.7}
          >
            <Text style={[s.formatText, format === "json" && s.formatTextActive]}>JSON</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Sprint 454: Summary stats row */}
      {summary && (
        <View style={s.summaryRow}>
          <Text style={s.summaryText}>Avg {summary.avgScore} score</Text>
          <Text style={s.summaryDot}>{"\u00B7"}</Text>
          <Text style={s.summaryText}>{summary.wouldReturnPct}% return</Text>
          <Text style={s.summaryDot}>{"\u00B7"}</Text>
          <Text style={s.summaryText}>Avg {summary.avgWeight} weight</Text>
        </View>
      )}
      <TouchableOpacity
        style={[s.exportBtn, exporting && s.exportBtnDisabled]}
        onPress={handleExport}
        disabled={exporting}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Export rating history as ${format.toUpperCase()}`}
      >
        <Ionicons name="download-outline" size={16} color={exporting ? Colors.textTertiary : AMBER} />
        <Text style={[s.exportText, exporting && s.exportTextDisabled]}>
          {exporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12, gap: 8,
    ...Colors.cardShadow,
  },
  topRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  infoText: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  formatToggle: {
    flexDirection: "row", borderRadius: 6, overflow: "hidden",
    borderWidth: 1, borderColor: `${AMBER}25`,
  },
  formatBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
  },
  formatBtnActive: {
    backgroundColor: `${AMBER}15`,
  },
  formatText: {
    fontSize: 11, fontWeight: "600", color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold",
  },
  formatTextActive: { color: AMBER },
  summaryRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 2,
  },
  summaryText: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  summaryDot: { fontSize: 11, color: Colors.textTertiary },
  exportBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: `${AMBER}10`, borderWidth: 1, borderColor: `${AMBER}25`,
  },
  exportBtnDisabled: {
    backgroundColor: Colors.surfaceRaised, borderColor: Colors.border,
  },
  exportText: {
    fontSize: 13, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
  exportTextDisabled: { color: Colors.textTertiary },
});
