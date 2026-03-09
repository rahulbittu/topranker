import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TIER_COLORS, TIER_DISPLAY_NAMES, type CredibilityTier } from "@/lib/data";

export function TierBadge({ tier }: { tier: CredibilityTier }) {
  const color = TIER_COLORS[tier];
  const displayName = TIER_DISPLAY_NAMES[tier];
  return (
    <View style={[s.tierBadge, { borderColor: color, backgroundColor: `${color}18` }]}>
      {tier === "top" && <Ionicons name="trophy" size={12} color={color} />}
      {tier === "trusted" && <Ionicons name="shield-checkmark" size={12} color={color} />}
      {tier === "city" && <Ionicons name="star" size={12} color={color} />}
      {tier === "community" && <Ionicons name="person" size={12} color={color} />}
      <Text style={[s.tierBadgeText, { color }]}>{displayName.toUpperCase()}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  tierBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, alignSelf: "flex-start",
  },
  tierBadgeText: { fontSize: 9, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.8 },
});
