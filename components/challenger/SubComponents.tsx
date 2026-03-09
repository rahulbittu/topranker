import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, LayoutAnimation,
} from "react-native";
import ReAnimated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { fetchBusinessBySlug, type ApiChallenger, type ApiBusiness } from "@/lib/api";
import { formatTimeAgo, TIER_DISPLAY_NAMES, TIER_COLORS, RANK_CONFIDENCE_LABELS, getRankConfidence, type CredibilityTier } from "@/lib/data";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";
import { TYPOGRAPHY } from "@/constants/typography";
import * as Haptics from "expo-haptics";
import { ShareCardView } from "@/components/ShareCard";

// ─── VoteBar ────────────────────────────────────────────────────────────────

export function VoteBar({ challenger, defender }: { challenger: number; defender: number }) {
  const total = challenger + defender;
  const challengerPct = total > 0 ? (challenger / total) * 100 : 50;
  const defenderPct = 100 - challengerPct;
  const defenderLeading = defenderPct >= challengerPct;

  return (
    <View style={styles.voteBarContainer}>
      <View style={styles.voteBarLabels}>
        <Text style={[styles.voteBarPct, defenderLeading && styles.voteBarPctLeading]}>
          {defenderPct.toFixed(0)}%
        </Text>
        <Text style={[styles.voteBarPct, !defenderLeading && styles.voteBarPctLeading]}>
          {challengerPct.toFixed(0)}%
        </Text>
      </View>
      <View style={styles.voteBar}>
        <View style={[styles.voteBarDefender, { width: pct(defenderPct) }]} />
        <View style={[styles.voteBarChallenger, { width: pct(challengerPct) }]} />
      </View>
    </View>
  );
}

// ─── FighterPhoto ───────────────────────────────────────────────────────────

export const FighterPhoto = React.memo(function FighterPhoto({ biz, label, score }: { biz: ApiBusiness; label: string; score?: number }) {
  const [err, setErr] = useState(false);
  const photoUrl = biz.photoUrl || (biz.photoUrls && biz.photoUrls[0]);

  const overlay = (
    <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.fighterOverlay}>
      <View style={styles.fighterOverlayRow}>
        <View style={styles.fighterOverlayLeft}>
          <Text style={styles.fighterOverlayName} numberOfLines={2}>{biz.name}</Text>
          <Text style={styles.fighterOverlayLabel}>{label}</Text>
        </View>
        {score !== undefined && (
          <Text style={styles.fighterOverlayScore}>{score.toFixed(1)}</Text>
        )}
      </View>
    </LinearGradient>
  );

  if (photoUrl && !err) {
    return (
      <View style={styles.fighterPhotoWrap}>
        <Image
          source={{ uri: photoUrl }}
          style={styles.fighterPhoto}
          contentFit="cover"
          transition={200}
          onError={() => setErr(true)}
        />
        {overlay}
      </View>
    );
  }
  return (
    <View style={styles.fighterPhotoWrap}>
      <LinearGradient colors={[BRAND.colors.amber, BRAND.colors.amberDark]} style={styles.fighterPhoto}>
        <Text style={styles.fighterPhotoInitial}>{biz.name?.charAt(0) || "?"}</Text>
      </LinearGradient>
      {overlay}
    </View>
  );
});

// ─── FighterConfidence ──────────────────────────────────────────────────────

export function FighterConfidence({ totalRatings, category }: { totalRatings: number; category: string }) {
  const conf = getRankConfidence(totalRatings, category);
  if (conf === "strong" || conf === "established") return null;
  return <Text style={styles.fighterConfidence}>{RANK_CONFIDENCE_LABELS[conf].label}</Text>;
}

// ─── WinnerReveal ───────────────────────────────────────────────────────────

interface WinnerRevealProps {
  defenderVotes: number;
  challengerVotes: number;
  defenderName: string;
  challengerName: string;
  totalDays: number;
  category: string;
  city: string;
  cardRef: React.RefObject<any>;
  captureAndShare: () => void;
}

export function WinnerReveal({
  defenderVotes, challengerVotes, defenderName, challengerName,
  totalDays, category, city, cardRef, captureAndShare,
}: WinnerRevealProps) {
  const defenderWins = defenderVotes >= challengerVotes;
  const winnerName = defenderWins ? defenderName : challengerName;
  const loserName = defenderWins ? challengerName : defenderName;
  const winnerVotes = defenderWins ? defenderVotes : challengerVotes;
  const loserVotes = defenderWins ? challengerVotes : defenderVotes;
  const total = winnerVotes + loserVotes;
  const winPct = total > 0 ? ((winnerVotes / total) * 100).toFixed(0) : "50";
  const margin = (winnerVotes - loserVotes).toFixed(1);

  return (
    <ReAnimated.View entering={FadeInDown.delay(200).duration(600)} style={styles.winnerBanner}>
      <LinearGradient
        colors={[BRAND.colors.navy, BRAND.colors.navyDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.winnerGradient}
      >
        <ReAnimated.View entering={ZoomIn.delay(400).duration(500)}>
          <Text style={styles.winnerTrophy}>🏆</Text>
        </ReAnimated.View>
        <ReAnimated.Text entering={FadeInUp.delay(600).duration(400)} style={styles.winnerLabel}>WINNER</ReAnimated.Text>
        <ReAnimated.Text entering={FadeInUp.delay(700).duration(400)} style={styles.winnerName}>{winnerName}</ReAnimated.Text>
        <ReAnimated.View entering={FadeInUp.delay(800).duration(400)} style={styles.winnerStats}>
          <View style={styles.winnerStatItem}>
            <Text style={styles.winnerStatValue}>{winPct}%</Text>
            <Text style={styles.winnerStatLabel}>of votes</Text>
          </View>
          <View style={styles.winnerStatDivider} />
          <View style={styles.winnerStatItem}>
            <Text style={styles.winnerStatValue}>+{margin}</Text>
            <Text style={styles.winnerStatLabel}>vote margin</Text>
          </View>
          <View style={styles.winnerStatDivider} />
          <View style={styles.winnerStatItem}>
            <Text style={styles.winnerStatValue}>{totalDays}</Text>
            <Text style={styles.winnerStatLabel}>days</Text>
          </View>
        </ReAnimated.View>
        <ReAnimated.Text entering={FadeInUp.delay(900).duration(400)} style={styles.winnerDefeat}>
          defeated {loserName}
        </ReAnimated.Text>
        <ReAnimated.View entering={FadeInUp.delay(1000).duration(400)}>
          <TouchableOpacity
            style={styles.shareImageBtn}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              captureAndShare();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Share challenge result as image"
          >
            <Ionicons name="image-outline" size={16} color={BRAND.colors.amber} />
            <Text style={styles.shareImageBtnText}>Share as Image</Text>
          </TouchableOpacity>
        </ReAnimated.View>
      </LinearGradient>
      {/* Offscreen share card for image capture */}
      <ShareCardView
        cardRef={cardRef as any}
        winnerName={winnerName}
        loserName={loserName}
        winPct={winPct}
        margin={margin}
        totalDays={totalDays}
        category={category}
        city={city}
        isDefenderWin={defenderWins}
      />
    </ReAnimated.View>
  );
}

// ─── ReviewRow ──────────────────────────────────────────────────────────────

interface ReviewItem {
  id: string;
  userName: string;
  userTier: CredibilityTier;
  rawScore: number;
  businessName: string;
  comment: string | null;
  createdAt: number;
}

export const ReviewRow = React.memo(function ReviewRow({ review }: { review: ReviewItem }) {
  const tierColor = TIER_COLORS[review.userTier] || Colors.textTertiary;
  const tierName = TIER_DISPLAY_NAMES[review.userTier] || "New Member";
  const initial = review.userName.charAt(0).toUpperCase();

  let tierBadgeBg: string = Colors.textTertiary;
  if (review.userTier === "top") tierBadgeBg = TIER_COLORS.top;
  else if (review.userTier === "trusted") tierBadgeBg = TIER_COLORS.trusted;

  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewAvatar}>
        <Text style={styles.reviewAvatarText}>{initial}</Text>
      </View>
      <View style={styles.reviewInfo}>
        <View style={styles.reviewNameRow}>
          <Text style={styles.reviewName}>{review.userName}</Text>
          <View style={[styles.reviewTierBadge, { backgroundColor: `${tierBadgeBg}20`, borderColor: tierBadgeBg }]}>
            <Text style={[styles.reviewTierText, { color: tierBadgeBg }]}>{tierName.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.reviewVotedRow}>
          <Ionicons name="arrow-forward-circle" size={11} color={BRAND.colors.amber} />
          <Text style={styles.reviewBusinessName}>Voted for {review.businessName}</Text>
        </View>
        {review.comment ? (
          <Text style={styles.reviewComment} numberOfLines={3}>{review.comment}</Text>
        ) : null}
        <Text style={styles.reviewTime}>{formatTimeAgo(review.createdAt)}</Text>
      </View>
      <Text style={styles.reviewScore}>{review.rawScore.toFixed(1)}</Text>
    </View>
  );
});

// ─── CommunityReviews ───────────────────────────────────────────────────────

export function CommunityReviews({ challenge }: { challenge: ApiChallenger }) {
  const [expanded, setExpanded] = useState(true);

  const { data: defenderData } = useQuery({
    queryKey: ["business", challenge.defenderBusiness.slug],
    queryFn: () => fetchBusinessBySlug(challenge.defenderBusiness.slug),
    staleTime: 60000,
  });

  const { data: challengerData } = useQuery({
    queryKey: ["business", challenge.challengerBusiness.slug],
    queryFn: () => fetchBusinessBySlug(challenge.challengerBusiness.slug),
    staleTime: 60000,
  });

  const reviews: ReviewItem[] = [];

  if (defenderData?.ratings) {
    defenderData.ratings.slice(0, 5).forEach((r: any) => {
      reviews.push({
        id: r.id + "-d",
        userName: r.userName,
        userTier: r.userTier,
        rawScore: r.rawScore,
        businessName: challenge.defenderBusiness.name,
        comment: r.comment || null,
        createdAt: r.createdAt,
      });
    });
  }

  if (challengerData?.ratings) {
    challengerData.ratings.slice(0, 5).forEach((r: any) => {
      reviews.push({
        id: r.id + "-c",
        userName: r.userName,
        userTier: r.userTier,
        rawScore: r.rawScore,
        businessName: challenge.challengerBusiness.name,
        comment: r.comment || null,
        createdAt: r.createdAt,
      });
    });
  }

  reviews.sort((a, b) => b.createdAt - a.createdAt);
  const displayReviews = reviews.slice(0, 10);

  if (displayReviews.length === 0) return null;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.reviewsSection}>
      <TouchableOpacity
        style={styles.reviewsTitleRow}
        onPress={toggleExpanded}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse community reviews" : "Expand community reviews"}
      >
        <Ionicons name="chatbubbles-outline" size={14} color={BRAND.colors.amber} />
        <Text style={styles.reviewsSectionTitle}>COMMUNITY REVIEWS</Text>
        <Text style={styles.reviewsCount}>{displayReviews.length}</Text>
        <View style={styles.flexSpacer} />
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textTertiary} />
      </TouchableOpacity>
      {expanded && displayReviews.map(review => (
        <ReviewRow key={review.id} review={review} />
      ))}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // VoteBar
  voteBarContainer: { marginBottom: 12, gap: 6 },
  voteBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "row",
  },
  voteBarDefender: {
    height: "100%",
    backgroundColor: BRAND.colors.amber,
  },
  voteBarChallenger: {
    height: "100%",
    backgroundColor: BRAND.colors.navy,
  },
  voteBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  voteBarPct: {
    ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary,
  },
  voteBarPctLeading: {
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },

  // FighterPhoto
  fighterPhotoWrap: {
    width: pct(100),
    height: 130,
    borderRadius: 10,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  fighterPhoto: {
    width: pct(100),
    height: 130,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  fighterOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 28,
  },
  fighterOverlayRow: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    justifyContent: "space-between" as const,
  },
  fighterOverlayLeft: { flex: 1 },
  fighterOverlayName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.3,
  },
  fighterOverlayLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  fighterOverlayScore: {
    fontSize: 20,
    fontWeight: "900" as const,
    color: BRAND.colors.amber,
    fontFamily: "PlayfairDisplay_900Black",
    letterSpacing: -0.5,
  },
  fighterPhotoInitial: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
  },
  fighterConfidence: {
    fontSize: 9, color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold",
    marginTop: 2, textAlign: "center" as const,
  },

  // Winner reveal
  winnerBanner: { marginTop: 16 },
  winnerGradient: {
    borderRadius: 16, padding: 24, alignItems: "center" as const, gap: 6,
  },
  winnerTrophy: { fontSize: 44, marginBottom: 4 },
  winnerLabel: {
    fontSize: 11, fontWeight: "800" as const, color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold", letterSpacing: 3, textTransform: "uppercase" as const,
  },
  winnerName: {
    fontSize: 24, fontWeight: "900" as const, color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -0.5, textAlign: "center" as const,
  },
  winnerStats: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 16,
    marginTop: 12, marginBottom: 8,
  },
  winnerStatItem: { alignItems: "center" as const },
  winnerStatValue: {
    fontSize: 20, fontWeight: "800" as const, color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
  },
  winnerStatLabel: {
    ...TYPOGRAPHY.ui.small, color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  winnerStatDivider: {
    width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.15)",
  },
  winnerDefeat: {
    fontSize: 12, color: "rgba(255,255,255,0.5)",
    fontFamily: "DMSans_400Regular", fontStyle: "italic" as const,
  },
  shareImageBtn: {
    flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const,
    gap: 6, marginTop: 14, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1, borderColor: BRAND.colors.amber,
    backgroundColor: `${BRAND.colors.amber}15`,
  },
  shareImageBtnText: {
    fontSize: 12, fontWeight: "700" as const, color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.5,
  },

  // Community Reviews
  flexSpacer: { flex: 1 },
  reviewsSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  reviewsTitleRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingVertical: 4 },
  reviewsCount: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
    backgroundColor: `${BRAND.colors.amber}15`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: "hidden" as const,
  },
  reviewsSectionTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1,
  },
  reviewRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingVertical: 6,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND.colors.amber,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  reviewAvatarText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "DMSans_700Bold",
  },
  reviewInfo: {
    flex: 1,
    gap: 1,
  },
  reviewNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  reviewTierBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  reviewTierText: {
    fontSize: 8,
    fontWeight: "700" as const,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.5,
  },
  reviewVotedRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  reviewBusinessName: {
    fontSize: 11,
    color: BRAND.colors.amber,
    fontFamily: "DMSans_500Medium",
  },
  reviewComment: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    lineHeight: 17,
    marginTop: 2,
  },
  reviewTime: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary,
    marginTop: 1,
  },
  reviewScore: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
});
