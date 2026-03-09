import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { type CredibilityTier, TIER_INFLUENCE_LABELS } from "@/lib/data";
import type { MappedRating } from "./types";

export interface YourRatingCardProps {
  myRating: MappedRating;
  tier: CredibilityTier;
}

export function YourRatingCard({ myRating, tier }: YourRatingCardProps) {
  const ratedDate = new Date(myRating.createdAt);
  const daysAgo = Math.floor((Date.now() - ratedDate.getTime()) / (1000 * 60 * 60 * 24));
  return (
    <View style={s.yourRatingCard}>
      <View style={s.yourRatingHeader}>
        <Ionicons name="star" size={14} color={BRAND.colors.amber} />
        <Text style={s.yourRatingTitle}>Your Rating</Text>
        <Text style={s.yourRatingDate}>
          {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}
        </Text>
      </View>
      <View style={s.yourRatingScores}>
        <View style={s.yourRatingScoreItem}>
          <Text style={s.yourRatingScoreValue}>{myRating.q1}</Text>
          <Text style={s.yourRatingScoreLabel}>Quality</Text>
        </View>
        <View style={s.yourRatingScoreItem}>
          <Text style={s.yourRatingScoreValue}>{myRating.q2}</Text>
          <Text style={s.yourRatingScoreLabel}>Value</Text>
        </View>
        <View style={s.yourRatingScoreItem}>
          <Text style={s.yourRatingScoreValue}>{myRating.q3}</Text>
          <Text style={s.yourRatingScoreLabel}>Service</Text>
        </View>
        <View style={s.yourRatingScoreItem}>
          <Ionicons
            name={myRating.wouldReturn ? "checkmark-circle" : "close-circle"}
            size={16} color={myRating.wouldReturn ? Colors.green : Colors.red} />
          <Text style={s.yourRatingScoreLabel}>Return</Text>
        </View>
      </View>
      <Text style={s.yourRatingInfluence}>
        {TIER_INFLUENCE_LABELS[tier]} · Score {myRating.rawScore.toFixed(1)}
      </Text>
    </View>
  );
}

export default YourRatingCard;

const s = StyleSheet.create({
  yourRatingCard: {
    backgroundColor: `${BRAND.colors.amber}08`, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: `${BRAND.colors.amber}20`, gap: 10, marginBottom: 12,
  },
  yourRatingHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  yourRatingTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  yourRatingDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  yourRatingScores: { flexDirection: "row", justifyContent: "space-around" },
  yourRatingScoreItem: { alignItems: "center", gap: 2 },
  yourRatingScoreValue: {
    fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  yourRatingScoreLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  yourRatingInfluence: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", textAlign: "center",
  },
});
