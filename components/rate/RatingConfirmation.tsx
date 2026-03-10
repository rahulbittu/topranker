/**
 * Sprint 449: Extracted from rate/SubComponents.tsx
 * Rating confirmation screen with rank change, verification boosts,
 * tier progress, and share CTA.
 */
import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { pct as pctDim } from "@/lib/style-helpers";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
import Animated, {
  useAnimatedStyle, FadeInDown, FadeInUp,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_SCORE_RANGES,
  TIER_INFLUENCE_LABELS,
  type CredibilityTier,
} from "@/lib/data";
import { searchCategories, getBestInTitle } from "@/shared/best-in-categories";
import { getShareUrl, getShareText } from "@/lib/sharing";

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
  dishContext,
  rankStyle,
  tierBarStyle,
  onDone,
  hasPhoto,
  hasDish,
  hasReceipt,
  timeOnPageMs,
  businessSlug,
  onRateAnother,
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
  dishContext?: string;
  onDone: () => void;
  hasPhoto?: boolean;
  hasDish?: boolean;
  hasReceipt?: boolean;
  timeOnPageMs?: number;
  businessSlug?: string;
  onRateAnother?: () => void;
}) {
  // Sprint 398: Compute verification boosts earned
  const boosts: { label: string; pct: string; icon: string }[] = [];
  if (hasPhoto) boosts.push({ label: "Photo attached", pct: "+15%", icon: "camera" });
  if (hasDish) boosts.push({ label: "Dish specified", pct: "+5%", icon: "restaurant" });
  if (hasReceipt) boosts.push({ label: "Receipt uploaded", pct: "+25%", icon: "receipt" });
  if (timeOnPageMs && timeOnPageMs >= 30000) boosts.push({ label: "Time plausibility", pct: "+5%", icon: "time" });
  const totalBoostPct = boosts.reduce((sum, b) => sum + parseInt(b.pct), 0);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = businessSlug ? getShareUrl("business", businessSlug) : "https://topranker.com";
    const text = getShareText(business.name, rawScore);
    try {
      await Share.share(
        Platform.OS === "ios" ? { url, message: text } : { message: `${text}\n${url}` },
      );
    } catch {
      // User cancelled share
    }
  };

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
        {dishContext && (
          <View style={s.dishRankBanner}>
            <Text style={s.dishRankText}>
              This also updates the <Text style={{ fontWeight: "700" }}>{dishContext}</Text> ranking
            </Text>
          </View>
        )}
        {(() => {
          const ctx = dishContext || business.name;
          const matches = searchCategories(ctx);
          if (matches.length === 0) return null;
          const bestInTitle = getBestInTitle(matches[0].slug);
          return (
            <View style={s.bestInRankBanner}>
              <Text style={s.bestInRankText}>
                Your rating is helping rank{" "}
                <Text style={{ fontWeight: "700", color: Colors.gold }}>{bestInTitle}</Text>
              </Text>
            </View>
          );
        })()}
      </Animated.View>

      {/* Sprint 398: Verification boost breakdown */}
      {boosts.length > 0 && (
        <Animated.View entering={FadeInUp.delay(550).duration(500)} style={s.verificationBoostCard}>
          <View style={s.boostHeader}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.green} />
            <Text style={s.boostHeaderText}>Verification Boosts Earned</Text>
            <Text style={s.boostTotalPct}>+{Math.min(totalBoostPct, 50)}%</Text>
          </View>
          {boosts.map((b) => (
            <View key={b.label} style={s.boostRow}>
              <Ionicons name={b.icon as IoniconsName} size={14} color={Colors.textSecondary} />
              <Text style={s.boostLabel}>{b.label}</Text>
              <Text style={s.boostPct}>{b.pct}</Text>
            </View>
          ))}
          {totalBoostPct >= 50 && (
            <Text style={s.boostCapNote}>Capped at 50% maximum boost</Text>
          )}
        </Animated.View>
      )}

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

      {/* Sprint 398: Share + Rate another CTAs */}
      <Animated.View entering={FadeInUp.delay(800).duration(400)} style={s.confirmActions}>
        <TouchableOpacity
          style={s.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Share your rating"
        >
          <Ionicons name="share-outline" size={18} color={Colors.text} />
          <Text style={s.shareButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.doneButton, { flex: 1 }]}
          onPress={onDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Done, go back to business"
        >
          <Text style={s.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>

      {onRateAnother && (
        <Animated.View entering={FadeInUp.delay(900).duration(400)}>
          <TouchableOpacity
            style={s.rateAnotherBtn}
            onPress={onRateAnother}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Rate another place"
          >
            <Ionicons name="add-circle-outline" size={16} color={Colors.gold} />
            <Text style={s.rateAnotherText}>Rate another place</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
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
  dishRankBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(196,154,26,0.08)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    marginTop: -4,
  },
  dishRankText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  bestInRankBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(196,154,26,0.06)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  bestInRankText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  verificationBoostCard: {
    width: "100%", backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, gap: 6, ...Colors.cardShadow,
  },
  boostHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  boostHeaderText: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
    flex: 1,
  },
  boostTotalPct: {
    fontSize: 14, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold",
  },
  boostRow: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 22,
  },
  boostLabel: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", flex: 1,
  },
  boostPct: {
    fontSize: 12, fontWeight: "600", color: Colors.green, fontFamily: "DMSans_600SemiBold",
  },
  boostCapNote: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginTop: 2,
  },
  confirmActions: {
    flexDirection: "row", width: "100%", gap: 10, marginTop: 4,
  },
  shareButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14,
    backgroundColor: Colors.surfaceRaised, borderWidth: 1, borderColor: Colors.border,
  },
  shareButtonText: {
    fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  rateAnotherBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10,
  },
  rateAnotherText: {
    fontSize: 13, color: Colors.gold, fontFamily: "DMSans_600SemiBold",
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
