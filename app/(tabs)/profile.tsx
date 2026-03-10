import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { isAdminEmail } from "@/shared/admin";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS,
  TIER_SCORE_RANGES, TIER_INFLUENCE_LABELS,
  type CredibilityTier,
} from "@/lib/data";
import { LinearGradient } from "expo-linear-gradient";
import { pct } from "@/lib/style-helpers";
import { useAuth } from "@/lib/auth-context";
import { ProfileSkeleton } from "@/components/Skeleton";
import { getApiUrl } from "@/lib/query-client";
import { fetchMemberProfile, fetchMemberImpact, deleteRatingApi, type ApiMemberProfile } from "@/lib/api";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { useBookmarks } from "@/lib/bookmarks-context";
import { useBadgeContext } from "@/lib/hooks/useBadgeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ScoreCountUp from "@/components/animations/ScoreCountUp";
import { FadeInView } from "@/components/animations/FadeInView";
import { SlideUpView } from "@/components/animations/SlideUpView";
import {
  TierBadge, HistoryRow, LoggedOutView,
  ImpactCard, PaymentHistoryRow, CredibilityJourney,
  TierRewardsSection, NotificationSettingsLink, LegalLinksSection,
} from "@/components/profile/SubComponents";
import { SavedPlacesSection } from "@/components/profile/SavedPlacesSection";
import { BadgeGridFull } from "@/components/profile/BadgeGrid";
import { OnboardingChecklist } from "@/components/profile/OnboardingChecklist";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { ProfileStatsCard } from "@/components/profile/ProfileStatsCard";
import { ScoreBreakdownCard } from "@/components/profile/ScoreBreakdownCard";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { RatingExportButton } from "@/components/profile/RatingExport";
import { BadgeDetailModal } from "@/components/badges/BadgeDetailModal";
import { type EarnedBadge } from "@/lib/badges";

const AMBER = BRAND.colors.amber;

function ProfileContent({ profile, refetch }: { profile: ApiMemberProfile; refetch: () => Promise<any> }) {

  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { savedList, bookmarkCount } = useBookmarks();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [selectedBadge, setSelectedBadge] = useState<EarnedBadge | null>(null);
  const [historyPageSize, setHistoryPageSize] = useState(10);

  const handleDeleteRating = useCallback(async (ratingId: string) => {
    try {
      await deleteRatingApi(ratingId);
      refetch();
    } catch (err: any) {
      // Error handling — show alert on failure
      const msg = err?.message || "Failed to delete rating";
      import("react-native").then(({ Alert }) => Alert.alert("Error", msg));
    }
  }, [refetch]);

  const { data: impact } = useQuery({
    queryKey: ["impact", profile.id],
    queryFn: fetchMemberImpact,
    staleTime: 60000,
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ["payments", profile.id],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/payments/history?limit=10`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 60000,
  });

  const tier = profile.credibilityTier as CredibilityTier;
  const tierColor = TIER_COLORS[tier];
  const scoreRange = TIER_SCORE_RANGES[tier];

  const nextTierMap: Record<string, CredibilityTier | null> = {
    community: "city", city: "trusted", trusted: "top", top: null,
  };
  const nextTier = nextTierMap[tier];
  const nextRange = nextTier ? TIER_SCORE_RANGES[nextTier] : null;
  const progressToNext = nextRange
    ? Math.min(((profile.credibilityScore - scoreRange.min) / (nextRange.min - scoreRange.min)) * 100, 100)
    : 100;

  const breakdown = profile.credibilityBreakdown;
  const totalScore = profile.credibilityScore;

  const { badges, earnedCount: earnedBadgeCount, totalPossible } = useBadgeContext(profile, tier, impact);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <>
    <ScrollView
      style={[styles.container, { paddingTop: topPad }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AMBER} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.push("/settings")} style={styles.logoutBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel="Open settings">
            <Ionicons name="settings-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <FadeInView delay={100} duration={500}>
      <LinearGradient
        colors={[BRAND.colors.navy, BRAND.colors.navyDark]}
        style={styles.profileCard}
      >
        <View style={styles.avatarCircle}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Text style={styles.avatarInitial}>{profile.displayName.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, styles.profileNameLight]}>{profile.displayName}</Text>
          <Text style={[styles.username, styles.usernameLight]}>@{profile.username}</Text>
          <View style={styles.badgeRow}>
            <TierBadge tier={tier} />
            {profile.isFoundingMember && (
              <View style={styles.foundingBadge}>
                <Text style={styles.foundingBadgeText}>FOUNDING MEMBER</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
      </FadeInView>

      {/* Sprint 185: Onboarding checklist for new users */}
      <OnboardingChecklist />

      <View style={styles.credibilityCard}>
        <View style={styles.credScoreRow}>
          <View>
            <Text style={styles.credScoreLabel}>Credibility</Text>
            <ScoreCountUp
              targetValue={profile.credibilityScore}
              duration={1000}
              decimalPlaces={0}
              style={[styles.credScore, { color: tierColor }]}
              highlightThreshold={999}
            />
          </View>
          <View style={styles.credWeightBox}>
            <Text style={styles.credWeightLabel}>{TIER_INFLUENCE_LABELS[tier]}</Text>
            <Text style={[styles.credWeight, { color: tierColor }]}>{TIER_DISPLAY_NAMES[tier]}</Text>
          </View>
        </View>

        {nextTier && nextRange && (
          <View style={styles.credProgress}>
            <View style={styles.credProgressHeader}>
              <Text style={styles.credProgressLabel}>
                Progress to {TIER_DISPLAY_NAMES[nextTier]}
              </Text>
              <Text style={styles.credProgressPct}>{Math.round(progressToNext)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: pct(progressToNext), backgroundColor: tierColor }]} />
            </View>
            <Text style={styles.credProgressHint}>
              {Math.max(nextRange.min - profile.credibilityScore, 0)} points to {TIER_DISPLAY_NAMES[nextTier]}
            </Text>
          </View>
        )}
      </View>

      {/* New User Getting Started */}
      {profile.totalRatings === 0 && (
        <TouchableOpacity
          style={styles.gettingStartedCard}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Find a place to rate"
        >
          <View style={styles.gettingStartedIcon}>
            <Ionicons name="restaurant" size={24} color={AMBER} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.gettingStartedTitle}>Rate Your First Place</Text>
            <Text style={styles.gettingStartedDesc}>
              Your influence grows with every honest rating. Find a restaurant you know well and share your experience.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={AMBER} />
        </TouchableOpacity>
      )}

      {/* Credibility Growth Prompt */}
      {nextTier && profile.totalRatings > 0 && (
        <View style={styles.growthPrompt}>
          <Ionicons name="trending-up" size={18} color={AMBER} />
          <Text style={styles.growthPromptText}>Keep rating to unlock your next tier</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{profile.totalRatings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Ratings</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statNum}>{profile.distinctBusinesses.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Places</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statNum}>{profile.totalCategories.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statNum}>{profile.daysActive.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <TouchableOpacity style={styles.statBox} onPress={() => router.push("/badge-leaderboard")} activeOpacity={0.7}>
          <Text style={[styles.statNum, { color: AMBER }]}>{earnedBadgeCount}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </TouchableOpacity>
      </View>

      {/* Sprint 358: Enhanced stats row — weight, streak, avg score */}
      <View style={styles.enhancedStatsRow}>
        <View style={styles.enhancedStatBox}>
          <Text style={[styles.enhancedStatNum, { color: tierColor }]}>{TIER_WEIGHTS[tier]}x</Text>
          <Text style={styles.enhancedStatLabel}>Weight</Text>
        </View>
        {(profile.currentStreak ?? 0) > 0 && (
          <View style={styles.enhancedStatBox}>
            <Text style={[styles.enhancedStatNum, { color: AMBER }]}>{profile.currentStreak}</Text>
            <Text style={styles.enhancedStatLabel}>Streak</Text>
          </View>
        )}
        {profile.ratingHistory.length > 0 && (
          <View style={styles.enhancedStatBox}>
            <Text style={styles.enhancedStatNum}>
              {(profile.ratingHistory.reduce((s, r) => s + r.rawScore, 0) / profile.ratingHistory.length).toFixed(1)}
            </Text>
            <Text style={styles.enhancedStatLabel}>Avg Given</Text>
          </View>
        )}
        {profile.joinedAt && (
          <View style={styles.enhancedStatBox}>
            <Text style={styles.enhancedStatNum}>
              {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
            </Text>
            <Text style={styles.enhancedStatLabel}>Joined</Text>
          </View>
        )}
      </View>

      {/* Sprint 393: Achievements & Milestones */}
      <AchievementsSection
        totalRatings={profile.totalRatings}
        distinctBusinesses={profile.distinctBusinesses}
        tier={tier}
        currentStreak={profile.currentStreak ?? 0}
        earnedBadgeCount={earnedBadgeCount}
        daysActive={profile.daysActive}
      />

      {/* Sprint 401: Profile Stats Dashboard */}
      <ProfileStatsCard
        ratingHistory={profile.ratingHistory}
        totalRatings={profile.totalRatings}
        daysActive={profile.daysActive}
      />

      {/* Sprint 419: Activity Feed Timeline */}
      <ActivityFeed ratings={profile.ratingHistory} tier={tier} />

      {/* Last Rating Consequence */}
      {impact?.lastRating && (
        <TouchableOpacity
          style={styles.lastRatingCard}
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: impact.lastRating!.businessSlug } })}
          activeOpacity={0.7}
        >
          <View style={styles.lastRatingHeader}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
            <Text style={styles.lastRatingTitle}>Your Last Rating</Text>
          </View>
          <Text style={styles.lastRatingBizName} numberOfLines={1}>
            {impact.lastRating.businessName}
          </Text>
          <Text style={styles.lastRatingDetail}>
            Score {parseFloat(impact.lastRating.rawScore).toFixed(1)} {"\u00B7"} {TIER_INFLUENCE_LABELS[tier]}
          </Text>
        </TouchableOpacity>
      )}

      {/* Your Impact */}
      {impact && impact.businessesMovedUp > 0 && (
        <ImpactCard impact={impact} city={profile.city} />
      )}

      {/* Sprint 406: Extracted breakdown card */}
      <ScoreBreakdownCard
        totalRatings={profile.totalRatings}
        breakdown={breakdown}
        totalScore={totalScore}
        tierColor={tierColor}
      />

      <SlideUpView delay={200} distance={24}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rating History</Text>
        <Text style={styles.sectionCount}>{profile.ratingHistory.length}</Text>
      </View>

      {/* Sprint 433: Rating history CSV export */}
      {profile.ratingHistory.length > 0 && (
        <RatingExportButton ratings={profile.ratingHistory} username={profile.username} />
      )}

      {profile.ratingHistory.slice(0, historyPageSize).map((r: any) => (
        <HistoryRow key={r.id} r={r} onDelete={handleDeleteRating} />
      ))}

      {profile.ratingHistory.length > historyPageSize && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => setHistoryPageSize(prev => prev + 10)}
          accessibilityRole="button"
          accessibilityLabel={`Show more ratings (${profile.ratingHistory.length - historyPageSize} remaining)`}
        >
          <Text style={styles.showMoreText}>
            Show More ({profile.ratingHistory.length - historyPageSize} remaining)
          </Text>
          <Ionicons name="chevron-down" size={14} color={AMBER} />
        </TouchableOpacity>
      )}

      {historyPageSize > 10 && profile.ratingHistory.length > 10 && (
        <TouchableOpacity
          style={styles.showLessBtn}
          onPress={() => setHistoryPageSize(10)}
          accessibilityRole="button"
          accessibilityLabel="Show fewer ratings"
        >
          <Text style={styles.showLessText}>Show Less</Text>
          <Ionicons name="chevron-up" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}

      {profile.ratingHistory.length === 0 && (
        <TouchableOpacity
          style={styles.emptyHistory}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.7}
        >
          <Ionicons name="star-outline" size={32} color={AMBER} />
          <Text style={styles.emptyText}>No ratings yet</Text>
          <Text style={styles.emptySubtext}>
            Your first rating builds your credibility and shapes the rankings
          </Text>
          <View style={styles.emptyCtaRow}>
            <Text style={styles.emptyCtaText}>Find a place to rate</Text>
            <Ionicons name="arrow-forward" size={14} color={AMBER} />
          </View>
        </TouchableOpacity>
      )}
      </SlideUpView>

      {/* Saved Places — extracted component (Sprint 377) */}
      <SavedPlacesSection savedList={savedList} bookmarkCount={bookmarkCount} />

      {/* Payment History */}
      {paymentHistory && paymentHistory.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <Text style={styles.sectionCount}>{paymentHistory.length}</Text>
          </View>
          {paymentHistory.map((p: any) => (
            <PaymentHistoryRow key={p.id} p={p} />
          ))}
        </>
      )}

      <CredibilityJourney currentTier={tier} credibilityScore={profile.credibilityScore} totalRatings={profile.totalRatings} />

      {/* Achievement Badges */}
      <BadgeGridFull
        badges={badges}
        totalPossible={totalPossible}
        title="Achievement Badges"
        onBadgePress={setSelectedBadge}
      />

      <TierRewardsSection tier={tier} />

      {/* Invite Friends */}
      <TouchableOpacity
        style={styles.adminLink}
        onPress={() => router.push("/referral")}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Invite friends"
      >
        <Ionicons name="people-outline" size={14} color={BRAND.colors.amber} />
        <Text style={styles.adminLinkText}>Invite Friends</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
      </TouchableOpacity>

      {/* Admin Panel */}
      {profile && isAdminEmail(profile.email) && (
        <TouchableOpacity
          style={styles.adminLink}
          onPress={() => router.push("/admin")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open admin panel"
        >
          <Ionicons name="shield-checkmark" size={14} color={BRAND.colors.amber} />
          <Text style={styles.adminLinkText}>Admin Panel</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}

      <NotificationSettingsLink />

      <LegalLinksSection />
    </ScrollView>

    <BadgeDetailModal
      badge={selectedBadge}
      userName={profile.displayName || profile.username || "TopRanker"}
      onClose={() => setSelectedBadge(null)}
    />
  </>
  );
}

export default function ProfileScreen() {

  const { user, isLoading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading, isError, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchMemberProfile(),
    enabled: !!user,
    staleTime: 30000,
  });

  if (authLoading) {
    return (
      <View style={[styles.container]}>
        <ProfileSkeleton />
      </View>
    );
  }

  if (!user) {
    return <LoggedOutView />;
  }

  if (isError) {
    return (
      <View style={[styles.errorContainer]}>
        <Ionicons name="cloud-offline-outline" size={36} color={Colors.textTertiary} />
        <Text style={styles.errorTitle}>Couldn't load your profile</Text>
        <Text style={styles.errorSubtitle}>Check your connection and try again</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Retry loading profile">
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profileLoading || !profile) {
    return (
      <View style={[styles.container]}>
        <ProfileSkeleton />
      </View>
    );
  }

  return <ErrorBoundary><ProfileContent profile={profile} refetch={refetch} /></ErrorBoundary>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorContainer: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  errorTitle: {
    fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold",
  },
  errorSubtitle: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  retryButton: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: AMBER, borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold",
  },
  content: { paddingHorizontal: 16, gap: 12 },
  header: {
    paddingTop: 4, paddingBottom: 4,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  title: {
    fontSize: 28, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  adminLink: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 20, marginBottom: 12,
  },
  adminLinkText: {
    flex: 1, fontSize: 14, fontWeight: "600", color: BRAND.colors.amber,
    fontFamily: "DMSans_600SemiBold",
  },

  // Profile card
  profileCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    ...Colors.cardShadow,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 28 },
  avatarInitial: { fontSize: 24, fontWeight: "700", color: "#fff", fontFamily: "PlayfairDisplay_700Bold" },
  foundingBadge: {
    backgroundColor: `${Colors.gold}20`, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: `${Colors.gold}40`,
  },
  foundingBadgeText: {
    fontSize: 8, fontWeight: "700", color: Colors.gold,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.5,
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileInfo: { gap: 4 },
  profileName: {
    fontSize: 20, fontWeight: "700", color: Colors.text,
    fontFamily: "DMSans_700Bold", letterSpacing: -0.3,
  },
  profileNameLight: { color: "#fff", fontFamily: "PlayfairDisplay_700Bold" },
  username: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  usernameLight: { color: "rgba(255,255,255,0.5)" },

  // Credibility card
  credibilityCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    gap: 14, ...Colors.cardShadow,
  },
  credScoreRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  credScoreLabel: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, letterSpacing: 0.5, textTransform: "uppercase" as const },
  credScore: { fontSize: 48, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -2 },
  credWeightBox: { alignItems: "center", gap: 2 },
  credWeightLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  credWeight: { fontSize: 24, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold" },
  credProgress: { gap: 6 },
  credProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  credProgressLabel: { ...TYPOGRAPHY.ui.label, color: Colors.textSecondary },
  credProgressPct: { fontSize: 12, fontWeight: "700", color: Colors.gold, fontFamily: "DMSans_700Bold" },
  progressBarBg: { height: 4, backgroundColor: Colors.surfaceRaised, borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 2 },
  credProgressHint: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginTop: 4 },

  // Stats row
  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(13,27,42,0.9)", borderRadius: 14,
    overflow: "hidden",
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statNum: { fontSize: 24, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },

  joinedText: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, textAlign: "center" },

  // Sprint 358: Enhanced stats
  enhancedStatsRow: {
    flexDirection: "row", justifyContent: "space-evenly",
    paddingVertical: 8, paddingHorizontal: 12, marginTop: 4,
  },
  enhancedStatBox: { alignItems: "center", gap: 2, minWidth: 60 },
  enhancedStatNum: {
    fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  enhancedStatLabel: {
    fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textTransform: "uppercase" as const, letterSpacing: 0.5,
  },

  // Last rating
  lastRatingCard: {
    backgroundColor: `${BRAND.colors.amber}08`, borderRadius: 14, padding: 16,
    gap: 6, borderWidth: 1, borderColor: `${BRAND.colors.amber}20`,
  },
  lastRatingHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  lastRatingTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  lastRatingBizName: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  lastRatingDetail: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },

  // Section headers
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  sectionCount: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  // Empty states
  emptyHistory: { alignItems: "center", paddingVertical: 40, gap: 8 },
  showMoreBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 12, marginTop: 4,
    backgroundColor: `${AMBER}08`, borderRadius: 10,
  },
  showMoreText: { fontSize: 13, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
  showLessBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 8,
  },
  showLessText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  emptyCtaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  emptyCtaText: { fontSize: 13, fontWeight: "600", color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold" },

  // Getting started / growth prompt
  gettingStartedCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: `${BRAND.colors.amber}10`, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: `${BRAND.colors.amber}25`,
    marginHorizontal: 16, marginTop: 16,
  },
  gettingStartedIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: `${BRAND.colors.amber}15`,
    alignItems: "center", justifyContent: "center",
  },
  gettingStartedTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  gettingStartedDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 17 },
  growthPrompt: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(196,154,26,0.08)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
    borderRadius: 10, padding: 14,
    marginHorizontal: 16, marginTop: 12,
  },
  growthPromptText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium" },
});
