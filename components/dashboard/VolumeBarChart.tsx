/**
 * Sprint 482: Volume Bar Chart for Dashboard
 *
 * Renders weekly or monthly rating volume as a bar chart.
 * Each bar shows count, with optional avg score tooltip.
 * Used in business owner dashboard for rating volume trends.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export interface VolumePoint {
  period: string;
  count: number;
  avgScore: number;
}

export interface VolumeBarChartProps {
  data: VolumePoint[];
  width?: number;
  height?: number;
  label?: string;
  barColor?: string;
  showLabels?: boolean;
}

export function VolumeBarChart({
  data,
  width = 280,
  height = 80,
  label,
  barColor = AMBER,
  showLabels = true,
}: VolumeBarChartProps) {
  if (data.length === 0) {
    return (
      <View style={[s.container, { width }]}>
        {label && <Text style={s.label}>{label}</Text>}
        <Text style={s.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = Math.max(Math.floor((width - (data.length - 1) * 4) / data.length), 8);
  const chartH = height - (showLabels ? 16 : 0);

  return (
    <View style={[s.container, { width }]}>
      {label && <Text style={s.label}>{label}</Text>}
      <View style={[s.chartRow, { height: chartH }]}>
        {data.map((d, i) => {
          const barH = Math.max((d.count / maxCount) * chartH, 2);
          const periodLabel = formatPeriodLabel(d.period);
          return (
            <View key={i} style={s.barCol}>
              <View style={[s.bar, {
                width: barWidth,
                height: barH,
                backgroundColor: d.count > 0 ? barColor : `${barColor}30`,
                borderRadius: barWidth > 12 ? 4 : 2,
              }]} />
              {showLabels && (
                <Text style={s.barLabel} numberOfLines={1}>{periodLabel}</Text>
              )}
              {d.count > 0 && (
                <Text style={s.barCount}>{d.count}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatPeriodLabel(period: string): string {
  const date = new Date(period);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

const s = StyleSheet.create({
  container: { alignItems: "center" },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    alignSelf: "flex-start",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  barCol: { alignItems: "center", gap: 2 },
  bar: { minHeight: 2 },
  barLabel: {
    fontSize: 8,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    maxWidth: 40,
    textAlign: "center",
  },
  barCount: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
    position: "absolute",
    top: -14,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginTop: 8,
  },
});
