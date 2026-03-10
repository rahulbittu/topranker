/**
 * Sprint 411: Extracted visit type selection step from rate/[id].tsx.
 * Step 0 of the rating flow: user selects dine-in, delivery, or takeaway.
 * Visit type determines dimension labels (Rating Integrity Phase 1a).
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
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
});
