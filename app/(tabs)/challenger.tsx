import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  Platform, TouchableOpacity, RefreshControl,
} from "react-native";
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
import { ChallengerSkeleton } from "@/components/Skeleton";

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

function ReviewRow({ review }: { review: ReviewItem }) {
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
}

function CommunityReviews({ challenge }: { challenge: ApiChallenger }) {
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

  return (
    <View style={styles.reviewsSection}>
      <View style={styles.reviewsTitleRow}>
        <Ionicons name="chatbubbles-outline" size={14} color={BRAND.colors.amber} />
        <Text style={styles.reviewsSectionTitle}>COMMUNITY REVIEWS</Text>
      </View>
      {displayReviews.map(review => (
        <ReviewRow key={review.id} review={review} />
      ))}
    </View>
  );
}

function FighterPhoto({ biz }: { biz: any }) {
  const [err, setErr] = useState(false);
  const photoUrl = biz.photoUrl || (biz.photoUrls && biz.photoUrls[0]);
  if (photoUrl && !err) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={styles.fighterPhoto}
        contentFit="cover"
        transition={200}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <LinearGradient colors={[BRAND.colors.amber, BRAND.colors.amberDark]} style={styles.fighterPhoto}>
      <Text style={styles.fighterPhotoInitial}>{biz.name?.charAt(0) || "?"}</Text>
    </LinearGradient>
  );
}

function ChallengeCard({ challenge }: { challenge: ApiChallenger }) {
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

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.catText}>{catDisplay.emoji} {catDisplay.label.toUpperCase()}</Text>
        <Text style={styles.cityText}>{challenge.city}</Text>
      </View>

      <View style={styles.fightCard}>
        <TouchableOpacity
          style={styles.fighter}
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: challenge.defenderBusiness.slug } })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View ${challenge.defenderBusiness.name}, defending number 1`}
        >
          <FighterPhoto biz={challenge.defenderBusiness} />
          <Text style={styles.fighterName} numberOfLines={2}>{challenge.defenderBusiness.name}</Text>
          <Text style={styles.fighterLabel}>DEFENDING #1</Text>
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
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: challenge.challengerBusiness.slug } })}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View ${challenge.challengerBusiness.name}, challenger`}
        >
          <FighterPhoto biz={challenge.challengerBusiness} />
          <Text style={styles.fighterName} numberOfLines={2}>{challenge.challengerBusiness.name}</Text>
          <Text style={styles.fighterLabel}>CHALLENGER</Text>
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

      <View style={styles.voteCta}>
        <Text style={styles.voteCtaText}>Rate either business to cast your weighted vote</Text>
      </View>

      <CommunityReviews challenge={challenge} />
    </View>
  );
}

export default function ChallengerScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: challenges = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["challengers", "Dallas"],
    queryFn: () => fetchActiveChallenges("Dallas"),
    staleTime: 30000,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
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
  fighterPhoto: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  },
  fighterPhotoInitial: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#fff",
  },
  fighterName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  fighterLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.5,
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

  // Community Reviews section
  reviewsSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  reviewsTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
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
});
