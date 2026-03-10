import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  TIER_DISPLAY_NAMES, TIER_SCORE_RANGES,
  TIER_INFLUENCE_LABELS, type CredibilityTier,
} from "@/lib/data";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;

const JOURNEY_TIERS: CredibilityTier[] = ["community", "city", "trusted", "top"];

const TIER_ICONS: Record<CredibilityTier, React.ComponentProps<typeof Ionicons>["name"]> = {
  community: "person",
  city: "star",
  trusted: "shield-checkmark",
  top: "trophy",
};

const TIER_NEXT_HINTS: Record<CredibilityTier, string> = {
  community: "Rate a few more businesses to reach Regular status",
  city: "Keep rating consistently to earn Trusted status",
  trusted: "You're close to the top — maintain quality ratings",
  top: "You've reached the highest tier!",
};

interface CredibilityJourneyProps {
  currentTier: CredibilityTier;
  credibilityScore?: number;
  totalRatings?: number;
}

function getNextTierPerks(tier: CredibilityTier): string[] {
  switch (tier) {
    case "community": return ["Ratings carry more weight", "Unlock city-level badge"];
    case "city": return ["Your ratings influence leaderboard more", "Unlock trusted badge"];
    case "trusted": return ["Maximum rating influence", "Top Judge recognition"];
    case "top": return ["You have maximum influence on rankings"];
  }
}

function getMilestones(tier: CredibilityTier, score: number, totalRatings: number): string[] {
  const nextRange = TIER_SCORE_RANGES[
    tier === "community" ? "city" : tier === "city" ? "trusted" : tier === "trusted" ? "top" : "top"
  ];
  const pointsNeeded = Math.max(nextRange.min - score, 0);
  const milestones: string[] = [];
  if (tier !== "top" && pointsNeeded > 0) {
    milestones.push(`${pointsNeeded} points to next tier`);
  }
  if (totalRatings < 5) milestones.push("Rate 5 businesses to build credibility");
  else if (totalRatings < 15) milestones.push("Keep rating — consistency builds trust");
  if (tier === "top") milestones.push("Maintain quality to stay at the top");
  return milestones;
}

export function CredibilityJourney({ currentTier, credibilityScore, totalRatings }: CredibilityJourneyProps) {
  const currentIdx = JOURNEY_TIERS.indexOf(currentTier);
  const nextTier = currentIdx < 3 ? JOURNEY_TIERS[currentIdx + 1] : null;
  const currentRange = TIER_SCORE_RANGES[currentTier];
  const nextRange = nextTier ? TIER_SCORE_RANGES[nextTier] : null;
  const progressPct = (credibilityScore != null && nextRange)
    ? Math.min(((credibilityScore - currentRange.min) / (nextRange.min - currentRange.min)) * 100, 100)
    : (currentTier === "top" ? 100 : 0);
  const milestones = (credibilityScore != null && totalRatings != null)
    ? getMilestones(currentTier, credibilityScore, totalRatings) : [];
  const nextPerks = nextTier ? getNextTierPerks(currentTier) : [];

  return (
    <View style={s.journeySection}>
      <Text style={s.journeySectionTitle}>Credibility Journey</Text>

      {/* Horizontal stepper */}
      <View style={s.journeyCard}>
        <View style={s.stepperRow}>
          {JOURNEY_TIERS.map((t, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;

            return (
              <React.Fragment key={t}>
                {/* Connector line before (skip first) */}
                {idx > 0 && (
                  <View style={[
                    s.stepperLine,
                    { backgroundColor: idx <= currentIdx ? AMBER : Colors.border },
                    idx <= currentIdx && { opacity: 1 },
                  ]} />
                )}

                {/* Step circle + label */}
                <View style={s.stepperStep}>
                  <View style={[
                    s.stepperCircle,
                    isCurrent && s.stepperCircleCurrent,
                    isCompleted && s.stepperCircleCompleted,
                    isFuture && s.stepperCircleFuture,
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    ) : (
                      <Ionicons
                        name={TIER_ICONS[t]}
                        size={isCurrent ? 16 : 12}
                        color={isCurrent ? "#fff" : isFuture ? Colors.textTertiary : "#fff"}
                      />
                    )}
                  </View>
                  <Text style={[
                    s.stepperLabel,
                    isCurrent && s.stepperLabelCurrent,
                    isCompleted && s.stepperLabelCompleted,
                    isFuture && s.stepperLabelFuture,
                  ]} numberOfLines={1}>
                    {TIER_DISPLAY_NAMES[t]}
                  </Text>
                  <Text style={[
                    s.stepperRange,
                    isCurrent && { color: AMBER },
                  ]}>
                    {TIER_SCORE_RANGES[t].min}+
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Current tier detail card */}
        <View style={s.journeyDetailCard}>
          <View style={s.journeyDetailTop}>
            <View style={[s.journeyDetailIcon, { backgroundColor: `${AMBER}18` }]}>
              <Ionicons name={TIER_ICONS[currentTier]} size={20} color={AMBER} />
            </View>
            <View style={s.journeyDetailInfo}>
              <Text style={s.journeyDetailTierName}>
                {TIER_DISPLAY_NAMES[currentTier]}
              </Text>
              <Text style={s.journeyDetailInfluence}>
                {TIER_INFLUENCE_LABELS[currentTier]}
              </Text>
            </View>
            <View style={s.journeyYouBadge}>
              <Text style={s.journeyYouBadgeText}>CURRENT</Text>
            </View>
          </View>

          {/* Next tier hint */}
          <View style={s.journeyHintRow}>
            <Ionicons
              name={currentTier === "top" ? "checkmark-circle" : "arrow-forward-circle"}
              size={16}
              color={currentTier === "top" ? Colors.green : AMBER}
            />
            <Text style={s.journeyHintText}>
              {TIER_NEXT_HINTS[currentTier]}
            </Text>
          </View>
        </View>

        {/* Sprint 414: Progress bar toward next tier */}
        {nextTier && credibilityScore != null && (
          <View style={s.progressSection}>
            <View style={s.progressHeader}>
              <Text style={s.progressLabel}>Progress to {TIER_DISPLAY_NAMES[nextTier]}</Text>
              <Text style={s.progressPct}>{Math.round(progressPct)}%</Text>
            </View>
            <View style={s.progressBarBg}>
              <View style={[s.progressBarFill, { width: pct(progressPct) }]} />
            </View>
          </View>
        )}

        {/* Sprint 414: Milestones */}
        {milestones.length > 0 && (
          <View style={s.milestonesSection}>
            <Text style={s.milestonesTitle}>Milestones</Text>
            {milestones.map((m, i) => (
              <View key={i} style={s.milestoneRow}>
                <Ionicons name="flag-outline" size={12} color={AMBER} />
                <Text style={s.milestoneText}>{m}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Sprint 414: Next tier perks preview */}
        {nextPerks.length > 0 && (
          <View style={s.perksSection}>
            <Text style={s.perksTitle}>Unlock at {TIER_DISPLAY_NAMES[nextTier!]}</Text>
            {nextPerks.map((p, i) => (
              <View key={i} style={s.perkRow}>
                <Ionicons name="star" size={10} color={AMBER} />
                <Text style={s.perkText}>{p}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  journeySection: { gap: 10, marginTop: 8 },
  journeySectionTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  journeyCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 20, gap: 18, ...Colors.cardShadow,
  },
  stepperRow: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "center", paddingHorizontal: 4,
  },
  stepperStep: {
    alignItems: "center", gap: 6, width: 68,
  },
  stepperCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.border,
  },
  stepperCircleCurrent: {
    backgroundColor: AMBER, width: 40, height: 40, borderRadius: 20,
    shadowColor: AMBER, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  stepperCircleCompleted: {
    backgroundColor: Colors.green,
  },
  stepperCircleFuture: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 2, borderColor: Colors.border,
  },
  stepperLine: {
    height: 3, flex: 1, borderRadius: 1.5,
    marginTop: 18, marginHorizontal: -2,
    backgroundColor: Colors.border,
  },
  stepperLabel: {
    fontSize: 10, color: Colors.textTertiary,
    fontFamily: "DMSans_500Medium", textAlign: "center",
  },
  stepperLabelCurrent: {
    fontSize: 11, color: AMBER, fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
  stepperLabelCompleted: {
    color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  stepperLabelFuture: {
    color: Colors.textTertiary,
  },
  stepperRange: {
    fontSize: 9, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  journeyDetailCard: {
    backgroundColor: `${AMBER}08`, borderRadius: 12,
    padding: 14, gap: 12,
    borderWidth: 1, borderColor: `${AMBER}20`,
  },
  journeyDetailTop: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  journeyDetailIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  journeyDetailInfo: { flex: 1, gap: 2 },
  journeyDetailTierName: {
    fontSize: 18, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.3,
  },
  journeyDetailInfluence: {
    fontSize: 12, color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
  journeyYouBadge: {
    backgroundColor: `${AMBER}20`, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: `${AMBER}40`,
  },
  journeyYouBadgeText: {
    fontSize: 9, fontWeight: "700", color: AMBER,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.8,
  },
  journeyHintRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingTop: 2,
  },
  journeyHintText: {
    fontSize: 12, color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium", flex: 1, lineHeight: 17,
  },
  // Sprint 414: Progress bar
  progressSection: { gap: 6 },
  progressHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  progressLabel: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  progressPct: {
    fontSize: 11, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
  progressBarBg: {
    height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: "hidden" as const,
  },
  progressBarFill: {
    height: 6, borderRadius: 3, backgroundColor: AMBER,
  },
  // Sprint 414: Milestones
  milestonesSection: { gap: 6 },
  milestonesTitle: {
    fontSize: 11, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", letterSpacing: 0.5,
  },
  milestoneRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  milestoneText: {
    fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular",
  },
  // Sprint 414: Perks preview
  perksSection: {
    gap: 4, backgroundColor: `${AMBER}08`, borderRadius: 8,
    padding: 10, borderWidth: 1, borderColor: `${AMBER}15`,
  },
  perksTitle: {
    fontSize: 10, fontWeight: "700", color: AMBER,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.5, marginBottom: 2,
  },
  perkRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  perkText: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
});
