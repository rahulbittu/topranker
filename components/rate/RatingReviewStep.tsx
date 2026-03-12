/**
 * Sprint 531: Rating review step — summary before submission.
 * Step 3 of the rating flow: user reviews all selections before confirming.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TIER_INFLUENCE_LABELS, type CredibilityTier } from "@/lib/data";
import { getDimensionLabels, type VisitType } from "@/components/rate/VisitTypeStep";

const VISIT_LABELS: Record<VisitType, { icon: string; label: string }> = {
  dine_in: { icon: "🍽️", label: "Dined In" },
  delivery: { icon: "🛵", label: "Delivery" },
  takeaway: { icon: "📦", label: "Takeaway" },
};

interface RatingReviewStepProps {
  businessName: string;
  visitType: VisitType;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean | null;
  rawScore: number;
  weightedScore: number;
  voteWeight: number;
  userTier: CredibilityTier;
  tierColor: string;
  selectedDish: string;
  dishInput: string;
  note: string;
  photoUris: string[];
  receiptUri: string | null;
  onEditStep: (step: number) => void;
}

export function RatingReviewStep({
  businessName,
  visitType,
  q1Score, q2Score, q3Score,
  wouldReturn,
  rawScore,
  weightedScore,
  voteWeight,
  userTier,
  tierColor,
  selectedDish,
  dishInput,
  note,
  photoUris,
  receiptUri,
  onEditStep,
}: RatingReviewStepProps) {
  const { q1Label, q2Label, q3Label } = getDimensionLabels(visitType);
  const visit = VISIT_LABELS[visitType];
  const dishDisplay = selectedDish || dishInput.trim();
  const hasPhotos = photoUris.length > 0;
  const hasReceipt = !!receiptUri;
  const hasNote = note.trim().length > 0;

  // Compute verification boost preview
  const boosts: string[] = [];
  if (hasPhotos) boosts.push("Photo +15%");
  if (dishDisplay) boosts.push("Dish +5%");
  if (hasReceipt) boosts.push("Receipt +25%");

  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.container} key="step3-review">
      <View style={s.header} accessible accessibilityRole="header">
        <Text style={s.title} accessibilityRole="header">Review Your Rating</Text>
        <Text style={s.subtitle}>Confirm everything looks right before submitting</Text>
      </View>

      {/* Visit Type */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>VISIT TYPE</Text>
          <TouchableOpacity onPress={() => onEditStep(0)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Edit visit type">
            <Text style={s.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={s.visitRow}>
          <Text style={s.visitIcon}>{visit.icon}</Text>
          <Text style={s.visitLabel}>{visit.label}</Text>
        </View>
      </View>

      {/* Scores */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>SCORES</Text>
          <TouchableOpacity onPress={() => onEditStep(1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Edit scores">
            <Text style={s.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={s.scoresGrid}>
          <View style={s.scoreItem}>
            <Text style={s.scoreValue}>{q1Score}</Text>
            <Text style={s.scoreLabel}>{q1Label}</Text>
          </View>
          <View style={s.scoreItem}>
            <Text style={s.scoreValue}>{q2Score}</Text>
            <Text style={s.scoreLabel}>{q2Label}</Text>
          </View>
          <View style={s.scoreItem}>
            <Text style={s.scoreValue}>{q3Score}</Text>
            <Text style={s.scoreLabel}>{q3Label}</Text>
          </View>
          <View style={s.scoreItem}>
            <Ionicons
              name={wouldReturn ? "checkmark-circle" : "close-circle"}
              size={22}
              color={wouldReturn ? Colors.green : Colors.red}
            />
            <Text style={s.scoreLabel}>Return</Text>
          </View>
        </View>
      </View>

      {/* Composite Score */}
      <View style={s.compositeCard}>
        <View style={s.compositeRow}>
          <View>
            <Text style={s.compositeLabel}>YOUR SCORE</Text>
            <Text style={s.compositeValue}>{rawScore.toFixed(1)}</Text>
          </View>
          <View style={s.compositeDivider} />
          <View>
            <Text style={s.compositeLabel}>WEIGHTED</Text>
            <View style={s.weightedRow}>
              <View style={[s.tierDot, { backgroundColor: tierColor }]} />
              <Text style={s.compositeWeighted}>{weightedScore.toFixed(1)}</Text>
            </View>
          </View>
          <View style={s.compositeDivider} />
          <View>
            <Text style={s.compositeLabel}>WEIGHT</Text>
            <Text style={s.compositeMultiplier}>×{voteWeight}</Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>DETAILS</Text>
          <TouchableOpacity onPress={() => onEditStep(2)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Edit details">
            <Text style={s.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        {dishDisplay ? (
          <View style={s.detailRow}>
            <Ionicons name="restaurant" size={14} color={Colors.gold} />
            <Text style={s.detailText}>{dishDisplay}</Text>
          </View>
        ) : (
          <View style={s.detailRow}>
            <Ionicons name="restaurant-outline" size={14} color={Colors.textTertiary} />
            <Text style={s.detailMuted}>No dish selected</Text>
          </View>
        )}

        {hasNote ? (
          <View style={s.notePreview}>
            <Ionicons name="chatbubble" size={14} color={Colors.textSecondary} />
            <Text style={s.noteText} numberOfLines={2}>{note}</Text>
          </View>
        ) : (
          <View style={s.detailRow}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.textTertiary} />
            <Text style={s.detailMuted}>No note</Text>
          </View>
        )}

        {hasPhotos ? (
          <View style={s.photoRow}>
            {photoUris.map((uri, idx) => (
              <View key={uri} style={s.photoThumb}>
                <Image source={{ uri }} style={s.photoThumbImg} contentFit="cover" />
                <View style={s.photoIndex}>
                  <Text style={s.photoIndexText}>{idx + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.detailRow}>
            <Ionicons name="camera-outline" size={14} color={Colors.textTertiary} />
            <Text style={s.detailMuted}>No photos</Text>
          </View>
        )}

        {hasReceipt && (
          <View style={s.detailRow}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.green} />
            <Text style={s.detailVerified}>Receipt attached</Text>
          </View>
        )}
      </View>

      {/* Boost Preview */}
      {boosts.length > 0 && (
        <View style={s.boostPreview}>
          <Ionicons name="trending-up" size={14} color={Colors.gold} />
          <Text style={s.boostText}>
            Verification boosts: {boosts.join(" · ")}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { gap: 16 },
  header: { gap: 4 },
  title: {
    fontSize: 22, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  section: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    ...Colors.cardShadow,
  },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1.5,
  },
  editBtn: {
    fontSize: 13, color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold",
  },
  visitRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  visitIcon: { fontSize: 20 },
  visitLabel: {
    fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  scoresGrid: {
    flexDirection: "row", justifyContent: "space-around",
  },
  scoreItem: { alignItems: "center", gap: 4 },
  scoreValue: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  scoreLabel: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  compositeCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
    ...Colors.cardShadow,
  },
  compositeRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
  },
  compositeLabel: {
    fontSize: 9, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", letterSpacing: 1, textAlign: "center",
  },
  compositeValue: {
    fontSize: 28, fontWeight: "700", color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold", textAlign: "center",
  },
  compositeDivider: {
    width: 1, height: 32, backgroundColor: Colors.border,
  },
  weightedRow: {
    flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "center",
  },
  compositeWeighted: {
    fontSize: 22, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  compositeMultiplier: {
    fontSize: 18, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", textAlign: "center",
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  detailRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  detailText: {
    fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium",
  },
  detailMuted: {
    fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  detailVerified: {
    fontSize: 13, color: Colors.green, fontFamily: "DMSans_600SemiBold",
  },
  notePreview: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: Colors.surfaceRaised, borderRadius: 10, padding: 10,
  },
  noteText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular",
    flex: 1, lineHeight: 18,
  },
  photoRow: {
    flexDirection: "row", gap: 8,
  },
  photoThumb: {
    width: 56, height: 56, borderRadius: 8, overflow: "hidden",
    position: "relative" as const,
  },
  photoThumbImg: { width: 56, height: 56, borderRadius: 8 },
  photoIndex: {
    position: "absolute" as const, bottom: 2, left: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center" as const, justifyContent: "center" as const,
  },
  photoIndexText: { fontSize: 9, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  boostPreview: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(196,154,26,0.08)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  boostText: {
    fontSize: 12, color: Colors.gold, fontFamily: "DMSans_500Medium",
  },
});
