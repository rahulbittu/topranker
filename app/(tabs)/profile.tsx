import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import {
  TIER_COLORS, TIER_INFLUENCE_LABELS,
  type CredibilityTier,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { ProfileSkeleton } from "@/components/Skeleton";
import { getApiUrl } from "@/lib/query-client";
import { fetchMemberProfile, fetchMemberImpact, deleteRatingApi, type ApiMemberProfile } from "@/lib/api";
import { BRAND } from "@/constants/brand";
import { useBookmarks } from "@/lib/bookmarks-context";
import { useBadgeContext } from "@/lib/hooks/useBadgeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FadeInView } from "@/components/animations/FadeInView";
import { ProfileCredibilitySection } from "@/components/profile/ProfileCredibilitySection";
import {
  LoggedOutView,
  ImpactCard,
} from "@/components/profile/SubComponents";
import { SavedPlacesSection } from "@/components/profile/SavedPlacesSection";
import { OnboardingChecklist } from "@/components/profile/OnboardingChecklist";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { ProfileBottomSection } from "@/components/profile/ProfileBottomSection";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { TierProgressNotification } from "@/components/profile/TierProgressNotification";
import { DishVoteStreakCard } from "@/components/profile/DishVoteStreakCard";
import { ProfileStatsCard } from "@/components/profile/ProfileStatsCard";
import { ScoreBreakdownCard } from "@/components/profile/ScoreBreakdownCard";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { ActivityTimeline } from "@/components/profile/ActivityTimeline";
import { RatingHistorySection } from "@/components/profile/RatingHistorySection";
import { BadgeDetailModal } from "@/components/badges/BadgeDetailModal";
import { type EarnedBadge } from "@/lib/badges";

const AMBER = BRAND.colors.amber;

function ProfileContent({ profile, refetch }: { profile: ApiMemberProfile; refetch: () => Promise<any> }) {

  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { savedList, bookmarkCount } = useBookmarks();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [selectedBadge, setSelectedBadge] = useState<EarnedBadge | null>(null);
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

      {/* Sprint 584: Extracted identity card */}
      <ProfileIdentityCard
        displayName={profile.displayName}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        tier={tier}
        isFoundingMember={profile.isFoundingMember}
      />

      {/* Sprint 185: Onboarding checklist for new users */}
      <OnboardingChecklist />

      {/* Sprint 536: Extracted credibility card, stats, getting started, growth prompt */}
      <ProfileCredibilitySection
        tier={tier}
        credibilityScore={profile.credibilityScore}
        credibilityBreakdown={breakdown}
        totalRatings={profile.totalRatings}
        distinctBusinesses={profile.distinctBusinesses}
        totalCategories={profile.totalCategories}
        daysActive={profile.daysActive}
        earnedBadgeCount={earnedBadgeCount}
        ratingHistory={profile.ratingHistory}
        currentStreak={profile.currentStreak ?? 0}
        joinedAt={profile.joinedAt}
      />

      {/* Sprint 573: Tier progress notification */}
      <TierProgressNotification
        tier={tier}
        credibilityScore={profile.credibilityScore}
        totalRatings={profile.totalRatings}
        delay={200}
      />

      {/* Sprint 393: Achievements & Milestones */}
      <AchievementsSection
        totalRatings={profile.totalRatings}
        distinctBusinesses={profile.distinctBusinesses}
        tier={tier}
        currentStreak={profile.currentStreak ?? 0}
        earnedBadgeCount={earnedBadgeCount}
        daysActive={profile.daysActive}
      />

      {/* Sprint 574: Dish vote streak tracking */}
      <DishVoteStreakCard
        currentStreak={profile.dishVoteStreak ?? 0}
        longestStreak={profile.longestDishStreak ?? 0}
        totalDishVotes={profile.totalDishVotes ?? 0}
        topDish={profile.topDish}
        delay={250}
      />

      {/* Sprint 401: Profile Stats Dashboard */}
      <ProfileStatsCard
        ratingHistory={profile.ratingHistory}
        totalRatings={profile.totalRatings}
        daysActive={profile.daysActive}
      />

      {/* Sprint 437: Unified Activity Timeline (replaces Sprint 419 ActivityFeed) */}
      <ActivityTimeline
        ratings={profile.ratingHistory}
        bookmarks={savedList}
        achievements={badges.filter(b => b.progress >= 100).map(b => ({
          id: b.badge.id,
          label: b.badge.name,
          earnedAt: b.earnedAt,
        }))}
      />

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

      {/* Sprint 443: Extracted rating history to standalone component */}
      <RatingHistorySection
        ratingHistory={profile.ratingHistory}
        username={profile.username}
        onDelete={handleDeleteRating}
      />

      {/* Saved Places — extracted component (Sprint 377) */}
      <SavedPlacesSection savedList={savedList} bookmarkCount={bookmarkCount} />

      {/* Sprint 584: Extracted bottom section */}
      <ProfileBottomSection
        tier={tier}
        credibilityScore={profile.credibilityScore}
        totalRatings={profile.totalRatings}
        email={profile.email}
        paymentHistory={paymentHistory || []}
        badges={badges}
        totalPossible={totalPossible}
        onBadgePress={setSelectedBadge}
      />
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
  // Sprint 584: profileCard, avatar, badge styles moved to ProfileIdentityCard
  // Sprint 584: adminLink, sectionHeader styles moved to ProfileBottomSection

  // Last rating
  lastRatingCard: {
    backgroundColor: `${BRAND.colors.amber}08`, borderRadius: 14, padding: 16,
    gap: 6, borderWidth: 1, borderColor: `${BRAND.colors.amber}20`,
  },
  lastRatingHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  lastRatingTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  lastRatingBizName: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  lastRatingDetail: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },

  // Sprint 443: emptyHistory, showMore/Less, emptyText styles moved to RatingHistorySection
  // Sprint 536: getting started + growth prompt — moved to ProfileCredibilitySection
});
