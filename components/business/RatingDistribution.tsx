import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct as pctDim } from "@/lib/style-helpers";
import type { MappedRating } from "./types";

export const RatingDistribution = React.memo(function RatingDistribution({ ratings }: { ratings: MappedRating[] }) {
  const dist = [0, 0, 0, 0, 0];
  ratings.forEach(r => {
    const bucket = Math.min(4, Math.max(0, Math.round(r.rawScore) - 1));
    dist[bucket]++;
  });
  const maxCount = Math.max(...dist);

  return (
    <View style={s.rdCard}>
      <Text style={s.rdTitle}>Rating Distribution</Text>
      <Text style={s.rdSubtitle}>Transparent breakdown of all community ratings</Text>
      {[5, 4, 3, 2, 1].map(score => {
        const count = dist[score - 1];
        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <View key={score} style={s.rdRow}>
            <Text style={s.rdLabel}>{score}</Text>
            <View style={s.rdBarBg}>
              <View style={[s.rdBarFill, { width: pctDim(pct), backgroundColor: score >= 4 ? Colors.green : score === 3 ? BRAND.colors.amber : Colors.red }]} />
            </View>
            <Text style={s.rdCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
});

export default RatingDistribution;

const s = StyleSheet.create({
  rdCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  rdTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  rdSubtitle: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginBottom: 4 },
  rdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rdLabel: { width: 12, fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium", textAlign: "center" },
  rdBarBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden" },
  rdBarFill: { height: "100%", borderRadius: 2 },
  rdCount: { width: 20, ...TYPOGRAPHY.ui.small, color: Colors.textTertiary, textAlign: "right" },
});
