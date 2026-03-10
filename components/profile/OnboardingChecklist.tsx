/**
 * Sprint 185: Onboarding checklist card for new users.
 * Shows progress through key milestones — dismissible once all steps complete.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct as pctDim } from "@/lib/style-helpers";
import { useQuery } from "@tanstack/react-query";
import { fetchOnboardingProgress, type OnboardingStep } from "@/lib/api";

const AMBER = BRAND.colors.amber;

function StepRow({ step }: { step: OnboardingStep }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepIcon, step.completed && styles.stepIconComplete]}>
        {step.completed ? (
          <Ionicons name="checkmark" size={12} color="#fff" />
        ) : (
          <View style={styles.stepDot} />
        )}
      </View>
      <View style={styles.stepInfo}>
        <Text style={[styles.stepLabel, step.completed && styles.stepLabelComplete]}>{step.label}</Text>
        {step.detail && <Text style={styles.stepDetail}>{step.detail}</Text>}
      </View>
    </View>
  );
}

export function OnboardingChecklist() {
  const { data: progress } = useQuery({
    queryKey: ["onboarding-progress"],
    queryFn: fetchOnboardingProgress,
    staleTime: 60000,
  });

  if (!progress || progress.completedCount === progress.totalSteps) return null;

  const pct = Math.round((progress.completedCount / progress.totalSteps) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="rocket-outline" size={18} color={AMBER} />
        <Text style={styles.title}>Getting Started</Text>
        <Text style={styles.progress}>{progress.completedCount}/{progress.totalSteps}</Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: pctDim(pct) }]} />
      </View>

      {progress.steps.map((step) => (
        <StepRow key={step.key} step={step} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Colors.cardShadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  progress: {
    fontSize: 13,
    fontWeight: "600",
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: AMBER,
    borderRadius: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  stepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconComplete: {
    backgroundColor: AMBER,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  stepInfo: {
    flex: 1,
    gap: 1,
  },
  stepLabel: {
    ...TYPOGRAPHY.ui.body,
    fontSize: 13,
    color: Colors.text,
  },
  stepLabelComplete: {
    color: Colors.textSecondary,
  },
  stepDetail: {
    ...TYPOGRAPHY.ui.caption,
    fontSize: 11,
    color: Colors.textTertiary,
  },
});
