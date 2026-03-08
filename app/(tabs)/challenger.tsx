import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Animated as RNAnimated, Share,
  Platform, TouchableOpacity, RefreshControl, LayoutAnimation, UIManager,
} from "react-native";
import ReAnimated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { fetchActiveChallenges, fetchBusinessBySlug, type ApiChallenger } from "@/lib/api";
import { formatCountdown, formatTimeAgo, TIER_DISPLAY_NAMES, TIER_COLORS, type CredibilityTier } from "@/lib/data";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import * as Haptics from "expo-haptics";
import { ShareCardView, useShareCard } from "@/components/ShareCard";
import { ChallengerSkeleton } from "@/components/Skeleton";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { useCity } from "@/lib/city-context";

function VoteBar({ challenger, defender }: { challenger: number; defender: number }) {
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
        <View style={[styles.voteBarDefender, { width: `${defenderPct}%` as any }]} />
        <View style={[styles.voteBarChallenger, { width: `${challengerPct}%` as any }]} />
      </View>
    </View>
  );
}

interface ReviewItem {
  id: string;
  userName: string;
  userTier: CredibilityTier;
  rawScore: number;
  businessName: string;
  createdAt: number;
}

const ReviewRow = React.memo(function ReviewRow({ review }: { review: ReviewItem }) {
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
        <Text style={styles.reviewBusinessName}>{review.businessName}</Text>
        <Text style={styles.reviewTime}>{formatTimeAgo(review.createdAt)}</Text>
      </View>
      <Text style={styles.reviewScore}>{review.rawScore.toFixed(1)}</Text>
    </View>
  );
});

function CommunityReviews({ challenge }: { challenge: ApiChallenger }) {
  const [expanded, setExpanded] = useState(false);

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

const FighterPhoto = React.memo(function FighterPhoto({ biz, label, score }: { biz: any; label: string; score?: number }) {
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

function ChallengeCard({ challenge }: { challenge: ApiChallenger }) {
  const { scale, onPressIn, onPressOut } = usePressAnimation();
  const { cardRef, captureAndShare } = useShareCard();
  const [, setTick] = useState(0);
  const endTs = new Date(challenge.endDate).getTime();
  const startTs = new Date(challenge.startDate).getTime();
  const countdown = formatCountdown(endTs);

  useEffect(() => {
    if (countdown.ended) return;
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, [countdown.ended]);

  const challengerVotes = parseFloat(challenge.challengerWeightedVotes);
  const defenderVotes = parseFloat(challenge.defenderWeightedVotes);

  const daysElapsed = Math.floor((Date.now() - startTs) / 86400000);
  const totalDays = Math.floor((endTs - startTs) / 86400000);

  const catDisplay = getCategoryDisplay(challenge.category);

  const shareChallenge = async () => {
    const defender = challenge.defenderBusiness.name;
    const challenger = challenge.challengerBusiness.name;
    const total = defenderVotes + challengerVotes;
    const defPct = total > 0 ? ((defenderVotes / total) * 100).toFixed(0) : "50";
    const chPct = total > 0 ? ((challengerVotes / total) * 100).toFixed(0) : "50";
    try {
      await Share.share({
        message: `${catDisplay.emoji} ${catDisplay.label} Challenge in ${challenge.city}\n\n${defender} (${defPct}%) vs ${challenger} (${chPct}%)\n\n${defenderVotes.toFixed(1)} vs ${challengerVotes.toFixed(1)} weighted votes\n${countdown.ended ? "Challenge ended!" : `${countdown.days}d ${countdown.hours}h remaining`}\n\nVote now on TopRanker!`,
      });
    } catch {}
  };

  return (
    <RNAnimated.View style={[styles.card, { transform: [{ scale }] }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.catText}>{catDisplay.emoji} {catDisplay.label.toUpperCase()}</Text>
        <Text style={styles.cityText}>{challenge.city}</Text>
      </View>

      <View style={styles.fightCard}>
        <TouchableOpacity
          style={styles.fighter}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: challenge.defenderBusiness.slug } })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View ${challenge.defenderBusiness.name}, defending number 1`}
        >
          <FighterPhoto biz={challenge.defenderBusiness} label="DEFENDING #1" score={parseFloat(challenge.defenderBusiness.weightedScore as any) || 0} />
          <Text style={styles.voteCount}>{defenderVotes.toLocaleString()}</Text>
          <Text style={styles.voteLabel}>weighted votes</Text>
        </TouchableOpacity>

        <View style={styles.vsContainer}>
          <View style={styles.vsDivider} />
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.vsDivider} />
        </View>

        <TouchableOpacity
          style={styles.fighter}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: challenge.challengerBusiness.slug } })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View ${challenge.challengerBusiness.name}, challenger`}
        >
          <FighterPhoto biz={challenge.challengerBusiness} label="CHALLENGER" score={parseFloat(challenge.challengerBusiness.weightedScore as any) || 0} />
          <Text style={styles.voteCount}>{challengerVotes.toLocaleString()}</Text>
          <Text style={styles.voteLabel}>weighted votes</Text>
        </TouchableOpacity>
      </View>

      <VoteBar challenger={challengerVotes} defender={defenderVotes} />

      <View style={styles.timerSection}>
        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.timerText}>
          {countdown.ended ? "Ended" : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m remaining`}
        </Text>
        <Text style={styles.progressText}>Day {daysElapsed}/{totalDays}</Text>
      </View>

      <View style={styles.progressBarOuter}>
        <View style={[styles.progressBarInner, { width: `${Math.min((daysElapsed / totalDays) * 100, 100)}%` as any }]} />
      </View>

      {/* Winner Reveal */}
      {countdown.ended && (() => {
        const defenderWins = defenderVotes >= challengerVotes;
        const winnerName = defenderWins ? challenge.defenderBusiness.name : challenge.challengerBusiness.name;
        const loserName = defenderWins ? challenge.challengerBusiness.name : challenge.defenderBusiness.name;
        const winnerVotes = defenderWins ? defenderVotes : challengerVotes;
        const loserVotes = defenderWins ? challengerVotes : defenderVotes;
        const total = winnerVotes + loserVotes;
        const winPct = total > 0 ? ((winnerVotes / total) * 100).toFixed(0) : "50";
        const margin = (winnerVotes - loserVotes).toFixed(1);

        return (
          <ReAnimated.View entering={FadeInDown.delay(200).duration(600)} style={styles.winnerBanner}>
            <LinearGradient
              colors={[BRAND.colors.navy, "#162940"]}
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
              category={challenge.category}
              city={challenge.city}
              isDefenderWin={defenderWins}
            />
          </ReAnimated.View>
        );
      })()}

      <View style={styles.voteCta}>
        <Text style={styles.voteCtaText}>Rate either business to cast your weighted vote</Text>
      </View>

      <TouchableOpacity
        style={styles.shareBtn}
        onPress={shareChallenge}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Share this challenge"
      >
        <Ionicons name="share-outline" size={16} color={BRAND.colors.amber} />
        <Text style={styles.shareBtnText}>Share Challenge</Text>
      </TouchableOpacity>

      <CommunityReviews challenge={challenge} />
    </RNAnimated.View>
  );
}

export default function ChallengerScreen() {
  const insets = useSafeAreaInsets();
  const { city } = useCity();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const { data: challenges = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["challengers", city],
    queryFn: () => fetchActiveChallenges(city),
    staleTime: 30000,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Challenges</Text>
      </View>
      <Text style={styles.headerSub}>
        30-day head-to-head competitions. Weighted votes decide the winner.
      </Text>

      {isLoading ? (
        <ChallengerSkeleton />
      ) : isError ? (
        <View style={styles.errorState}>
          <Ionicons name="cloud-offline-outline" size={36} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Couldn't load challenges</Text>
          <Text style={styles.errorSubtext}>Check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Retry loading challenges">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.colors.amber} />
          }
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
        >
          {challenges.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flash-outline" size={32} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No active challenges</Text>
              <Text style={styles.emptySubtext}>Check back soon for new head-to-head matchups</Text>
            </View>
          ) : (
            challenges.map((ch: ApiChallenger) => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 2,
  },
  content: { paddingHorizontal: 16, gap: 16 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  errorState: { alignItems: "center", paddingTop: 60, gap: 8 },
  errorText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  errorSubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 20,
  },
  retryText: { fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold" },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Colors.cardShadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  catText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 1,
  },
  cityText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  fightCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  fighter: { flex: 1, alignItems: "center" as const, gap: 4 },
  fighterPhotoWrap: {
    width: "100%" as any,
    height: 130,
    borderRadius: 10,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  fighterPhoto: {
    width: "100%" as any,
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
  voteCount: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -1,
    marginTop: 4,
  },
  voteLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  vsContainer: { alignItems: "center", width: 40 },
  vsDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  vsText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    marginVertical: 4,
  },
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
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  voteBarPctLeading: {
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  timerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
    flex: 1,
  },
  progressText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  progressBarOuter: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  voteCta: {
    marginTop: 12, alignItems: "center", paddingVertical: 8,
    backgroundColor: Colors.goldFaint, borderRadius: 8,
  },
  voteCtaText: {
    fontSize: 11, color: Colors.gold, fontFamily: "DMSans_500Medium",
  },
  shareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 8, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: BRAND.colors.amber,
  },
  shareBtnText: {
    fontSize: 12, fontWeight: "600", color: BRAND.colors.amber,
    fontFamily: "DMSans_600SemiBold",
  },

  // Community Reviews section
  flexSpacer: { flex: 1 },
  reviewsSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  reviewsTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  reviewsCount: {
    fontSize: 10,
    fontWeight: "700",
    color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
    backgroundColor: `${BRAND.colors.amber}15`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  reviewsSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND.colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "DMSans_700Bold",
  },
  reviewInfo: {
    flex: 1,
    gap: 1,
  },
  reviewNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: "600",
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
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.5,
  },
  reviewBusinessName: {
    fontSize: 11,
    color: BRAND.colors.amber,
    fontFamily: "DMSans_500Medium",
  },
  reviewTime: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  reviewScore: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },

  // Winner reveal
  winnerBanner: { marginTop: 16 },
  winnerGradient: {
    borderRadius: 16, padding: 24, alignItems: "center", gap: 6,
  },
  winnerTrophy: { fontSize: 44, marginBottom: 4 },
  winnerLabel: {
    fontSize: 11, fontWeight: "800", color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold", letterSpacing: 3, textTransform: "uppercase" as const,
  },
  winnerName: {
    fontSize: 24, fontWeight: "900", color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -0.5, textAlign: "center",
  },
  winnerStats: {
    flexDirection: "row", alignItems: "center", gap: 16,
    marginTop: 12, marginBottom: 8,
  },
  winnerStatItem: { alignItems: "center" },
  winnerStatValue: {
    fontSize: 20, fontWeight: "800", color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
  },
  winnerStatLabel: {
    fontSize: 10, color: "rgba(255,255,255,0.5)",
    fontFamily: "DMSans_400Regular", marginTop: 2,
  },
  winnerStatDivider: {
    width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.15)",
  },
  winnerDefeat: {
    fontSize: 12, color: "rgba(255,255,255,0.5)",
    fontFamily: "DMSans_400Regular", fontStyle: "italic",
  },
  shareImageBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 14, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1, borderColor: BRAND.colors.amber,
    backgroundColor: `${BRAND.colors.amber}15`,
  },
  shareImageBtnText: {
    fontSize: 12, fontWeight: "700", color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.5,
  },
});
