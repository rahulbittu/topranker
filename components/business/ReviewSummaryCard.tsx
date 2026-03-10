/**
 * Sprint 444: Review Summary Card
 * Aggregated review insights: visit type breakdown, would-return %,
 * rating recency, and dimension averages.
 * Owner: Priya Sharma (Design) + Sarah Nakamura (Eng)
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;
const NAVY = BRAND.colors.navy;

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface ReviewRating {
  visitType?: string;
  wouldReturn?: boolean;
  createdAt: string;
  foodScore?: number | string | null;
  serviceScore?: number | string | null;
  vibeScore?: number | string | null;
  packagingScore?: number | string | null;
  waitTimeScore?: number | string | null;
  valueScore?: number | string | null;
}

export interface ReviewSummaryCardProps {
  ratings: ReviewRating[];
}

interface VisitTypeBreakdown {
  type: string;
  label: string;
  icon: IoniconsName;
  count: number;
  pct: number;
}

function getVisitTypeBreakdown(ratings: ReviewRating[]): VisitTypeBreakdown[] {
  const counts: Record<string, number> = { dine_in: 0, delivery: 0, takeaway: 0 };
  for (const r of ratings) {
    const vt = r.visitType || "dine_in";
    counts[vt] = (counts[vt] || 0) + 1;
  }
  const total = ratings.length || 1;
  const types: { type: string; label: string; icon: IoniconsName }[] = [
    { type: "dine_in", label: "Dine-in", icon: "restaurant-outline" },
    { type: "delivery", label: "Delivery", icon: "bicycle-outline" },
    { type: "takeaway", label: "Takeaway", icon: "bag-handle-outline" },
  ];
  return types
    .map(t => ({ ...t, count: counts[t.type] || 0, pct: Math.round(((counts[t.type] || 0) / total) * 100) }))
    .filter(t => t.count > 0);
}

function getWouldReturnPct(ratings: ReviewRating[]): number | null {
  const withReturn = ratings.filter(r => r.wouldReturn != null);
  if (withReturn.length === 0) return null;
  return Math.round((withReturn.filter(r => r.wouldReturn).length / withReturn.length) * 100);
}

function getRecentCount(ratings: ReviewRating[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return ratings.filter(r => new Date(r.createdAt).getTime() > cutoff).length;
}

function getDimensionAverages(ratings: ReviewRating[]): { label: string; avg: number; icon: IoniconsName }[] {
  const dims: { key: keyof ReviewRating; label: string; icon: IoniconsName }[] = [
    { key: "foodScore", label: "Food", icon: "fast-food-outline" },
    { key: "serviceScore", label: "Service", icon: "people-outline" },
    { key: "vibeScore", label: "Vibe", icon: "musical-notes-outline" },
    { key: "packagingScore", label: "Packaging", icon: "cube-outline" },
    { key: "waitTimeScore", label: "Wait Time", icon: "time-outline" },
    { key: "valueScore", label: "Value", icon: "cash-outline" },
  ];
  return dims
    .map(d => {
      const vals = ratings.map(r => parseFloat(String(r[d.key] || "0"))).filter(v => v > 0);
      return { label: d.label, avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, icon: d.icon };
    })
    .filter(d => d.avg > 0);
}

export function ReviewSummaryCard({ ratings }: ReviewSummaryCardProps) {
  const visitBreakdown = useMemo(() => getVisitTypeBreakdown(ratings), [ratings]);
  const wouldReturnPct = useMemo(() => getWouldReturnPct(ratings), [ratings]);
  const recentCount = useMemo(() => getRecentCount(ratings, 30), [ratings]);
  const dimensionAvgs = useMemo(() => getDimensionAverages(ratings), [ratings]);

  if (ratings.length < 2) return null; // Need at least 2 ratings for meaningful summary

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Ionicons name="analytics-outline" size={18} color={AMBER} />
        <Text style={s.headerText}>Review Summary</Text>
        <Text style={s.headerCount}>{ratings.length} ratings</Text>
      </View>

      {/* Visit Type Breakdown */}
      {visitBreakdown.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Visit Types</Text>
          <View style={s.visitTypeRow}>
            {visitBreakdown.map(vt => (
              <View key={vt.type} style={s.visitTypeItem}>
                <Ionicons name={vt.icon} size={14} color={NAVY} />
                <Text style={s.visitTypeLabel}>{vt.label}</Text>
                <Text style={s.visitTypePct}>{vt.pct}%</Text>
                <Text style={s.visitTypeCount}>({vt.count})</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Would Return + Recency */}
      <View style={s.statsRow}>
        {wouldReturnPct != null && (
          <View style={s.statBubble}>
            <Ionicons name="thumbs-up-outline" size={14} color={wouldReturnPct >= 70 ? "#2D8F4E" : Colors.textSecondary} />
            <Text style={[s.statValue, wouldReturnPct >= 70 && s.statValueGreen]}>{wouldReturnPct}%</Text>
            <Text style={s.statLabel}>would return</Text>
          </View>
        )}
        {recentCount > 0 && (
          <View style={s.statBubble}>
            <Ionicons name="calendar-outline" size={14} color={AMBER} />
            <Text style={s.statValue}>{recentCount}</Text>
            <Text style={s.statLabel}>last 30 days</Text>
          </View>
        )}
      </View>

      {/* Dimension Averages */}
      {dimensionAvgs.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Dimension Averages</Text>
          <View style={s.dimensionGrid}>
            {dimensionAvgs.map(d => (
              <View key={d.label} style={s.dimensionItem}>
                <Ionicons name={d.icon} size={12} color={Colors.textTertiary} />
                <Text style={s.dimensionLabel}>{d.label}</Text>
                <Text style={[s.dimensionValue, d.avg >= 4 && s.dimensionValueHigh]}>{d.avg.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    flex: 1,
  },
  headerCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  visitTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  visitTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${NAVY}08`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  visitTypeLabel: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
  },
  visitTypePct: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
    fontFamily: "DMSans_700Bold",
  },
  visitTypeCount: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBubble: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  statValueGreen: {
    color: "#2D8F4E",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  dimensionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dimensionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 140,
  },
  dimensionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    flex: 1,
  },
  dimensionValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  dimensionValueHigh: {
    color: AMBER,
  },
});
