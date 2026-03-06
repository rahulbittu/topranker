import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  MOCK_USER, TIER_COLORS, getTierProgress, formatTimeAgo,
  CredibilityTier,
} from "@/lib/data";

function TierBadge({ tier }: { tier: CredibilityTier }) {
  const color = TIER_COLORS[tier];
  return (
    <View style={[styles.tierBadge, { borderColor: color, backgroundColor: `${color}18` }]}>
      {tier === "Top Reviewer" && <Ionicons name="trophy" size={12} color={color} />}
      {tier === "Trusted" && <Ionicons name="shield-checkmark" size={12} color={color} />}
      {tier === "Regular" && <Ionicons name="star" size={12} color={color} />}
      {tier === "New Member" && <Ionicons name="person" size={12} color={color} />}
      <Text style={[styles.tierBadgeText, { color }]}>{tier.toUpperCase()}</Text>
    </View>
  );
}

function ScoreDots({ score }: { score: number }) {
  return (
    <View style={styles.scoreDots}>
      {[1, 2, 3, 4, 5].map(n => (
        <View
          key={n}
          style={[
            styles.dot,
            n <= Math.round(score) ? styles.dotFilled : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = MOCK_USER;
  const progress = getTierProgress(user.tier, user.ratingsSubmitted, user.categoriesCovered.length);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const memberDays = Math.floor((Date.now() - user.joinedAt) / 86400000);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topPad }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{user.name.charAt(0)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <TierBadge tier={user.tier} />
          <Text style={styles.memberSince}>Member for {memberDays} days</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{user.ratingsSubmitted}</Text>
          <Text style={styles.statLabel}>Ratings</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statNum}>{user.categoriesCovered.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: Colors.green }]}>{user.businessesHelpedUp}</Text>
          <Text style={styles.statLabel}>Helped Up</Text>
        </View>
      </View>

      {progress.next && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress to {progress.next}</Text>
            <Text style={styles.progressPct}>{Math.round(progress.progressPercent)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progress.progressPercent}%` as any }]}
            />
          </View>
          <Text style={styles.progressCriteria}>{progress.criteriaText}</Text>
        </View>
      )}

      {user.businessesHelpedUp > 0 && (
        <View style={styles.impactBanner}>
          <Ionicons name="trending-up" size={20} color={Colors.green} />
          <Text style={styles.impactText}>
            Your ratings contributed to <Text style={{ color: Colors.green, fontFamily: "Inter_700Bold" }}>{user.businessesHelpedUp} businesses</Text> moving up in the Dallas rankings this month.
          </Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rating History</Text>
        <Text style={styles.sectionCount}>{user.ratingHistory.length}</Text>
      </View>

      {user.ratingHistory.map((r, i) => (
        <View key={i} style={styles.historyRow}>
          <View style={styles.historyLeft}>
            <Text style={styles.historyName}>{r.businessName}</Text>
            <Text style={styles.historyDate}>{formatTimeAgo(r.ratedAt)}</Text>
          </View>
          <View style={styles.historyRight}>
            <Text style={styles.historyScore}>{r.score.toFixed(1)}</Text>
            <ScoreDots score={r.score} />
          </View>
        </View>
      ))}

      {user.ratingHistory.length === 0 && (
        <View style={styles.emptyHistory}>
          <Ionicons name="star-outline" size={32} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No ratings yet</Text>
          <Text style={styles.emptySubtext}>Rate businesses to build your credibility</Text>
        </View>
      )}

      <View style={styles.tierInfoSection}>
        <Text style={styles.sectionTitle}>Credibility Tiers</Text>
        <View style={styles.tierList}>
          {(["New Member", "Regular", "Trusted", "Top Reviewer"] as CredibilityTier[]).map(tier => (
            <View key={tier} style={[styles.tierRow, user.tier === tier && styles.tierRowActive]}>
              <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[tier] }]} />
              <Text style={[styles.tierName, user.tier === tier && { color: Colors.text }]}>{tier}</Text>
              {user.tier === tier && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>CURRENT</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.goldFaint,
    borderWidth: 2,
    borderColor: Colors.goldDim,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
  },
  profileInfo: {
    gap: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  memberSince: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  statBoxMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  statNum: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  progressSection: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  progressPct: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  progressCriteria: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  impactBanner: {
    backgroundColor: Colors.greenFaint,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
  },
  impactText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 19,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  sectionCount: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: {
    gap: 2,
  },
  historyName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  historyScore: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  scoreDots: {
    flexDirection: "row",
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotFilled: {
    backgroundColor: Colors.gold,
  },
  dotEmpty: {
    backgroundColor: Colors.surfaceRaised,
  },
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  tierInfoSection: {
    gap: 10,
    marginTop: 8,
  },
  tierList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tierRowActive: {
    backgroundColor: Colors.goldFaint,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  currentBadge: {
    backgroundColor: Colors.goldFaint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
