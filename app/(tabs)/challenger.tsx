import React from "react";
import {
  View, Text, StyleSheet, ScrollView,
  Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { fetchActiveChallenges, categoryToDisplay, type ApiChallenger } from "@/lib/api";
import { formatCountdown } from "@/lib/data";

function VoteBar({ challenger, defender }: { challenger: number; defender: number }) {
  const total = challenger + defender;
  const challengerPct = total > 0 ? (challenger / total) * 100 : 50;
  const defenderPct = 100 - challengerPct;

  return (
    <View style={styles.voteBarContainer}>
      <View style={styles.voteBar}>
        <View style={[styles.voteBarChallenger, { width: `${challengerPct}%` as any }]} />
      </View>
      <View style={styles.voteBarLabels}>
        <Text style={styles.voteBarPct}>{challengerPct.toFixed(1)}%</Text>
        <Text style={styles.voteBarPct}>{defenderPct.toFixed(1)}%</Text>
      </View>
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

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{categoryToDisplay(challenge.category).toUpperCase()}</Text>
        </View>
        <View style={styles.cityBadge}>
          <Ionicons name="location-sharp" size={10} color={Colors.textTertiary} />
          <Text style={styles.cityText}>{challenge.city}</Text>
        </View>
      </View>

      <View style={styles.fightCard}>
        <View style={styles.fighter}>
          <View style={styles.crownBadge}>
            <Ionicons name="trophy" size={16} color={Colors.gold} />
          </View>
          <Text style={styles.fighterName} numberOfLines={2}>{challenge.defenderBusiness.name}</Text>
          <Text style={styles.fighterLabel}>DEFENDING #1</Text>
          <Text style={styles.voteCount}>{defenderVotes.toLocaleString()}</Text>
          <Text style={styles.voteLabel}>weighted votes</Text>
        </View>

        <View style={styles.vsContainer}>
          <View style={styles.vsDivider} />
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.vsDivider} />
        </View>

        <View style={styles.fighter}>
          <View style={styles.challengerIconBadge}>
            <Ionicons name="flash" size={16} color={Colors.redBright} />
          </View>
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
          {countdown.days}d {countdown.hours}h {countdown.minutes}m remaining
        </Text>
        <Text style={styles.progressText}>Day {daysElapsed}/{totalDays}</Text>
      </View>

      <View style={styles.progressBarOuter}>
        <View style={[styles.progressBarInner, { width: `${Math.min((daysElapsed / totalDays) * 100, 100)}%` as any }]} />
      </View>
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
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
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
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.redFaint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(176,48,48,0.3)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.redBright,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.redBright,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 2,
  },
  content: { paddingHorizontal: 16, gap: 16 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "Inter_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  catBadge: {
    backgroundColor: Colors.goldFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.2)",
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  cityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  cityText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  fightCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  fighter: { flex: 1, alignItems: "center", gap: 4 },
  crownBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldFaint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.3)",
  },
  challengerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.redFaint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(176,48,48,0.3)",
  },
  fighterName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  fighterLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  voteCount: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginTop: 4,
  },
  voteLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  vsContainer: { alignItems: "center", width: 40 },
  vsDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vsText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary,
    fontFamily: "Inter_700Bold",
  },
  voteBarContainer: { marginBottom: 12 },
  voteBar: {
    height: 6,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "row",
  },
  voteBarChallenger: {
    height: "100%",
    backgroundColor: Colors.redBright,
    borderRadius: 3,
  },
  voteBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  voteBarPct: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  progressText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  progressBarOuter: {
    height: 3,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
});
