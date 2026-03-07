import React from "react";
import {
  View, Text, StyleSheet, ScrollView,
  Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { fetchActiveChallenges, fetchBusinessBySlug, type ApiChallenger } from "@/lib/api";
import { formatCountdown, formatTimeAgo, TIER_DISPLAY_NAMES, TIER_COLORS, type CredibilityTier } from "@/lib/data";
import { getCategoryDisplay } from "@/constants/brand";

const AMBER = "#C49A1A";

function VoteBar({ challenger, defender }: { challenger: number; defender: number }) {
  const total = challenger + defender;
  const challengerPct = total > 0 ? (challenger / total) * 100 : 50;
  const defenderPct = 100 - challengerPct;

  return (
    <View style={styles.voteBarContainer}>
      <View style={styles.voteBar}>
        <View style={[styles.voteBarDefender, { width: `${defenderPct}%` as any }]} />
      </View>
      <View style={styles.voteBarLabels}>
        <Text style={styles.voteBarPct}>{defenderPct.toFixed(1)}%</Text>
        <Text style={styles.voteBarPct}>{challengerPct.toFixed(1)}%</Text>
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
  const tierColor = TIER_COLORS[review.userTier] || "#8E8E93";
  const tierName = TIER_DISPLAY_NAMES[review.userTier] || "New Member";
  const initial = review.userName.charAt(0).toUpperCase();

  let tierBadgeBg = "#8E8E93";
  if (review.userTier === "top") tierBadgeBg = "#C9973A";
  else if (review.userTier === "trusted") tierBadgeBg = AMBER;

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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name="chatbubbles-outline" size={14} color={AMBER} />
        <Text style={styles.reviewsSectionTitle}>COMMUNITY REVIEWS</Text>
      </View>
      {displayReviews.map(review => (
        <ReviewRow key={review.id} review={review} />
      ))}
    </View>
  );
}

function ChallengeCard({ challenge }: { challenge: ApiChallenger }) {
  const endTs = new Date(challenge.endDate).getTime();
  const startTs = new Date(challenge.startDate).getTime();
  const countdown = formatCountdown(endTs);

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
        <View style={styles.fighter}>
          <Ionicons name="trophy-outline" size={20} color={Colors.gold} />
          <Text style={styles.fighterName} numberOfLines={2}>{challenge.defenderBusiness.name}</Text>
          <Text style={styles.fighterLabel}>DEFENDING #1</Text>
          <Text style={styles.voteCount}>{defenderVotes.toLocaleString()}</Text>
          <Text style={styles.voteLabel}>weighted votes</Text>
        </View>

        <View style={styles.vsContainer}>
          <View style={styles.vsDivider} />
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.vsDivider} />
        </View>

        <View style={styles.fighter}>
          <Ionicons name="flash-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.fighterName} numberOfLines={2}>{challenge.challengerBusiness.name}</Text>
          <Text style={styles.fighterLabel}>CHALLENGER</Text>
          <Text style={styles.voteCount}>{challengerVotes.toLocaleString()}</Text>
          <Text style={styles.voteLabel}>weighted votes</Text>
        </View>
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

      <CommunityReviews challenge={challenge} />
    </View>
  );
}

export default function ChallengerScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challengers", "Dallas"],
    queryFn: () => fetchActiveChallenges("Dallas"),
    staleTime: 30000,
  });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Challenges</Text>
      </View>
      <Text style={styles.headerSub}>
        30-day head-to-head competitions. Weighted votes decide the winner.
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
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
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  card: {
    backgroundColor: "#FFFFFF",
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
  fighter: { flex: 1, alignItems: "center", gap: 4 },
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
  voteBarContainer: { marginBottom: 12 },
  voteBar: {
    height: 3,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
    flexDirection: "row",
  },
  voteBarDefender: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  voteBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  voteBarPct: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
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
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },

  // Community Reviews section
  reviewsSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
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
    backgroundColor: AMBER,
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
    color: AMBER,
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
