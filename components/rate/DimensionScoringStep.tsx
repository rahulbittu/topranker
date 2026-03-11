/**
 * Sprint 621: Extracted dimension scoring step from rate/[id].tsx
 * Step 1 of the rating flow — score dimensions + would-return.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, type AnimatedStyle } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { CircleScorePicker } from "@/components/rate/SubComponents";
import { DimensionTooltip } from "@/components/rate/VisitTypeStep";

interface DimensionScoringStepProps {
  businessName: string;
  dishContext?: string;
  q1Label: string;
  q2Label: string;
  q3Label: string;
  returnLabel: string;
  dimensionTooltips: Array<{ title: string; description: string }>;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean | null;
  rawScore: number;
  weightedScore: number;
  voteWeight: number;
  circleSize: number;
  activeTooltip: number | null;
  setActiveTooltip: (val: number | null) => void;
  onQ1Change: (val: number) => void;
  onQ2Change: (val: number) => void;
  onQ3Change: (val: number) => void;
  onReturnChange: (val: boolean) => void;
  dim0Style: AnimatedStyle;
  dim1Style: AnimatedStyle;
  dim2Style: AnimatedStyle;
  dim3Style: AnimatedStyle;
  onDimensionLayout: (index: number, y: number) => void;
}

export function DimensionScoringStep({
  businessName, dishContext,
  q1Label, q2Label, q3Label, returnLabel,
  dimensionTooltips,
  q1Score, q2Score, q3Score, wouldReturn,
  rawScore, weightedScore, voteWeight, circleSize,
  activeTooltip, setActiveTooltip,
  onQ1Change, onQ2Change, onQ3Change, onReturnChange,
  dim0Style, dim1Style, dim2Style, dim3Style,
  onDimensionLayout,
}: DimensionScoringStepProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.stepContent} key="step1" accessibilityRole="summary">
      {dishContext && (
        <View style={s.dishContextBanner}>
          <Text style={s.dishContextText}>
            You're rating {businessName} for their <Text style={{ fontWeight: "700" }}>{dishContext}</Text>
          </Text>
        </View>
      )}
      <Animated.View style={[s.compactQuestion, dim0Style]} onLayout={(e) => onDimensionLayout(0, e.nativeEvent.layout.y)}>
        <View style={s.labelWithTooltip}>
          <Text style={s.compactLabel}>{q1Label}</Text>
          <DimensionTooltip tooltip={dimensionTooltips[0]} visible={activeTooltip === 0} onToggle={() => setActiveTooltip(activeTooltip === 0 ? null : 0)} />
        </View>
        <CircleScorePicker value={q1Score} onChange={onQ1Change} circleSize={circleSize} />
      </Animated.View>
      <Animated.View style={[s.compactQuestion, dim1Style]} onLayout={(e) => onDimensionLayout(1, e.nativeEvent.layout.y)}>
        <View style={s.labelWithTooltip}>
          <Text style={s.compactLabel}>{q2Label}</Text>
          <DimensionTooltip tooltip={dimensionTooltips[1]} visible={activeTooltip === 1} onToggle={() => setActiveTooltip(activeTooltip === 1 ? null : 1)} />
        </View>
        <CircleScorePicker value={q2Score} onChange={onQ2Change} circleSize={circleSize} />
      </Animated.View>
      <Animated.View style={[s.compactQuestion, dim2Style]} onLayout={(e) => onDimensionLayout(2, e.nativeEvent.layout.y)}>
        <View style={s.labelWithTooltip}>
          <Text style={s.compactLabel}>{q3Label}</Text>
          <DimensionTooltip tooltip={dimensionTooltips[2]} visible={activeTooltip === 2} onToggle={() => setActiveTooltip(activeTooltip === 2 ? null : 2)} />
        </View>
        <CircleScorePicker value={q3Score} onChange={onQ3Change} circleSize={circleSize} />
      </Animated.View>
      <Animated.View style={[s.compactQuestion, dim3Style]} onLayout={(e) => onDimensionLayout(3, e.nativeEvent.layout.y)}>
        <Text style={s.compactLabel}>{returnLabel}</Text>
        <View style={s.yesNoRow}>
          <TouchableOpacity style={[s.yesNoBtn, wouldReturn === true && s.yesNoBtnYes]} onPress={() => onReturnChange(true)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Yes, would return" accessibilityState={{ selected: wouldReturn === true }}>
            <Ionicons name="checkmark-circle" size={24} color={wouldReturn === true ? "#fff" : Colors.textTertiary} />
            <Text style={[s.yesNoText, wouldReturn === true && s.yesNoTextActive]}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.yesNoBtn, wouldReturn === false && s.yesNoBtnNo]} onPress={() => onReturnChange(false)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="No, would not return" accessibilityState={{ selected: wouldReturn === false }}>
            <Ionicons name="close-circle" size={24} color={wouldReturn === false ? "#fff" : Colors.textTertiary} />
            <Text style={[s.yesNoText, wouldReturn === false && s.yesNoTextActive]}>NO</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      {rawScore > 0 && (
        <Animated.View entering={FadeIn.duration(200)} style={s.liveScorePreview} accessibilityLiveRegion="polite" accessibilityLabel={`Your score: ${rawScore.toFixed(1)}, weighted: ${weightedScore.toFixed(1)}`}>
          <Text style={s.liveScoreLabel}>YOUR SCORE</Text>
          <Text style={s.liveScoreValue}>{rawScore.toFixed(1)}</Text>
          <Text style={s.liveScoreWeight}>×{voteWeight} weight = {weightedScore.toFixed(1)}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  stepContent: { gap: 20 },
  compactQuestion: { gap: 8 },
  labelWithTooltip: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6 },
  compactLabel: {
    fontSize: 15, fontWeight: "600" as const, color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  dishContextBanner: {
    backgroundColor: "rgba(196,154,26,0.08)", borderRadius: 10,
    padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center",
  },
  dishContextText: { fontSize: 13, color: "#111" },
  yesNoRow: { flexDirection: "row", gap: 12 },
  yesNoBtn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 6, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.surfaceRaised, borderWidth: 2, borderColor: Colors.border,
  },
  yesNoBtnYes: { backgroundColor: Colors.green, borderColor: Colors.green },
  yesNoBtnNo: { backgroundColor: Colors.red, borderColor: Colors.red },
  yesNoText: {
    fontSize: 18, fontWeight: "700" as const, color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1,
  },
  yesNoTextActive: { color: "#fff" },
  liveScorePreview: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginTop: 8,
  },
  liveScoreLabel: {
    fontSize: 9, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", letterSpacing: 1,
  },
  liveScoreValue: {
    fontSize: 22, fontWeight: "700", color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  liveScoreWeight: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
});
