import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct as pctDim } from "@/lib/style-helpers";
import type { MappedRating } from "./types";

const AMBER = BRAND.colors.amber;

export const RatingDistribution = React.memo(function RatingDistribution({ ratings }: { ratings: MappedRating[] }) {
  const dist = [0, 0, 0, 0, 0];
  ratings.forEach(r => {
    const bucket = Math.min(4, Math.max(0, Math.round(r.rawScore) - 1));
    dist[bucket]++;
  });
  const maxCount = Math.max(...dist);
  const total = ratings.length;

  // Average score
  const avgScore = total > 0 ? ratings.reduce((sum, r) => sum + r.rawScore, 0) / total : 0;

  // Trust breakdown: trusted + top raters vs community + city
  const trustedCount = ratings.filter(r => r.userTier === "trusted" || r.userTier === "top").length;
  const trustedPct = total > 0 ? Math.round((trustedCount / total) * 100) : 0;

  return (
    <View style={s.rdCard}>
      <Text style={s.rdTitle}>Rating Distribution</Text>
      <Text style={s.rdSubtitle}>Transparent breakdown of all community ratings</Text>

      {/* Average score summary row */}
      <View style={s.rdSummaryRow}>
        <View style={s.rdAvgBlock}>
          <Text style={s.rdAvgScore}>{avgScore.toFixed(1)}</Text>
          <Text style={s.rdAvgLabel}>avg score</Text>
        </View>
        <View style={s.rdAvgBlock}>
          <Text style={s.rdAvgScore}>{total}</Text>
          <Text style={s.rdAvgLabel}>total ratings</Text>
        </View>
        <View style={s.rdAvgBlock}>
          <Text style={[s.rdAvgScore, trustedPct >= 50 && s.rdTrustedHighlight]}>{trustedPct}%</Text>
          <Text style={s.rdAvgLabel}>trusted raters</Text>
        </View>
      </View>

      {/* Distribution bars */}
      {[5, 4, 3, 2, 1].map(score => {
        const count = dist[score - 1];
        const barPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const ratingPct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <View key={score} style={s.rdRow}>
            <Text style={s.rdLabel}>{score}</Text>
            <View style={s.rdBarBg}>
              <View style={[s.rdBarFill, { width: pctDim(barPct), backgroundColor: score >= 4 ? Colors.green : score === 3 ? AMBER : Colors.red }]} />
            </View>
            <Text style={s.rdCount}>{count}</Text>
            <Text style={s.rdPct}>{ratingPct}%</Text>
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

  rdSummaryRow: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 8, marginBottom: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rdAvgBlock: { alignItems: "center", gap: 2 },
  rdAvgScore: {
    fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  rdAvgLabel: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  rdTrustedHighlight: { color: Colors.green },

  rdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rdLabel: { width: 12, fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium", textAlign: "center" },
  rdBarBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden" },
  rdBarFill: { height: "100%", borderRadius: 2 },
  rdCount: { width: 20, ...TYPOGRAPHY.ui.small, color: Colors.textTertiary, textAlign: "right" },
  rdPct: { width: 28, fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textAlign: "right" },
});
