/**
 * Extracted sub-components from app/rate/[id].tsx
 * Presentational components for the rating flow.
 * Extracted per Audit N1/N6 to reduce rate/[id].tsx from 1104 LOC.
 */
import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle, FadeInDown, FadeInUp,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_SCORE_RANGES,
  TIER_INFLUENCE_LABELS,
  type CredibilityTier,
} from "@/lib/data";
import type { ApiDish } from "@/lib/api";

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

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={s.progressContainer} accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            s.progressDot,
            i < step && s.progressDotComplete,
            i === step && s.progressDotCurrent,
          ]}
          accessibilityLabel={`Step ${i + 1}${i < step ? ", completed" : i === step ? ", current" : ""}`}
        />
      ))}
    </View>
  );
}

export function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <Text style={s.stepIndicator}>
      {step + 1} <Text style={s.stepIndicatorOf}>of</Text> {total}
    </Text>
  );
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

export function RatingConfirmation({
  business,
  rawScore,
  weightedScore,
  voteWeight,
  prevRank,
  newRank,
  userTier,
  userScore,
  tierColor,
  tierDisplayName,
  nextTier,
  confirmIconStyle,
  rankStyle,
  tierBarStyle,
  onDone,
}: {
  business: { name: string; rank: number };
  rawScore: number;
  weightedScore: number;
  voteWeight: number;
  prevRank: number;
  newRank: number;
  userTier: CredibilityTier;
  userScore: number;
  tierColor: string;
  tierDisplayName: string;
  nextTier: CredibilityTier | null;
  confirmIconStyle: any;
  rankStyle: any;
  tierBarStyle: any;
  onDone: () => void;
}) {
  return (
    <View style={s.confirmInner}>
      <Animated.View style={[s.confirmIconWrap, confirmIconStyle]}>
        <View style={s.confirmIconCircle}>
          <Ionicons name="checkmark" size={40} color="#FFFFFF" />
        </View>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={s.confirmTitle}>
        Your Rating is Live
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(400)} style={s.confirmSub}>
        Your voice is now part of this ranking
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(400).duration(500)} style={s.rankChangeCard}>
        <Text style={s.rankChangeTitle}>{business.name}</Text>
        <Animated.View style={[s.rankChangeRow, rankStyle]}>
          <View style={s.rankBox}>
            <Text style={s.rankBoxLabel}>Before</Text>
            <Text style={s.rankBoxNum}>#{prevRank}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.textTertiary} />
          <View style={[s.rankBox, newRank < prevRank && s.rankBoxImproved]}>
            <Text style={s.rankBoxLabel}>After</Text>
            <Text style={[s.rankBoxNum, newRank < prevRank && { color: Colors.green }]}>
              #{newRank}
            </Text>
          </View>
        </Animated.View>
        {newRank < prevRank && (
          <View style={s.movedUpBanner}>
            <Ionicons name="trending-up" size={14} color={Colors.green} />
            <Text style={s.movedUpText}>Your rating helped this business move up!</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).duration(500)} style={s.tierProgressCard}>
        <View style={s.tierProgressHeader}>
          <View style={s.tierBadgeRow}>
            <View style={[s.tierDot, { backgroundColor: tierColor }]} />
            <Text style={s.tierBadgeText}>{tierDisplayName}</Text>
          </View>
          <Text style={s.tierScoreText}>{userScore} pts</Text>
        </View>
        <View style={s.tierBarOuter}>
          <Animated.View style={[s.tierBarInner, { backgroundColor: tierColor }, tierBarStyle]} />
        </View>
        {nextTier && (
          <Text style={s.tierNextText}>
            {TIER_SCORE_RANGES[nextTier].min - userScore} pts to{" "}
            <Text style={[s.tierNextHighlight, { color: TIER_COLORS[nextTier] }]}>{TIER_DISPLAY_NAMES[nextTier]}</Text>
          </Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(700).duration(500)} style={s.scoreBreakdownCard}>
        <View style={s.scoreBreakdownRow}>
          <Text style={s.scoreBreakdownLabel}>Your Score</Text>
          <Text style={s.scoreBreakdownVal}>{rawScore.toFixed(1)}</Text>
        </View>
        <View style={s.scoreBreakdownRow}>
          <Text style={s.scoreBreakdownLabel}>{TIER_INFLUENCE_LABELS[userTier]}</Text>
          <Text style={[s.scoreBreakdownVal, { color: tierColor }]}>{tierDisplayName}</Text>
        </View>
        <View style={s.scoreBreakdownDivider} />
        <View style={s.scoreBreakdownRow}>
          <Text style={s.scoreBreakdownLabelBold}>Contribution</Text>
          <Text style={s.scoreBreakdownValBold}>{weightedScore.toFixed(1)}</Text>
        </View>
        <Text style={s.influenceHint}>
          Rate consistently to grow your influence
        </Text>
      </Animated.View>

      <TouchableOpacity
        style={[s.doneButton]}
        onPress={onDone}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Done, go back to business"
      >
        <Text style={s.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
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

  progressContainer: { flexDirection: "row", gap: 4, paddingHorizontal: 20, marginTop: 8 },
  progressDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  progressDotComplete: { backgroundColor: Colors.gold },
  progressDotCurrent: { backgroundColor: Colors.textTertiary },

  stepIndicator: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  stepIndicatorOf: { color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

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

  // Confirmation screen
  confirmInner: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24, gap: 12,
  },
  confirmIconWrap: { marginBottom: 4 },
  confirmIconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.green,
    alignItems: "center", justifyContent: "center",
  },
  confirmTitle: {
    fontSize: 26, fontWeight: "700", color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5, textAlign: "center",
  },
  confirmSub: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginBottom: 8,
  },
  rankChangeCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, alignItems: "center", gap: 12, ...Colors.cardShadow,
  },
  rankChangeTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  rankChangeRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  rankBox: {
    alignItems: "center", gap: 4, width: 72, paddingVertical: 10,
    borderRadius: 10, backgroundColor: Colors.surfaceRaised,
  },
  rankBoxImproved: { backgroundColor: Colors.greenFaint },
  rankBoxLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  rankBoxNum: {
    fontSize: 22, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  movedUpBanner: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.greenFaint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
  },
  movedUpText: { fontSize: 11, color: Colors.green, fontFamily: "DMSans_500Medium" },

  tierProgressCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, gap: 8, ...Colors.cardShadow,
  },
  tierProgressHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  tierBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierBadgeText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  tierScoreText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  tierBarOuter: { height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: "hidden" },
  tierBarInner: { height: "100%", borderRadius: 2 },
  tierNextText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  tierNextHighlight: { fontFamily: "DMSans_600SemiBold" },

  scoreBreakdownCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, gap: 8, ...Colors.cardShadow,
  },
  scoreBreakdownRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  scoreBreakdownLabel: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  scoreBreakdownVal: {
    fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  scoreBreakdownDivider: { height: 1, backgroundColor: Colors.border },
  scoreBreakdownLabelBold: {
    fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  scoreBreakdownValBold: {
    fontSize: 20, fontWeight: "700", color: Colors.gold, fontFamily: "PlayfairDisplay_700Bold",
  },
  influenceHint: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginTop: 4,
  },
  doneButton: {
    width: "100%", marginTop: 8, backgroundColor: Colors.text, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 6,
  },
  primaryButtonText: {
    fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold",
  },
});
