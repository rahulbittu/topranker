import React, { useState, useCallback, useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import {
  View, Text, StyleSheet, ScrollView, Animated as RNAnimated, Share,
  Platform, TouchableOpacity, RefreshControl, UIManager,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { type ApiChallenger } from "@/lib/api";
import { fetchActiveChallenges } from "@/lib/api";
import { formatCountdown, TIER_INFLUENCE_LABELS, TIER_COLORS, TIER_WEIGHTS, type CredibilityTier } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { pct, formatCompact } from "@/lib/style-helpers";
import * as Haptics from "expo-haptics";
import { useShareCard } from "@/components/ShareCard";
import { ChallengerSkeleton } from "@/components/Skeleton";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCity } from "@/lib/city-context";
import { TYPOGRAPHY } from "@/constants/typography";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useExperiment } from "@/lib/use-experiment";
import {
  VoteBar,
  FighterPhoto,
  FighterConfidence,
  WinnerReveal,
  CommunityReviews,
} from "@/components/challenger/SubComponents";

const CHALLENGER_TIP_KEY = "challenger_tip_dismissed";

function ChallengeCard({ challenge }: { challenge: ApiChallenger }) {
  const { scale, onPressIn, onPressOut } = usePressAnimation();
  const { cardRef, captureAndShare } = useShareCard();
  const { user } = useAuth();
  const { isTreatment: showPersonalizedWeight } = useExperiment("personalized_weight");
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
        message: `${catDisplay.emoji} ${catDisplay.label} Challenge in ${challenge.city}\n\n${defender} (${defPct}%) vs ${challenger} (${chPct}%)\n\n${formatCompact(defenderVotes)} vs ${formatCompact(challengerVotes)} weighted votes\n${countdown.ended ? "Challenge ended!" : `${countdown.days}d ${countdown.hours}h remaining`}\n\nVote now on TopRanker!`,
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
          <FighterPhoto biz={challenge.defenderBusiness} label="DEFENDING #1" score={parseFloat(challenge.defenderBusiness.weightedScore) || 0} />
          <Text style={styles.voteCount}>{formatCompact(defenderVotes)}</Text>
          <Text style={styles.voteLabel}>weighted votes</Text>
          <FighterConfidence totalRatings={challenge.defenderBusiness.totalRatings} category={challenge.category} />
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
          <FighterPhoto biz={challenge.challengerBusiness} label="CHALLENGER" score={parseFloat(challenge.challengerBusiness.weightedScore) || 0} />
          <Text style={styles.voteCount}>{formatCompact(challengerVotes)}</Text>
          <Text style={styles.voteLabel}>weighted votes</Text>
          <FighterConfidence totalRatings={challenge.challengerBusiness.totalRatings} category={challenge.category} />
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
        <View style={[styles.progressBarInner, { width: pct(Math.min((daysElapsed / totalDays) * 100, 100)) }]} />
      </View>

      {/* Winner Reveal */}
      {countdown.ended && (
        <WinnerReveal
          defenderVotes={defenderVotes}
          challengerVotes={challengerVotes}
          defenderName={challenge.defenderBusiness.name}
          challengerName={challenge.challengerBusiness.name}
          totalDays={totalDays}
          category={challenge.category}
          city={challenge.city}
          cardRef={cardRef}
          captureAndShare={captureAndShare}
        />
      )}

      <View style={styles.voteCta}>
        <Text style={styles.voteCtaText}>Rate either business to cast your weighted vote</Text>
      </View>

      {/* How Voting Works — Sprint 131, A/B gated personalized weight (Sprint 144) */}
      <View style={styles.howVotingWorks}>
        <Ionicons name="information-circle-outline" size={13} color={Colors.textTertiary} />
        {showPersonalizedWeight && user?.credibilityTier ? (
          <View style={styles.howVotingWorksPersonalized}>
            <Text style={styles.howVotingWorksText}>
              Your vote weight:{" "}
              <Text style={[styles.howVotingWorksAccent, { color: TIER_COLORS[user.credibilityTier as CredibilityTier] || Colors.textSecondary }]}>
                {TIER_WEIGHTS[user.credibilityTier as CredibilityTier].toFixed(2)}
              </Text>
              {" "}({TIER_INFLUENCE_LABELS[user.credibilityTier as CredibilityTier] || "Standard"})
            </Text>
            {user.credibilityTier !== "top" && (
              <Text style={styles.howVotingWorksMotivation}>
                Rate more places to increase your influence
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.howVotingWorksText}>
            Your vote weight depends on your credibility tier. Higher-tier members have more influence on the outcome.
          </Text>
        )}
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

  useEffect(() => { track("view_challenger"); }, []);

  const [showChallengerTip, setShowChallengerTip] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHALLENGER_TIP_KEY).then((val) => {
      if (val !== "true") setShowChallengerTip(true);
    });
  }, []);

  const dismissChallengerTip = useCallback(() => {
    setShowChallengerTip(false);
    AsyncStorage.setItem(CHALLENGER_TIP_KEY, "true");
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <ErrorBoundary>
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
          {showChallengerTip && (
            <View style={styles.tipCard}>
              <Ionicons name="trophy-outline" size={20} color={BRAND.colors.amber} style={styles.tipIcon} />
              <View style={styles.tipTextStack}>
                <Text style={styles.tipTitle}>Watch businesses compete head-to-head</Text>
                <Text style={styles.tipSubtext}>Vote for your favorite and help decide the winner</Text>
              </View>
              <TouchableOpacity
                style={styles.tipDismiss}
                onPress={dismissChallengerTip}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Dismiss tip"
              >
                <Ionicons name="close" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

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
    </ErrorBoundary>
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
  voteCount: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -1,
    marginTop: 4,
  },
  voteLabel: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary,
  },
  vsContainer: { alignItems: "center", width: 40 },
  vsDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  vsText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    marginVertical: 4,
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  timerText: {
    ...TYPOGRAPHY.ui.label, color: Colors.textSecondary,
    flex: 1,
  },
  progressText: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary,
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
  howVotingWorks: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    paddingHorizontal: 16, paddingTop: 6,
  },
  howVotingWorksText: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    flex: 1, lineHeight: 14,
  },
  howVotingWorksPersonalized: {
    flex: 1, gap: 2,
  },
  howVotingWorksAccent: {
    fontFamily: "DMSans_600SemiBold", fontWeight: "600",
  },
  howVotingWorksMotivation: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    fontStyle: "italic", lineHeight: 12,
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

  // Onboarding tip card
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipTextStack: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  tipSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  tipDismiss: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
