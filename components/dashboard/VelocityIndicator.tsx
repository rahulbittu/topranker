/**
 * Sprint 482: Velocity Change Indicator for Dashboard
 *
 * Shows rating velocity change as a colored badge with arrow.
 * Positive = more ratings recently, negative = fewer.
 * Used in business owner dashboard next to sparkline/volume charts.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

export interface VelocityIndicatorProps {
  velocityChange: number;  // Percentage change (e.g., 25 means +25%)
  label?: string;
}

export function VelocityIndicator({
  velocityChange,
  label = "Rating Velocity",
}: VelocityIndicatorProps) {
  const isPositive = velocityChange > 0;
  const isNeutral = velocityChange === 0;
  const absChange = Math.abs(velocityChange);

  const iconName = isNeutral
    ? "remove-outline"
    : isPositive ? "trending-up" : "trending-down";

  const color = isNeutral
    ? Colors.textTertiary
    : isPositive ? (BRAND.colors.green || "#22C55E") : (Colors.red || "#EF4444");

  const bgColor = isNeutral
    ? `${Colors.textTertiary}10`
    : isPositive ? `${color}15` : `${color}15`;

  const changeText = isNeutral
    ? "No change"
    : `${isPositive ? "+" : "-"}${absChange}%`;

  const sublabel = isNeutral
    ? "Same as previous period"
    : isPositive
      ? "More ratings than previous period"
      : "Fewer ratings than previous period";

  return (
    <View style={[s.card, { backgroundColor: bgColor }]}>
      <View style={s.topRow}>
        <Ionicons name={iconName as any} size={18} color={color} />
        <Text style={[s.changeText, { color }]}>{changeText}</Text>
      </View>
      <Text style={s.label}>{label}</Text>
      <Text style={s.sublabel}>{sublabel}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeText: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
    marginTop: 2,
  },
  sublabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});
