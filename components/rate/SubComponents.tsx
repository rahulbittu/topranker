/**
 * Extracted sub-components from app/rate/[id].tsx
 * Presentational components for the rating flow.
 * Sprint 449: RatingConfirmation extracted to RatingConfirmation.tsx
 */
import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { pct as pctDim } from "@/lib/style-helpers";

import Colors from "@/constants/colors";
import type { ApiDish } from "@/lib/api";

// Sprint 449: Re-export from extracted file for backward compatibility
export { RatingConfirmation } from "./RatingConfirmation";

const SCORE_LABELS = ["Poor", "Fair", "Good", "Great", "Amazing"];

export function CircleScorePicker({ value, onChange, circleSize }: { value: number; onChange: (v: number) => void; circleSize: number }) {
  return (
    <View style={s.circleRow}>
      {[1, 2, 3, 4, 5].map(n => {
        const isActive = value === n;
        return (
          <TouchableOpacity
            key={n}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onChange(n);
            }}
            style={[s.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }, isActive && s.circleActive]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Score ${n}, ${SCORE_LABELS[n - 1]}`}
            accessibilityState={{ selected: isActive }}
            accessibilityHint="Double tap to select this score"
          >
            <Text style={[s.circleNum, isActive && s.circleNumActive]}>{n}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function CircleScoreLabels({ circleSize }: { circleSize: number }) {
  return (
    <View style={s.circleLabelRow}>
      {SCORE_LABELS.map((label, i) => (
        <View key={i} style={[s.circleLabelItem, { width: circleSize }]}>
          <Text style={s.circleLabelText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const STEP_LABELS = ["Visit Type", "Score", "Details", "Review"];
const STEP_DESCRIPTIONS = [
  "How did you experience this place?",
  "Rate the dimensions that matter",
  "Add optional details to boost credibility",
  "Confirm your rating before submitting",
];

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <View style={s.progressOuter}>
      <View style={s.progressContainer} accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${total}`} accessibilityValue={{ min: 0, max: total, now: step + 1, text: `${pct}% complete` }}>
        <View style={[s.progressFill, { width: pctDim(((step + 1) / total) * 100) }]} />
      </View>
      <View style={s.progressLabels}>
        {Array.from({ length: total }, (_, i) => (
          <Text
            key={i}
            style={[
              s.progressLabel,
              i <= step && s.progressLabelActive,
              i === step && s.progressLabelCurrent,
            ]}
          >
            {STEP_LABELS[i] || `Step ${i + 1}`}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function StepIndicator({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <View style={s.stepIndicatorRow} accessibilityRole="text" accessibilityLabel={`Step ${step + 1} of ${total}, ${pct}% complete`}>
      <Text style={s.stepIndicator}>
        {step + 1} <Text style={s.stepIndicatorOf}>of</Text> {total}
      </Text>
      <Text style={s.stepPct}>{pct}%</Text>
    </View>
  );
}

export function StepDescription({ step }: { step: number }) {
  const desc = STEP_DESCRIPTIONS[step];
  if (!desc) return null;
  return <Text style={s.stepDescription} accessibilityRole="text" accessibilityLabel={`Current step: ${desc}`}>{desc}</Text>;
}

export function DishPill({ dish, selected, onPress }: { dish: ApiDish; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.dishPill, selected && s.dishPillSelected]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${dish.name}${dish.voteCount > 0 ? `, ${dish.voteCount} votes` : ""}`}
      accessibilityState={{ selected }}
      accessibilityHint={selected ? "Double tap to deselect" : "Double tap to select this dish"}
    >
      <Text style={[s.dishPillText, selected && s.dishPillTextSelected]}>
        {dish.name}
      </Text>
      {dish.voteCount > 0 && (
        <View style={[s.dishVoteBadge, selected && s.dishVoteBadgeSelected]}>
          <Text style={[s.dishVoteCount, selected && s.dishVoteCountSelected]}>
            {dish.voteCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  circleRow: {
    flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 8,
  },
  circle: {
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.border,
  },
  circleActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  circleNum: {
    fontSize: 20, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  circleNumActive: { color: "#FFFFFF" },

  circleLabelRow: {
    flexDirection: "row", justifyContent: "center", gap: 12, marginTop: -4,
  },
  circleLabelItem: { alignItems: "center" },
  circleLabelText: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },

  progressOuter: { paddingHorizontal: 20, marginTop: 8, gap: 6 },
  progressContainer: {
    height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: "hidden" as const,
  },
  progressFill: {
    height: pctDim(100), borderRadius: 2, backgroundColor: Colors.gold,
  },
  progressLabels: {
    flexDirection: "row" as const, justifyContent: "space-between" as const,
  },
  progressLabel: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  progressLabelActive: {
    color: Colors.textSecondary,
  },
  progressLabelCurrent: {
    fontFamily: "DMSans_600SemiBold", color: Colors.gold,
  },

  stepIndicatorRow: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 8,
  },
  stepIndicator: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  stepIndicatorOf: { color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  stepPct: {
    fontSize: 11, color: Colors.gold, fontFamily: "DMSans_700Bold",
  },
  stepDescription: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    lineHeight: 16, marginTop: 2,
  },

  dishPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.surfaceRaised, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20,
  },
  dishPillSelected: { backgroundColor: Colors.text },
  dishPillText: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
  dishPillTextSelected: { color: "#FFFFFF" },
  dishVoteBadge: {
    backgroundColor: Colors.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  dishVoteBadgeSelected: { backgroundColor: "rgba(255,255,255,0.2)" },
  dishVoteCount: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold" },
  dishVoteCountSelected: { color: "#FFFFFF" },
});
