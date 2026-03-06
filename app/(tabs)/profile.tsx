import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  MOCK_USER, TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS,
  getTierRequirements, formatTimeAgo,
  CredibilityTier, TIER_SCORE_RANGES,
} from "@/lib/data";

function TierBadge({ tier }: { tier: CredibilityTier }) {
  const color = TIER_COLORS[tier];
  const displayName = TIER_DISPLAY_NAMES[tier];
  return (
    <View style={[styles.tierBadge, { borderColor: color, backgroundColor: `${color}18` }]}>
      {tier === "top" && <Ionicons name="trophy" size={12} color={color} />}
      {tier === "trusted" && <Ionicons name="shield-checkmark" size={12} color={color} />}
      {tier === "regular" && <Ionicons name="star" size={12} color={color} />}
      {tier === "new" && <Ionicons name="person" size={12} color={color} />}
      <Text style={[styles.tierBadgeText, { color }]}>{displayName.toUpperCase()}</Text>
    </View>
  );
}

function BreakdownRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.breakdownRow}>
      <Ionicons name={icon as any} size={14} color={Colors.textTertiary} />
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = MOCK_USER;
  const tierReqs = getTierRequirements(user.tier, user.credibilityScore, user.totalRatings, user.totalCategories, user.daysActive, user.ratingVariance, 0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const tierColor = TIER_COLORS[user.tier];
  const weight = TIER_WEIGHTS[user.tier];
  const scoreRange = TIER_SCORE_RANGES[user.tier];
  const nextRange = tierReqs.nextTier ? TIER_SCORE_RANGES[tierReqs.nextTier] : null;
  const progressToNext = nextRange
    ? Math.min(((user.credibilityScore - scoreRange.min) / (nextRange.min - scoreRange.min)) * 100, 100)
    : 100;

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
          <Text style={styles.username}>@{user.username}</Text>
          <TierBadge tier={user.tier} />
          {user.isFoundingMember && (
            <View style={styles.foundingBadge}>
              <Ionicons name="diamond" size={10} color={Colors.gold} />
              <Text style={styles.foundingText}>FOUNDING MEMBER</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.credibilityCard}>
        <View style={styles.credScoreRow}>
          <View>
            <Text style={styles.credScoreLabel}>Credibility Score</Text>
            <Text style={[styles.credScore, { color: tierColor }]}>{user.credibilityScore}</Text>
          </View>
          <View style={styles.credWeightBox}>
            <Text style={styles.credWeightLabel}>Vote Weight</Text>
            <Text style={[styles.credWeight, { color: tierColor }]}>{weight.toFixed(2)}x</Text>
          </View>
        </View>

        {tierReqs.nextTier && (
          <View style={styles.credProgress}>
            <View style={styles.credProgressHeader}>
              <Text style={styles.credProgressLabel}>
                Progress to {TIER_DISPLAY_NAMES[tierReqs.nextTier]}
              </Text>
              <Text style={styles.credProgressPct}>{Math.round(progressToNext)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressToNext}%` as any, backgroundColor: tierColor }]} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{user.totalRatings}</Text>
          <Text style={styles.statLabel}>Ratings</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statNum}>{user.totalCategories}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{user.daysActive}</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
      </View>

      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Score Breakdown</Text>
        <BreakdownRow label="Base points" value={`+${user.credibilityBreakdown.basePoints}`} icon="person-outline" />
        <BreakdownRow label="Rating volume" value={`+${user.credibilityBreakdown.ratingPoints}`} icon="star-outline" />
        <BreakdownRow label="Category diversity" value={`+${user.credibilityBreakdown.diversityBonus}`} icon="grid-outline" />
        <BreakdownRow label="Account age" value={`+${Math.round(user.credibilityBreakdown.ageBonus)}`} icon="time-outline" />
        <BreakdownRow label="Rating variance" value={`+${Math.round(user.credibilityBreakdown.varianceBonus)}`} icon="analytics-outline" />
        <BreakdownRow label="Helpfulness" value={`+${user.credibilityBreakdown.helpfulnessBonus}`} icon="hand-left-outline" />
        {user.credibilityBreakdown.flagPenalty > 0 && (
          <BreakdownRow label="Flag penalties" value={`-${user.credibilityBreakdown.flagPenalty}`} icon="flag-outline" />
        )}
        <View style={styles.breakdownTotal}>
          <Text style={styles.breakdownTotalLabel}>Total</Text>
          <Text style={[styles.breakdownTotalValue, { color: tierColor }]}>
            {user.credibilityBreakdown.totalScore}
          </Text>
        </View>
      </View>

      {tierReqs.nextTier && tierReqs.requirements.length > 0 && (
        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>
            Requirements for {TIER_DISPLAY_NAMES[tierReqs.nextTier]}
          </Text>
          {tierReqs.requirements.map((req, i) => (
            <View key={i} style={styles.reqRow}>
              <Ionicons
                name={req.met ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={req.met ? Colors.greenBright : Colors.textTertiary}
              />
              <Text style={[styles.reqText, req.met && styles.reqTextMet]}>{req.label}</Text>
              {!req.met && req.current > 0 && (
                <Text style={styles.reqProgress}>
                  {req.current}/{req.needed}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {user.businessesHelpedUp > 0 && (
        <View style={styles.impactBanner}>
          <Ionicons name="trending-up" size={20} color={Colors.greenBright} />
          <Text style={styles.impactText}>
            Your ratings contributed to <Text style={{ color: Colors.greenBright, fontFamily: "Inter_700Bold" }}>{user.businessesHelpedUp} businesses</Text> moving up in the Dallas rankings this month.
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
            <Text style={styles.historyScore}>{r.rawScore.toFixed(1)}</Text>
            <Text style={styles.historyWeight}>{r.weight.toFixed(2)}x weight</Text>
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
          {(["new", "regular", "trusted", "top"] as CredibilityTier[]).map(tier => (
            <View key={tier} style={[styles.tierRow, user.tier === tier && styles.tierRowActive]}>
              <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[tier] }]} />
              <View style={styles.tierRowInfo}>
                <Text style={[styles.tierName, user.tier === tier && { color: Colors.text }]}>
                  {TIER_DISPLAY_NAMES[tier]}
                </Text>
                <Text style={styles.tierWeight}>{TIER_WEIGHTS[tier].toFixed(2)}x</Text>
              </View>
              <Text style={styles.tierRange}>
                {TIER_SCORE_RANGES[tier].min}–{TIER_SCORE_RANGES[tier].max}
              </Text>
              {user.tier === tier && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>YOU</Text>
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, gap: 12 },
  header: { paddingTop: 4, paddingBottom: 4 },
  title: {
    fontSize: 28, fontWeight: "700", color: Colors.text,
    fontFamily: "Inter_700Bold", letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: Colors.surface, borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.goldFaint,
    borderWidth: 2, borderColor: Colors.goldDim,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontSize: 24, fontWeight: "700", color: Colors.gold, fontFamily: "Inter_700Bold" },
  profileInfo: { gap: 4 },
  profileName: {
    fontSize: 20, fontWeight: "700", color: Colors.text,
    fontFamily: "Inter_700Bold", letterSpacing: -0.3,
  },
  username: { fontSize: 12, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  tierBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, alignSelf: "flex-start",
  },
  tierBadgeText: { fontSize: 9, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  foundingBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    backgroundColor: Colors.goldFaint, alignSelf: "flex-start",
  },
  foundingText: { fontSize: 8, fontWeight: "700", color: Colors.gold, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  credibilityCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border, gap: 14,
  },
  credScoreRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  credScoreLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular", letterSpacing: 0.5, textTransform: "uppercase" as const },
  credScore: { fontSize: 48, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -2 },
  credWeightBox: { alignItems: "center", gap: 2 },
  credWeightLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "Inter_400Regular", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  credWeight: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  credProgress: { gap: 6 },
  credProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  credProgressLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },
  credProgressPct: { fontSize: 12, fontWeight: "700", color: Colors.gold, fontFamily: "Inter_700Bold" },
  progressBarBg: { height: 6, backgroundColor: Colors.surfaceRaised, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },

  statsRow: {
    flexDirection: "row", backgroundColor: Colors.surface, borderRadius: 14,
    overflow: "hidden", borderWidth: 1, borderColor: Colors.border,
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: 24, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  breakdownCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  breakdownTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  breakdownRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  breakdownLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  breakdownValue: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  breakdownTotal: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 6, marginTop: 2,
  },
  breakdownTotalLabel: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold" },
  breakdownTotalValue: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },

  requirementsCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  requirementsTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  reqText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  reqTextMet: { color: Colors.greenBright, textDecorationLine: "line-through" as const },
  reqProgress: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_500Medium" },

  impactBanner: {
    backgroundColor: Colors.greenFaint, borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderWidth: 1, borderColor: "rgba(26,107,60,0.2)",
  },
  impactText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 19 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  sectionCount: { fontSize: 13, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  historyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  historyLeft: { gap: 2 },
  historyName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  historyRight: { alignItems: "flex-end", gap: 2 },
  historyScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold" },
  historyWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  emptyHistory: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "Inter_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  tierInfoSection: { gap: 10, marginTop: 8 },
  tierList: {
    backgroundColor: Colors.surface, borderRadius: 14,
    overflow: "hidden", borderWidth: 1, borderColor: Colors.border,
  },
  tierRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tierRowActive: { backgroundColor: Colors.goldFaint },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierRowInfo: { flex: 1, gap: 1 },
  tierName: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },
  tierWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  tierRange: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },
  currentBadge: {
    backgroundColor: Colors.goldFaint,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  currentBadgeText: { fontSize: 8, fontWeight: "700", color: Colors.gold, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
});
