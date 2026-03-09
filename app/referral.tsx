import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Share, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";
import { useAuth } from "@/lib/auth-context";
import { hapticPress } from "@/lib/audio";
import { Analytics } from "@/lib/analytics";
import { fetchReferralStats, type ReferralStats } from "@/lib/api";

const REFERRAL_REWARDS = [
  { count: 1, reward: "Earn City tier 2x faster", icon: "trending-up-outline" },
  { count: 3, reward: "Exclusive 'Connector' badge", icon: "ribbon-outline" },
  { count: 5, reward: "Early access to new cities", icon: "earth-outline" },
  { count: 10, reward: "Lifetime Top Ranker status", icon: "star-outline" },
];

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  // Sprint 192: Live referral data from API
  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referrals/me"],
    queryFn: fetchReferralStats,
    enabled: !!user,
    staleTime: 60_000,
  });

  const referralCode = stats?.code || user?.username?.toUpperCase() || "TOPRANKER";
  const referralLink = stats?.shareUrl || `https://topranker.com/join?ref=${referralCode}`;
  const referralCount = stats?.totalReferred || 0;
  const activatedCount = stats?.activated || 0;

  const shareReferral = async () => {
    hapticPress();
    try {
      await Share.share({
        message: `Join me on TopRanker — the app where your restaurant opinions actually matter. Trust-weighted rankings, not fake reviews.\n\nUse my code: ${referralCode}\n\n${referralLink}`,
      });
      Analytics.shareBusiness("referral", "share_sheet");
      Analytics.betaReferralShare("share_sheet");
    } catch {}
  };

  const copyCode = () => {
    hapticPress();
    // In production, use Clipboard API
    // For now, open share sheet as fallback
    shareReferral();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={{ width: 32 }} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <LinearGradient
            colors={[BRAND.colors.navy, BRAND.colors.navyDark]}
            style={styles.hero}
          >
            <Text style={styles.heroEmoji}>🤝</Text>
            <Text style={styles.heroTitle}>Grow the Trust Network</Text>
            <Text style={styles.heroSub}>
              Invite friends who care about honest restaurant rankings. More trusted reviewers = better rankings for everyone.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Referral Code */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.codeCard}>
          <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity
              onPress={copyCode}
              style={styles.copyBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Copy referral code"
            >
              <Ionicons name="copy-outline" size={16} color={BRAND.colors.amber} />
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.codeUrl}>{referralLink}</Text>
        </Animated.View>

        {/* Share CTA */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={shareReferral}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Share your referral link"
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Share Invite Link</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Progress */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Referrals</Text>
          {isLoading ? (
            <ActivityIndicator color={BRAND.colors.amber} style={{ marginVertical: 12 }} />
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.progressCount}>
                <Text style={styles.progressNumber}>{referralCount}</Text>
                <Text style={styles.progressLabel}>friends joined</Text>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.progressCount}>
                <Text style={styles.progressNumber}>{activatedCount}</Text>
                <Text style={styles.progressLabel}>started rating</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Rewards */}
        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={styles.rewardsTitle}>Referral Rewards</Text>
          {REFERRAL_REWARDS.map((reward, i) => {
            const unlocked = referralCount >= reward.count;
            return (
              <View
                key={i}
                style={[styles.rewardRow, unlocked && styles.rewardRowUnlocked]}
              >
                <View style={[styles.rewardIcon, unlocked && styles.rewardIconUnlocked]}>
                  <TypedIcon
                    name={reward.icon}
                    size={18}
                    color={unlocked ? BRAND.colors.amber : Colors.textTertiary}
                  />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardCount, unlocked && styles.rewardCountUnlocked]}>
                    {reward.count} referral{reward.count > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.rewardText}>{reward.reward}</Text>
                </View>
                {unlocked ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                ) : (
                  <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} />
                )}
              </View>
            );
          })}
        </Animated.View>

        {/* Referral List */}
        {stats?.referrals && stats.referrals.length > 0 && (
          <Animated.View entering={FadeInUp.delay(550).duration(500)}>
            <Text style={styles.rewardsTitle}>Your Referral Network</Text>
            {stats.referrals.map((ref, i) => (
              <View key={ref.referredId || i} style={styles.referralRow}>
                <View style={styles.referralAvatar}>
                  <Text style={styles.referralAvatarText}>
                    {ref.displayName?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.referralName}>{ref.displayName}</Text>
                  <Text style={styles.referralDetail}>
                    @{ref.username} · {ref.status === "activated" ? "Active rater" : "Joined"}
                  </Text>
                </View>
                {ref.status === "activated" ? (
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                ) : (
                  <Ionicons name="time-outline" size={16} color={Colors.textTertiary} />
                )}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Trust message */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.trustMessage}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textTertiary} />
          <Text style={styles.trustMessageText}>
            We never spam your contacts. Sharing is always your choice.
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  hero: {
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black",
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 8,
    ...Colors.cardShadow,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 2,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  codeText: {
    fontSize: 28,
    fontWeight: "900",
    color: BRAND.colors.navy,
    fontFamily: "PlayfairDisplay_900Black",
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: `${BRAND.colors.amber}12`,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND.colors.amber,
    fontFamily: "DMSans_600SemiBold",
  },
  codeUrl: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 14,
    paddingVertical: 16,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 4,
    ...Colors.cardShadow,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statsDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  progressCount: { alignItems: "center" },
  progressNumber: {
    fontSize: 36,
    fontWeight: "900",
    color: BRAND.colors.navy,
    fontFamily: "PlayfairDisplay_900Black",
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    marginTop: 8,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    ...Colors.cardShadow,
  },
  rewardRowUnlocked: {
    borderWidth: 1,
    borderColor: `${BRAND.colors.amber}30`,
  },
  rewardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardIconUnlocked: {
    backgroundColor: `${BRAND.colors.amber}15`,
  },
  rewardInfo: { flex: 1, gap: 1 },
  rewardCount: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    fontFamily: "DMSans_700Bold",
  },
  rewardCountUnlocked: { color: BRAND.colors.amber },
  rewardText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  referralRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    ...Colors.cardShadow,
  },
  referralAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${BRAND.colors.amber}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  referralAvatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
  },
  referralName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  referralDetail: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  trustMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 12,
  },
  trustMessageText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});
