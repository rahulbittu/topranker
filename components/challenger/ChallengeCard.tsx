import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Animated as RNAnimated, Share,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { type ApiChallenger } from "@/lib/api";
import { formatCountdown, TIER_INFLUENCE_LABELS, TIER_COLORS, TIER_WEIGHTS, type CredibilityTier } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { pct, formatCompact } from "@/lib/style-helpers";
import { useShareCard } from "@/components/ShareCard";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { TYPOGRAPHY } from "@/constants/typography";
import { useExperiment } from "@/lib/use-experiment";
import {
  VoteBar,
  FighterPhoto,
  FighterConfidence,
  WinnerReveal,
  CommunityReviews,
} from "@/components/challenger/SubComponents";
import { ComparisonDetails } from "@/components/challenger/ComparisonDetails";

const AMBER = "#E8A317";

export interface ChallengeCardProps {
  challenge: ApiChallenger;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { scale, onPressIn, onPressOut } = usePressAnimation();
  const { cardRef, captureAndShare } = useShareCard();
  const { user } = useAuth();
  const { isTreatment: showPersonalizedWeight } = useExperiment("personalized_weight");
  const [, setTick] = useState(0);
  const endTs = new Date(challenge.endDate).getTime();
  const startTs = new Date(challenge.startDate).getTime();
  const countdown = formatCountdown(endTs);

  // Sprint 389: Live second-by-second countdown
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (countdown.ended) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      setSeconds(Math.max(0, Math.floor((endTs - Date.now()) / 1000) % 60));
    }, 1000);
    return () => clearInterval(id);
  }, [countdown.ended, endTs]);

  // Sprint 389: Urgency color based on remaining time
  const hoursRemaining = countdown.days * 24 + countdown.hours;
  const urgencyColor = countdown.ended ? Colors.textTertiary
    : hoursRemaining < 6 ? Colors.red
    : hoursRemaining < 24 ? AMBER
    : Colors.green;

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
        <View style={styles.cardHeaderRight}>
          <View style={[styles.statusBadge, countdown.ended ? styles.statusBadgeEnded : styles.statusBadgeLive]}>
            {!countdown.ended && <View style={styles.statusDot} />}
            <Text style={[styles.statusText, countdown.ended ? styles.statusTextEnded : styles.statusTextLive]}>
              {countdown.ended ? "ENDED" : "LIVE"}
            </Text>
          </View>
          <Text style={styles.cityText}>{challenge.city}</Text>
        </View>
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
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
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

      {/* Sprint 417: Side-by-side comparison details */}
      <ComparisonDetails
        defender={challenge.defenderBusiness}
        challenger={challenge.challengerBusiness}
      />

      <View style={styles.timerSection}>
        <Ionicons name="time-outline" size={14} color={urgencyColor} />
        {countdown.ended ? (
          <Text style={styles.timerText}>Ended</Text>
        ) : (
          <View style={styles.timerSegments}>
            <View style={styles.timerSegment}>
              <Text style={[styles.timerSegmentNum, { color: urgencyColor }]}>{String(countdown.days).padStart(2, "0")}</Text>
              <Text style={styles.timerSegmentLabel}>DAYS</Text>
            </View>
            <Text style={[styles.timerColon, { color: urgencyColor }]}>:</Text>
            <View style={styles.timerSegment}>
              <Text style={[styles.timerSegmentNum, { color: urgencyColor }]}>{String(countdown.hours).padStart(2, "0")}</Text>
              <Text style={styles.timerSegmentLabel}>HRS</Text>
            </View>
            <Text style={[styles.timerColon, { color: urgencyColor }]}>:</Text>
            <View style={styles.timerSegment}>
              <Text style={[styles.timerSegmentNum, { color: urgencyColor }]}>{String(countdown.minutes).padStart(2, "0")}</Text>
              <Text style={styles.timerSegmentLabel}>MIN</Text>
            </View>
            <Text style={[styles.timerColon, { color: urgencyColor }]}>:</Text>
            <View style={styles.timerSegment}>
              <Text style={[styles.timerSegmentNum, { color: urgencyColor }]}>{String(seconds).padStart(2, "0")}</Text>
              <Text style={styles.timerSegmentLabel}>SEC</Text>
            </View>
          </View>
        )}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: BRAND.colors.amber,
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
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeLive: {
    backgroundColor: "rgba(52, 199, 89, 0.12)",
  },
  statusBadgeEnded: {
    backgroundColor: "rgba(142, 142, 147, 0.12)",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.5,
  },
  statusTextLive: {
    color: Colors.green,
  },
  statusTextEnded: {
    color: Colors.textTertiary,
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
  vsDivider: { width: 1, height: 16, backgroundColor: Colors.border },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND.colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  vsText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1,
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
  timerSegments: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  timerSegment: {
    alignItems: "center",
  },
  timerSegmentNum: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  timerSegmentLabel: {
    fontSize: 7,
    fontWeight: "600",
    color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.5,
    marginTop: -2,
  },
  timerColon: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 8,
  },
});
