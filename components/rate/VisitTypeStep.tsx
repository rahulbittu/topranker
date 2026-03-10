/**
 * Sprint 411: Extracted visit type selection step from rate/[id].tsx.
 * Step 0 of the rating flow: user selects dine-in, delivery, or takeaway.
 * Visit type determines dimension labels (Rating Integrity Phase 1a).
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

export type VisitType = "dine_in" | "delivery" | "takeaway";

const VISIT_OPTIONS: { type: VisitType; icon: string; label: string; desc: string }[] = [
  { type: "dine_in", icon: "\uD83C\uDF7D\uFE0F", label: "Dined In", desc: "I ate at the restaurant" },
  { type: "delivery", icon: "\uD83D\uDEF5", label: "Delivery", desc: "I ordered delivery" },
  { type: "takeaway", icon: "\uD83D\uDCE6", label: "Takeaway", desc: "I picked up my order" },
];

interface VisitTypeStepProps {
  businessName: string;
  visitType: VisitType | null;
  onSelect: (type: VisitType) => void;
}

export function VisitTypeStep({ businessName, visitType, onSelect }: VisitTypeStepProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.container} key="step0">
      <Text style={s.title}>How did you experience {businessName}?</Text>
      {VISIT_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.type}
          style={[s.card, visitType === opt.type && s.cardSelected]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onSelect(opt.type); }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${opt.label}: ${opt.desc}`}
          accessibilityState={{ selected: visitType === opt.type }}
        >
          <Text style={s.icon}>{opt.icon}</Text>
          <View>
            <Text style={s.label}>{opt.label}</Text>
            <Text style={s.desc}>{opt.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

/** Sprint 411: Dimension labels by visit type (Rating Integrity Phase 1a) */
export function getDimensionLabels(visitType: VisitType | null): { q1Label: string; q2Label: string; q3Label: string } {
  switch (visitType) {
    case "delivery":
      return { q1Label: "Food Quality", q2Label: "Packaging Quality", q3Label: "Value for Money" };
    case "takeaway":
      return { q1Label: "Food Quality", q2Label: "Wait Time Accuracy", q3Label: "Value for Money" };
    case "dine_in":
    default:
      return { q1Label: "Food Quality", q2Label: "Service", q3Label: "Vibe & Atmosphere" };
  }
}

/**
 * Sprint 439: Dimension tooltip data — explains what each dimension means
 * and its weight in the composite score by visit type.
 */
export interface DimensionTooltipData {
  label: string;
  description: string;
  weight: string;
  examples: string;
  scoringTip: string; // Sprint 468: scoring guidance
}

const DIMENSION_TOOLTIPS: Record<VisitType, DimensionTooltipData[]> = {
  dine_in: [
    { label: "Food Quality", description: "Taste, freshness, temperature, and presentation of the food.", weight: "50%", examples: "Was the biryani flavorful? Was the naan fresh?", scoringTip: "10 = exceptional dish you'd recommend. 5 = average, nothing special. 1 = inedible." },
    { label: "Service", description: "Attentiveness, friendliness, and speed of staff.", weight: "25%", examples: "Were you greeted? Was water refilled? How long did you wait?", scoringTip: "10 = felt like a VIP. 5 = functional but forgettable. 1 = ignored or rude staff." },
    { label: "Vibe & Atmosphere", description: "Ambiance, cleanliness, noise level, and comfort.", weight: "25%", examples: "Was it clean? Good lighting? Comfortable seating?", scoringTip: "10 = perfect for the occasion. 5 = clean but generic. 1 = uncomfortable or dirty." },
  ],
  delivery: [
    { label: "Food Quality", description: "Taste, freshness, and temperature on arrival.", weight: "60%", examples: "Was the food still hot? Did flavors hold up during transit?", scoringTip: "10 = arrived hot, fresh, restaurant-quality. 5 = lukewarm but edible. 1 = cold or wrong order." },
    { label: "Packaging Quality", description: "How well the food was packaged for delivery.", weight: "25%", examples: "No spills? Containers sealed? Food separated properly?", scoringTip: "10 = no leaks, items separated, food intact. 5 = adequate but messy. 1 = spills, crushed food." },
    { label: "Value for Money", description: "Whether the portion size and quality justified the price.", weight: "15%", examples: "Fair portions? Worth the delivery premium?", scoringTip: "10 = great deal even with delivery fees. 5 = fair for what you got. 1 = overpriced." },
  ],
  takeaway: [
    { label: "Food Quality", description: "Taste, freshness, and temperature at pickup.", weight: "65%", examples: "Was the food ready and hot? Fresh ingredients?", scoringTip: "10 = hot, fresh, ready as expected. 5 = fine but not exciting. 1 = cold or stale." },
    { label: "Wait Time Accuracy", description: "Whether the estimated pickup time was accurate.", weight: "20%", examples: "Was it ready on time? Did you wait long?", scoringTip: "10 = ready when promised. 5 = 10-15 min late. 1 = 30+ min wait or not ready." },
    { label: "Value for Money", description: "Whether the portion size and quality justified the price.", weight: "15%", examples: "Fair portions? Good value compared to dine-in?", scoringTip: "10 = great value, saves time. 5 = fair price. 1 = overpriced for takeaway." },
  ],
};

export function getDimensionTooltips(visitType: VisitType | null): DimensionTooltipData[] {
  return DIMENSION_TOOLTIPS[visitType || "dine_in"];
}

/**
 * Sprint 439: DimensionTooltip — info icon that reveals dimension description.
 * Tap to toggle tooltip visibility. Shows description, weight, and examples.
 */
interface DimensionTooltipProps {
  tooltip: DimensionTooltipData;
  visible: boolean;
  onToggle: () => void;
}

export function DimensionTooltip({ tooltip, visible, onToggle }: DimensionTooltipProps) {
  return (
    <View>
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Info about ${tooltip.label}`}
        accessibilityHint="Double tap to show or hide dimension description"
      >
        <View style={s.tooltipTrigger}>
          <Ionicons name="information-circle-outline" size={16} color={visible ? BRAND.colors.amber : Colors.textTertiary} />
        </View>
      </TouchableOpacity>
      {visible && (
        <View style={s.tooltipCard}>
          <View style={s.tooltipWeightRow}>
            <Text style={s.tooltipWeight}>Weight: {tooltip.weight}</Text>
          </View>
          <Text style={s.tooltipDesc}>{tooltip.description}</Text>
          <Text style={s.tooltipExamples}>{tooltip.examples}</Text>
          {tooltip.scoringTip && (
            <Text style={s.tooltipScoringTip}>{tooltip.scoringTip}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center" as const,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
    marginBottom: 32,
    fontFamily: "DMSans_700Bold",
  },
  card: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: BRAND.colors.amber,
    backgroundColor: "rgba(196, 154, 26, 0.08)",
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  label: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  desc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: "DMSans_400Regular",
  },
  // Sprint 439: Dimension tooltip styles
  tooltipTrigger: {
    padding: 2,
  },
  tooltipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  tooltipWeightRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  tooltipWeight: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
  },
  tooltipDesc: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
    lineHeight: 18,
  },
  tooltipExamples: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    fontStyle: "italic" as const,
    lineHeight: 16,
  },
  // Sprint 468: Scoring tip style
  tooltipScoringTip: {
    fontSize: 10,
    color: BRAND.colors.amber,
    fontFamily: "DMSans_500Medium",
    lineHeight: 14,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(196,154,26,0.15)",
  },
});
