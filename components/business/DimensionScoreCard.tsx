/**
 * Sprint 484: Dimension Score Breakdown Card
 *
 * Visual breakdown of individual rating dimensions with horizontal score bars.
 * Shows Food, Service, Vibe (dine-in), Packaging/Value (delivery), Wait Time/Value (takeaway).
 * Also displays visit type distribution as a visual indicator.
 *
 * Rating Integrity: "Show the breakdown, not just the number."
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { apiFetch } from "@/lib/query-client";

const AMBER = BRAND.colors.amber;

// Dimension definitions per visit type
export const DIMENSION_CONFIGS = {
  dineIn: [
    { key: "food", label: "Food", weight: 0.50, icon: "restaurant-outline" },
    { key: "service", label: "Service", weight: 0.25, icon: "people-outline" },
    { key: "vibe", label: "Vibe", weight: 0.25, icon: "musical-notes-outline" },
  ],
  delivery: [
    { key: "food", label: "Food", weight: 0.60, icon: "restaurant-outline" },
    { key: "packaging", label: "Packaging", weight: 0.25, icon: "cube-outline" },
    { key: "value", label: "Value", weight: 0.15, icon: "pricetag-outline" },
  ],
  takeaway: [
    { key: "food", label: "Food", weight: 0.65, icon: "restaurant-outline" },
    { key: "waitTime", label: "Wait Time", weight: 0.20, icon: "time-outline" },
    { key: "value", label: "Value", weight: 0.15, icon: "pricetag-outline" },
  ],
} as const;

interface DimensionData {
  food: number;
  service?: number;
  vibe?: number;
  packaging?: number;
  waitTime?: number;
  value?: number;
}

interface VisitTypeDistribution {
  dineIn: number;
  delivery: number;
  takeaway: number;
}

interface DimensionBreakdownData {
  dimensions: DimensionData;
  visitTypeDistribution: VisitTypeDistribution;
  totalRatings: number;
  primaryVisitType: "dineIn" | "delivery" | "takeaway";
}

interface DimensionScoreCardProps {
  businessId: string;
}

export function DimensionScoreCard({ businessId }: DimensionScoreCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["dimension-breakdown", businessId],
    queryFn: async () => {
      const res = await apiFetch(`/api/businesses/${businessId}/dimension-breakdown`);
      const json = await res.json();
      return json.data as DimensionBreakdownData;
    },
    enabled: !!businessId,
  });

  if (isLoading || !data || data.totalRatings === 0) return null;

  const config = DIMENSION_CONFIGS[data.primaryVisitType];
  const total = data.visitTypeDistribution.dineIn + data.visitTypeDistribution.delivery + data.visitTypeDistribution.takeaway;

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>DIMENSION BREAKDOWN</Text>
      <Text style={s.cardSubtitle}>How each aspect scores individually</Text>

      {/* Dimension score bars */}
      <View style={s.dimensionList}>
        {config.map((dim) => {
          const score = data.dimensions[dim.key as keyof DimensionData] || 0;
          const pct = Math.min((score / 5) * 100, 100);
          return (
            <View key={dim.key} style={s.dimensionRow}>
              <View style={s.dimensionLabelRow}>
                <Ionicons name={dim.icon as any} size={14} color={Colors.textSecondary} />
                <Text style={s.dimensionLabel}>{dim.label}</Text>
                <Text style={s.dimensionWeight}>{Math.round(dim.weight * 100)}%</Text>
              </View>
              <View style={s.barContainer}>
                <View style={[s.barFill, { width: `${pct}%` as any }]} />
              </View>
              <Text style={s.dimensionScore}>{score.toFixed(1)}</Text>
            </View>
          );
        })}
      </View>

      {/* Visit type distribution */}
      {total > 0 && (
        <View style={s.distributionSection}>
          <Text style={s.distributionTitle}>VISIT TYPE MIX</Text>
          <View style={s.distributionBar}>
            {data.visitTypeDistribution.dineIn > 0 && (
              <View style={[s.distributionSegment, s.segmentDineIn, { flex: data.visitTypeDistribution.dineIn }]} />
            )}
            {data.visitTypeDistribution.delivery > 0 && (
              <View style={[s.distributionSegment, s.segmentDelivery, { flex: data.visitTypeDistribution.delivery }]} />
            )}
            {data.visitTypeDistribution.takeaway > 0 && (
              <View style={[s.distributionSegment, s.segmentTakeaway, { flex: data.visitTypeDistribution.takeaway }]} />
            )}
          </View>
          <View style={s.distributionLegend}>
            <DistributionLabel label="Dine-in" count={data.visitTypeDistribution.dineIn} total={total} color={AMBER} />
            <DistributionLabel label="Delivery" count={data.visitTypeDistribution.delivery} total={total} color="#60A5FA" />
            <DistributionLabel label="Takeaway" count={data.visitTypeDistribution.takeaway} total={total} color="#34D399" />
          </View>
        </View>
      )}
    </View>
  );
}

function DistributionLabel({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  if (count === 0) return null;
  const pct = Math.round((count / total) * 100);
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{label} {pct}%</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    ...Colors.cardShadow,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginBottom: 16,
  },
  dimensionList: { gap: 12 },
  dimensionRow: { gap: 4 },
  dimensionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dimensionLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
  },
  dimensionWeight: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  barContainer: {
    height: 6,
    backgroundColor: `${Colors.border}80`,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: AMBER,
    borderRadius: 3,
  },
  dimensionScore: {
    fontSize: 12,
    fontWeight: "600",
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
    textAlign: "right",
  },
  distributionSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  distributionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  distributionBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    gap: 2,
  },
  distributionSegment: {
    height: "100%",
    borderRadius: 4,
  },
  segmentDineIn: { backgroundColor: AMBER },
  segmentDelivery: { backgroundColor: "#60A5FA" },
  segmentTakeaway: { backgroundColor: "#34D399" },
  distributionLegend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
});
