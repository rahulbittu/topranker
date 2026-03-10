import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";
import { BreakdownRow } from "./BreakdownRow";

interface BreakdownData {
  base?: number;
  volume?: number;
  diversity?: number;
  age?: number;
  variance?: number;
  penalties?: number;
}

interface ScoreBreakdownCardProps {
  totalRatings: number;
  breakdown: BreakdownData;
  totalScore: number;
  tierColor: string;
}

export function ScoreBreakdownCard({ totalRatings, breakdown, totalScore, tierColor }: ScoreBreakdownCardProps) {
  const [expanded, setExpanded] = useState(false);

  const breakdownRows = (
    <>
      <BreakdownRow label="Base points" value={`+${breakdown.base || 0}`} icon="person-outline" />
      <BreakdownRow label="Rating volume" value={`+${breakdown.volume || 0}`} icon="star-outline" />
      <BreakdownRow label="Category diversity" value={`+${breakdown.diversity || 0}`} icon="grid-outline" />
      <BreakdownRow label="Account age" value={`+${Math.round(breakdown.age || 0)}`} icon="time-outline" />
      <BreakdownRow label="Rating variance" value={`+${Math.round(breakdown.variance || 0)}`} icon="analytics-outline" />
      {(breakdown.penalties || 0) > 0 && (
        <BreakdownRow label="Flag penalties" value={`-${breakdown.penalties}`} icon="flag-outline" />
      )}
      <View style={styles.breakdownTotal}>
        <Text style={styles.breakdownTotalLabel}>Total</Text>
        <Text style={[styles.breakdownTotalValue, { color: tierColor }]}>{totalScore}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.breakdownCard}>
      {totalRatings < 5 ? (
        <>
          <TouchableOpacity
            style={styles.breakdownTitleRow}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.breakdownTitle}>Score Breakdown</Text>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
          {!expanded && (
            <Text style={styles.breakdownHint}>
              Rate {5 - totalRatings} more place{5 - totalRatings !== 1 ? "s" : ""} to see meaningful score details
            </Text>
          )}
          {expanded && breakdownRows}
        </>
      ) : (
        <>
          <Text style={styles.breakdownTitle}>Score Breakdown</Text>
          {breakdownRows}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  breakdownCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    gap: 10, ...Colors.cardShadow,
  },
  breakdownTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", marginBottom: 2 },
  breakdownTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  breakdownHint: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 4 },
  breakdownTotal: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 6, marginTop: 2,
  },
  breakdownTotalLabel: { ...TYPOGRAPHY.ui.bodyBold, fontWeight: "700", color: Colors.text },
  breakdownTotalValue: { fontSize: 20, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold" },
});
