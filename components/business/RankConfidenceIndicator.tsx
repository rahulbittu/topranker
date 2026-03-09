import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { getRankConfidence, RANK_CONFIDENCE_LABELS } from "@/lib/data";

export function RankConfidenceIndicator({ ratingCount, category }: { ratingCount: number; category: string }) {
  const confidence = getRankConfidence(ratingCount, category);
  if (confidence === "strong") return null;
  const { label, description } = RANK_CONFIDENCE_LABELS[confidence];
  const confidenceColor = confidence === "provisional" ? Colors.textTertiary
    : confidence === "early" ? BRAND.colors.amber : Colors.green;
  return (
    <View style={s.confidenceBadge}>
      <Ionicons
        name={confidence === "provisional" ? "hourglass-outline" : "trending-up-outline"}
        size={14} color={confidenceColor} />
      <Text style={[s.confidenceLabel, { color: confidenceColor }]}>{label}</Text>
      <Text style={s.confidenceDesc}>{description}</Text>
    </View>
  );
}

export default RankConfidenceIndicator;

const s = StyleSheet.create({
  confidenceBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: Colors.surfaceRaised, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  confidenceLabel: { fontSize: 12, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  confidenceDesc: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", flex: 1,
  },
});
