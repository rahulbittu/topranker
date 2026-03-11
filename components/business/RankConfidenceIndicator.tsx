import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { getRankConfidence, RANK_CONFIDENCE_LABELS } from "@/lib/data";

export function RankConfidenceIndicator({ ratingCount, category }: { ratingCount: number; category: string }) {
  const confidence = getRankConfidence(ratingCount, category);

  // Sprint 613: Show VERIFIED badge for strong/established confidence
  if (confidence === "strong" || confidence === "established") {
    return (
      <View style={s.verifiedBadge}>
        <Ionicons name="shield-checkmark" size={14} color={Colors.green} />
        <Text style={[s.confidenceLabel, { color: Colors.green }]}>VERIFIED RANKING</Text>
        <Text style={s.confidenceDesc}>
          {confidence === "strong"
            ? "Highly rated with strong community consensus"
            : "Sufficient ratings for a reliable ranking"}
        </Text>
      </View>
    );
  }

  const { label, description } = RANK_CONFIDENCE_LABELS[confidence];
  const confidenceColor = confidence === "provisional" ? Colors.textTertiary
    : BRAND.colors.amber;
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
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.15)",
  },
  confidenceLabel: { fontSize: 12, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  confidenceDesc: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", flex: 1,
  },
});
