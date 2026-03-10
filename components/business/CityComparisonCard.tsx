/**
 * Sprint 448: City Comparison Card
 * Shows how a business compares to city averages across key metrics.
 * Owner: Priya Sharma (Design) + Sarah Nakamura (Eng)
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface ComparisonMetric {
  label: string;
  icon: IoniconsName;
  bizValue: number;
  cityAvg: number;
  format: "score" | "pct" | "count";
}

export interface CityComparisonCardProps {
  businessName: string;
  city: string;
  bizScore: number;
  bizRatingCount: number;
  bizWouldReturnPct: number | null;
  cityAvgScore: number;
  cityAvgRatingCount: number;
  cityAvgWouldReturnPct: number;
  cityTotalBusinesses: number;
  dimensionComparisons?: { label: string; bizAvg: number; cityAvg: number }[];
}

function formatValue(val: number, format: "score" | "pct" | "count"): string {
  if (format === "score") return val.toFixed(1);
  if (format === "pct") return `${Math.round(val)}%`;
  return String(Math.round(val));
}

function getDeltaColor(delta: number): string {
  if (delta > 0) return "#2D8F4E";
  if (delta < 0) return "#D44040";
  return Colors.textTertiary;
}

function getDeltaIcon(delta: number): IoniconsName {
  if (delta > 0) return "arrow-up";
  if (delta < 0) return "arrow-down";
  return "remove-outline";
}

export function CityComparisonCard({
  businessName,
  city,
  bizScore,
  bizRatingCount,
  bizWouldReturnPct,
  cityAvgScore,
  cityAvgRatingCount,
  cityAvgWouldReturnPct,
  cityTotalBusinesses,
  dimensionComparisons,
}: CityComparisonCardProps) {
  const metrics: ComparisonMetric[] = [
    { label: "Score", icon: "trophy-outline", bizValue: bizScore, cityAvg: cityAvgScore, format: "score" },
    { label: "Ratings", icon: "star-outline", bizValue: bizRatingCount, cityAvg: cityAvgRatingCount, format: "count" },
  ];
  if (bizWouldReturnPct != null && cityAvgWouldReturnPct > 0) {
    metrics.push({ label: "Would Return", icon: "thumbs-up-outline", bizValue: bizWouldReturnPct, cityAvg: cityAvgWouldReturnPct, format: "pct" });
  }

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Ionicons name="stats-chart-outline" size={18} color={AMBER} />
        <Text style={s.headerText}>vs {city} Average</Text>
        <Text style={s.headerSubtext}>{cityTotalBusinesses} businesses</Text>
      </View>

      {/* Main metrics comparison */}
      <View style={s.metricsGrid}>
        {metrics.map(m => {
          const delta = m.bizValue - m.cityAvg;
          const deltaColor = getDeltaColor(delta);
          return (
            <View key={m.label} style={s.metricRow}>
              <Ionicons name={m.icon} size={14} color={Colors.textTertiary} />
              <Text style={s.metricLabel}>{m.label}</Text>
              <View style={s.metricValues}>
                <Text style={s.metricBizValue}>{formatValue(m.bizValue, m.format)}</Text>
                <View style={s.deltaContainer}>
                  <Ionicons name={getDeltaIcon(delta)} size={10} color={deltaColor} />
                  <Text style={[s.deltaText, { color: deltaColor }]}>
                    {delta > 0 ? "+" : ""}{formatValue(Math.abs(delta), m.format)}
                  </Text>
                </View>
                <Text style={s.metricCityAvg}>avg {formatValue(m.cityAvg, m.format)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Dimension comparisons */}
      {dimensionComparisons && dimensionComparisons.length > 0 && (
        <View style={s.dimensionSection}>
          <Text style={s.sectionLabel}>Dimension Comparison</Text>
          {dimensionComparisons.map(d => {
            const delta = d.bizAvg - d.cityAvg;
            const deltaColor = getDeltaColor(delta);
            const barWidth = Math.min(100, Math.max(10, (d.bizAvg / 5) * 100));
            const cityBarWidth = Math.min(100, Math.max(10, (d.cityAvg / 5) * 100));
            return (
              <View key={d.label} style={s.dimRow}>
                <Text style={s.dimLabel}>{d.label}</Text>
                <View style={s.dimBarContainer}>
                  <View style={[s.dimBar, { width: pct(barWidth), backgroundColor: AMBER }]} />
                  <View style={[s.dimBarCity, { width: pct(cityBarWidth) }]} />
                </View>
                <Text style={[s.dimValue, { color: deltaColor }]}>{d.bizAvg.toFixed(1)}</Text>
              </View>
            );
          })}
          <View style={s.legendRow}>
            <View style={[s.legendDot, { backgroundColor: AMBER }]} />
            <Text style={s.legendText}>This business</Text>
            <View style={[s.legendDot, { backgroundColor: Colors.border }]} />
            <Text style={s.legendText}>City avg</Text>
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
  headerSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  metricsGrid: {
    gap: 10,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
    flex: 1,
  },
  metricValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricBizValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    minWidth: 36,
    textAlign: "right",
  },
  deltaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.background,
  },
  deltaText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
  metricCityAvg: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    minWidth: 50,
  },
  dimensionSection: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dimRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dimLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    width: 55,
  },
  dimBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  dimBar: {
    position: "absolute",
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  dimBarCity: {
    position: "absolute",
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  dimValue: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    width: 28,
    textAlign: "right",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginRight: 8,
  },
});
