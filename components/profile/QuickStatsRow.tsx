/**
 * Sprint 638: Compact quick stats row for profile page.
 * Shows 4 key metrics in a single row: ratings, businesses, streak, tier.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TIER_COLORS, type CredibilityTier } from "@/lib/data";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface QuickStatsRowProps {
  totalRatings: number;
  distinctBusinesses: number;
  currentStreak: number;
  tier: CredibilityTier;
}

interface StatItem {
  icon: IoniconsName;
  value: string;
  label: string;
  color: string;
}

export const QuickStatsRow = React.memo(function QuickStatsRow({
  totalRatings,
  distinctBusinesses,
  currentStreak,
  tier,
}: QuickStatsRowProps) {
  const tierColor = TIER_COLORS[tier];
  const stats: StatItem[] = [
    { icon: "star-outline", value: String(totalRatings), label: "Ratings", color: BRAND.colors.amber },
    { icon: "business-outline", value: String(distinctBusinesses), label: "Places", color: Colors.textSecondary },
    { icon: "flame-outline", value: currentStreak > 0 ? `${currentStreak}d` : "—", label: "Streak", color: currentStreak > 0 ? "#E67E22" : Colors.textTertiary },
    { icon: "shield-checkmark-outline", value: tier.charAt(0).toUpperCase() + tier.slice(1), label: "Tier", color: tierColor },
  ];

  return (
    <View style={s.row} accessibilityRole="summary" accessibilityLabel={`${totalRatings} ratings, ${distinctBusinesses} places, ${currentStreak} day streak, ${tier} tier`}>
      {stats.map((stat, i) => (
        <View key={i} style={s.statItem}>
          <Ionicons name={stat.icon} size={16} color={stat.color} />
          <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
          <Text style={s.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  statItem: {
    flex: 1, alignItems: "center", gap: 2,
  },
  statValue: {
    fontSize: 16, fontWeight: "700", fontFamily: "DMSans_700Bold",
  },
  statLabel: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
});
