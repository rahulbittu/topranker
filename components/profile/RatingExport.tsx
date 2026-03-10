/**
 * Sprint 433: Rating History Export (CSV)
 *
 * Client-side CSV generation from existing ratingHistory data.
 * Exports all rating details: business, scores, visit type, date, weight.
 * Uses Share API on native, download link on web.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { getQ1Label, getQ3Label } from "@/lib/data";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
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

export interface RatingExportButtonProps {
  ratings: ExportableRating[];
  username: string;
}

export function RatingExportButton({ ratings, username }: RatingExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (ratings.length === 0) {
      Alert.alert("No Ratings", "Rate some restaurants first to export your history.");
      return;
    }

    setExporting(true);
    try {
      const csv = ratingsToCSV(ratings);
      const filename = `topranker-ratings-${username}-${new Date().toISOString().split("T")[0]}.csv`;

      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({
          message: csv,
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
      <View style={s.infoRow}>
        <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
        <Text style={s.infoText}>
          {ratings.length} rating{ratings.length !== 1 ? "s" : ""} available for export
        </Text>
      </View>
      <TouchableOpacity
        style={[s.exportBtn, exporting && s.exportBtnDisabled]}
        onPress={handleExport}
        disabled={exporting}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Export rating history as CSV"
      >
        <Ionicons name="download-outline" size={16} color={exporting ? Colors.textTertiary : AMBER} />
        <Text style={[s.exportText, exporting && s.exportTextDisabled]}>
          {exporting ? "Exporting..." : "Export CSV"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12,
    ...Colors.cardShadow,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  infoText: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  exportBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
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
