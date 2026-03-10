/**
 * Sprint 433: Rating History Export (CSV)
 * Sprint 454: JSON export, summary stats, date range filter
 *
 * Client-side CSV/JSON generation from existing ratingHistory data.
 * Exports all rating details: business, scores, visit type, date, weight.
 * Uses Share API on native, download link on web.
 */
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { getQ1Label, getQ3Label } from "@/lib/data";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
type ExportFormat = "csv" | "json";
const AMBER = BRAND.colors.amber;

export interface ExportableRating {
  businessName: string;
  businessSlug?: string;
  rawScore: string;
  weight: string;
  weightedScore: string;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean;
  note: string | null;
  visitType?: string;
  createdAt: string;
}

const CSV_HEADERS = [
  "Business", "Date", "Visit Type", "Overall Score", "Food", "Dimension 2", "Dimension 3",
  "Would Return", "Weight", "Weighted Score", "Note",
];

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function getVisitTypeLabel(vt?: string): string {
  if (vt === "dine_in") return "Dine-in";
  if (vt === "delivery") return "Delivery";
  if (vt === "takeaway") return "Takeaway";
  return "Unknown";
}

export function ratingsToCSV(ratings: ExportableRating[]): string {
  const rows = [CSV_HEADERS.join(",")];
  for (const r of ratings) {
    const vt = r.visitType || "dine_in";
    const dim2Label = vt === "dine_in" ? "Service" : vt === "delivery" ? "Packaging" : "Wait Time";
    const dim3Label = vt === "dine_in" ? "Vibe" : "Value";
    const date = new Date(r.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
    rows.push([
      escapeCSV(r.businessName),
      date,
      getVisitTypeLabel(r.visitType),
      parseFloat(r.rawScore).toFixed(1),
      String(r.q1Score),
      `${r.q2Score} (${dim2Label})`,
      `${r.q3Score} (${dim3Label})`,
      r.wouldReturn ? "Yes" : "No",
      parseFloat(r.weight).toFixed(2),
      parseFloat(r.weightedScore).toFixed(2),
      escapeCSV(r.note || ""),
    ].join(","));
  }
  return rows.join("\n");
}

// Sprint 454: Summary statistics for export
export function computeExportSummary(ratings: ExportableRating[]) {
  if (ratings.length === 0) return null;
  const scores = ratings.map(r => parseFloat(r.rawScore));
  const weights = ratings.map(r => parseFloat(r.weight));
  const wouldReturnCount = ratings.filter(r => r.wouldReturn).length;
  const visitTypes: Record<string, number> = {};
  for (const r of ratings) {
    const vt = getVisitTypeLabel(r.visitType);
    visitTypes[vt] = (visitTypes[vt] || 0) + 1;
  }
  return {
    totalRatings: ratings.length,
    avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    avgWeight: (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2),
    wouldReturnPct: Math.round((wouldReturnCount / ratings.length) * 100),
    visitTypes,
    dateRange: {
      earliest: ratings.map(r => r.createdAt).sort()[0],
      latest: ratings.map(r => r.createdAt).sort().reverse()[0],
    },
  };
}

// Sprint 454: JSON export format
export function ratingsToJSON(ratings: ExportableRating[], username: string): string {
  const summary = computeExportSummary(ratings);
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    username,
    summary,
    ratings: ratings.map(r => ({
      business: r.businessName,
      slug: r.businessSlug || null,
      date: r.createdAt,
      visitType: getVisitTypeLabel(r.visitType),
      overallScore: parseFloat(r.rawScore),
      food: r.q1Score,
      dimension2: r.q2Score,
      dimension3: r.q3Score,
      wouldReturn: r.wouldReturn,
      weight: parseFloat(r.weight),
      weightedScore: parseFloat(r.weightedScore),
      note: r.note || null,
    })),
  }, null, 2);
}

// Sprint 454: Filter ratings by date range
export function filterByDateRange(
  ratings: ExportableRating[],
  startDate?: string,
  endDate?: string,
): ExportableRating[] {
  let filtered = ratings;
  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter(r => new Date(r.createdAt).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate).getTime() + 86400000; // inclusive end
    filtered = filtered.filter(r => new Date(r.createdAt).getTime() < end);
  }
  return filtered;
}

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
  // Sprint 454: Format toggle
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
  // Sprint 454: Summary stats
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
