import React, { useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  getBusinessById, getRatingsByBusiness, getChallengerById,
  formatTimeAgo, MOCK_USER, formatCountdown,
  TIER_COLORS, CredibilityTier, Rating,
} from "@/lib/data";

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarLabel}>{label}</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${(value / 5) * 100}%` as any }]} />
      </View>
      <Text style={styles.ratingBarValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

function DistributionChart({ ratings }: { ratings: Rating[] }) {
  const counts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: ratings.filter(r => r.food !== undefined ? Math.round(r.weightedScore) === n : false).length
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <View style={styles.distChart}>
      {counts.map(({ star, count }) => (
        <View key={star} style={styles.distRow}>
          <Text style={styles.distStar}>{star}</Text>
          <View style={styles.distBarTrack}>
            <View
              style={[styles.distBarFill, {
                width: `${(count / maxCount) * 100}%` as any,
                backgroundColor: count === maxCount && count > 0 ? Colors.gold : Colors.surfaceRaised,
              }]}
            />
          </View>
          <Text style={styles.distCount}>{count}</Text>
        </View>
      ))}
    </View>
  );
}

function RatingRow({ rating }: { rating: Rating }) {
  const tierColor = TIER_COLORS[rating.userTier];
  return (
    <View style={styles.ratingRow}>
      <View style={styles.ratingTop}>
        <View style={styles.ratingUser}>
          <Text style={styles.ratingName}>{rating.userName}</Text>
          <View style={[styles.tierBadge, { borderColor: tierColor, backgroundColor: `${tierColor}18` }]}>
            <Text style={[styles.tierBadgeText, { color: tierColor }]}>{rating.userTier}</Text>
          </View>
        </View>
        <View style={styles.ratingScoreBox}>
          <Text style={styles.ratingScore}>{rating.weightedScore.toFixed(1)}</Text>
          <Text style={styles.ratingTime}>{formatTimeAgo(rating.createdAt)}</Text>
        </View>
      </View>
      {rating.food !== undefined && (
        <View style={styles.ratingSubScores}>
          <View style={styles.ratingSubItem}>
            <Text style={styles.ratingSubLabel}>Food</Text>
            <Text style={styles.ratingSubVal}>{rating.food}</Text>
          </View>
          <View style={styles.ratingSubItem}>
            <Text style={styles.ratingSubLabel}>Value</Text>
            <Text style={styles.ratingSubVal}>{rating.value}</Text>
          </View>
          <View style={styles.ratingSubItem}>
            <Text style={styles.ratingSubLabel}>Service</Text>
            <Text style={styles.ratingSubVal}>{rating.service}</Text>
          </View>
          <View style={styles.ratingSubItem}>
            <Text style={styles.ratingSubLabel}>Return</Text>
            <Ionicons
              name={rating.wouldReturn ? "checkmark-circle" : "close-circle"}
              size={14}
              color={rating.wouldReturn ? Colors.green : Colors.red}
            />
          </View>
        </View>
      )}
      {rating.comment && (
        <Text style={styles.ratingComment}>"{rating.comment}"</Text>
      )}
    </View>
  );
}

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const business = getBusinessById(id);
  const ratings = useMemo(() => getRatingsByBusiness(id), [id]);
  const challenge = business?.challengerId ? getChallengerById(business.challengerId) : undefined;

  const canRate = MOCK_USER.ratingsSubmitted >= 0; // for demo, always allow
  const daysActive = Math.floor((Date.now() - MOCK_USER.joinedAt) / 86400000);
  const hasMinDays = daysActive >= 7;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!business) {
    return (
      <View style={[styles.notFound, { paddingTop: topPad }]}>
        <Text style={styles.notFoundText}>Business not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const countdown = challenge ? formatCountdown(challenge.endDate) : null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportBtn}>
          <Ionicons name="flag-outline" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32 }
        ]}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroRank}>
            <Text style={styles.heroRankText}>#{business.rank}</Text>
          </View>
          <Text style={styles.heroName}>{business.name}</Text>
          <Text style={styles.heroCat}>in {business.city} {business.category}</Text>
          <Text style={styles.heroDesc}>{business.description}</Text>
          <View style={styles.heroTags}>
            {business.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreMain}>
            <Text style={styles.scoreNumber}>{business.score.toFixed(1)}</Text>
            <Text style={styles.scoreLabel}>Community Score</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreStats}>
            <Text style={styles.scoreStatNum}>{business.ratingCount}</Text>
            <Text style={styles.scoreStatLabel}>Ratings</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreStats}>
            <Text style={styles.scoreStatNum}>{business.neighborhood}</Text>
            <Text style={styles.scoreStatLabel}>Area</Text>
          </View>
        </View>

        {challenge && countdown && (
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Ionicons name="flash" size={16} color={Colors.gold} />
              <Text style={styles.challengeTitle}>Active Challenger</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <View style={styles.challengeVs}>
              <Text style={styles.challengeDefender}>{challenge.defenderName}</Text>
              <Text style={styles.challengeVsText}>vs</Text>
              <Text style={styles.challengeChallenger}>{challenge.challengerName}</Text>
            </View>
            <View style={styles.challengeVotes}>
              <Text style={styles.challengeVoteNum}>{challenge.defenderVotes.toLocaleString()}</Text>
              <Text style={styles.challengeVoteNum}>{challenge.challengerVotes.toLocaleString()}</Text>
            </View>
            <Text style={styles.challengeTimer}>
              {countdown.days}d {countdown.hours}h {countdown.minutes}m remaining
            </Text>
          </View>
        )}

        {hasMinDays ? (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => router.push({ pathname: "/rate/[id]", params: { id: business.id } })}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={18} color="#000" />
            <Text style={styles.rateButtonText}>Rate This Place</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rateDisabled}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.rateDisabledText}>
              Build your reviewer credibility to rate this business.
            </Text>
          </View>
        )}

        {ratings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rating Breakdown</Text>
            </View>
            <View style={styles.ratingBreakdownCard}>
              <RatingBar label="Food Quality" value={ratings.reduce((a, r) => a + (r.food ?? 0), 0) / ratings.length} />
              <RatingBar label="Value for Money" value={ratings.reduce((a, r) => a + (r.value ?? 0), 0) / ratings.length} />
              <RatingBar label="Service" value={ratings.reduce((a, r) => a + (r.service ?? 0), 0) / ratings.length} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Distribution</Text>
            </View>
            <View style={styles.card}>
              <DistributionChart ratings={ratings} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Ratings</Text>
              <Text style={styles.sectionCount}>{ratings.length} reviews</Text>
            </View>
            {ratings.map(rating => (
              <RatingRow key={rating.id} rating={rating} />
            ))}
          </>
        )}

        <TouchableOpacity style={styles.reportLink}>
          <Ionicons name="flag-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.reportLinkText}>Report Suspicious Activity</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  backLink: {
    fontSize: 14,
    color: Colors.gold,
    fontFamily: "Inter_500Medium",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  heroRank: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  heroRankText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  heroName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  heroCat: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  heroDesc: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  heroTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  tag: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  scoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreMain: {
    flex: 1,
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  scoreStats: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  scoreStatNum: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  scoreStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  challengeCard: {
    backgroundColor: "#1A0A00",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245,197,24,0.3)",
    gap: 10,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gold,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239,68,68,0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.red,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.red,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  challengeVs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  challengeDefender: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "right",
  },
  challengeVsText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  challengeChallenger: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  challengeVotes: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  challengeVoteNum: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  challengeTimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  rateButton: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  rateDisabled: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rateDisabledText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  ratingBreakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBarLabel: {
    width: 90,
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  ratingBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  ratingBarValue: {
    width: 28,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distChart: {
    gap: 7,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distStar: {
    width: 12,
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  distBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 3,
    overflow: "hidden",
  },
  distBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  distCount: {
    width: 16,
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  ratingRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ratingUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  ratingName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  ratingScoreBox: {
    alignItems: "flex-end",
  },
  ratingScore: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  ratingTime: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  ratingSubScores: {
    flexDirection: "row",
    gap: 12,
  },
  ratingSubItem: {
    alignItems: "center",
    gap: 2,
  },
  ratingSubLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  ratingSubVal: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  ratingComment: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 18,
  },
  reportLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 16,
    marginTop: 8,
  },
  reportLinkText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
});
