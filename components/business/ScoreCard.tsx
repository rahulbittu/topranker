import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";
import { getRankDisplay } from "@/lib/data";
import ScoreCountUp from "@/components/animations/ScoreCountUp";

export function AnimatedScore({ value, style }: { value: number; style: any }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = useState("0.00");

  useEffect(() => {
    animVal.setValue(0);
    const listener = animVal.addListener(({ value: v }) => {
      setDisplayVal(v.toFixed(2));
    });
    Animated.timing(animVal, {
      toValue: value,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animVal.removeListener(listener);
  }, [value]);

  return <Text style={style}>{displayVal}</Text>;
}

export interface ScoreCardProps {
  weightedScore: number;
  ratingCount: number;
  rank: number;
  googleRating?: number | null;
}

export function ScoreCard({ weightedScore, ratingCount, rank, googleRating }: ScoreCardProps) {
  return (
    <View style={s.scoreCard}>
      <ScoreCountUp targetValue={weightedScore} duration={1000} decimalPlaces={1} style={s.scoreNumber} />
      <Text style={s.scoreLabel}>Weighted Score</Text>
      <View style={s.scoreMetaRow}>
        <Text style={s.scoreMetaItem}>{ratingCount.toLocaleString()} ratings</Text>
        <Text style={s.scoreMetaItem}>{getRankDisplay(rank)}</Text>
        {googleRating && (
          <View style={s.googleRow}>
            <MaterialCommunityIcons name="google" size={10} color={Colors.textTertiary} />
            <Text style={s.scoreMetaItem}>{googleRating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default ScoreCard;

const s = StyleSheet.create({
  scoreCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 20, alignItems: "center", gap: 4, ...Colors.cardShadow,
  },
  scoreNumber: {
    fontSize: 48, fontWeight: "900", color: Colors.gold,
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -1.5,
  },
  scoreLabel: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  scoreMetaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  scoreMetaItem: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  googleRow: { flexDirection: "row", alignItems: "center", gap: 3 },
});
