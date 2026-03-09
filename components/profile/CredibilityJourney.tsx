import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  TIER_DISPLAY_NAMES, TIER_SCORE_RANGES,
  TIER_INFLUENCE_LABELS, type CredibilityTier,
} from "@/lib/data";

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

export function CredibilityJourney({ currentTier }: { currentTier: CredibilityTier }) {
  const currentIdx = JOURNEY_TIERS.indexOf(currentTier);

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
});
