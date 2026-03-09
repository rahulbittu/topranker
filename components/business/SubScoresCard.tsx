import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct as pctDim } from "@/lib/style-helpers";
import { SlideUpView } from "@/components/animations/SlideUpView";
import type { MappedRating } from "./types";

export function SubScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min((value / 5) * 100, 100);
  return (
    <View style={s.subScoreRow}>
      <Text style={s.subScoreLabel}>{label}</Text>
      <View style={s.subScoreTrack}>
        <View style={[s.subScoreFill, { width: pctDim(pct) }]} />
      </View>
      <Text style={s.subScoreValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

export interface SubScoresCardProps {
  avgQ1: number;
  avgQ2: number;
  avgQ3: number;
  ratings: MappedRating[];
}

export function SubScoresCard({ avgQ1, avgQ2, avgQ3, ratings }: SubScoresCardProps) {
  return (
    <SlideUpView delay={200} distance={20}>
      <View style={s.subScoresCard}>
        <SubScoreBar label="Quality" value={avgQ1} />
        <SubScoreBar label="Value" value={avgQ2} />
        <SubScoreBar label="Service" value={avgQ3} />
        <View style={s.returnRateRow}>
          <Ionicons name="refresh-circle" size={14} color={Colors.green} />
          <Text style={s.returnRateText}>
            {Math.round((ratings.filter(r => r.wouldReturn).length / ratings.length) * 100)}% would return
          </Text>
        </View>
      </View>
    </SlideUpView>
  );
}

export default SubScoresCard;

const s = StyleSheet.create({
  subScoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  subScoreLabel: { width: 60, fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  subScoreTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: "hidden" },
  subScoreFill: { height: 6, borderRadius: 3, backgroundColor: BRAND.colors.amber },
  subScoreValue: { width: 30, fontSize: 13, fontWeight: "600", color: Colors.text, textAlign: "right", fontFamily: "DMSans_600SemiBold" },
  subScoresCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10, ...Colors.cardShadow,
  },
  returnRateRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  returnRateText: { ...TYPOGRAPHY.ui.label, color: Colors.textSecondary },
});
