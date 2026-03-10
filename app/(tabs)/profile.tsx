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
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_INFLUENCE_LABELS,
  type CredibilityTier,
} from "@/lib/data";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/lib/auth-context";
import { ProfileSkeleton } from "@/components/Skeleton";
import { getApiUrl } from "@/lib/query-client";
import { fetchMemberProfile, fetchMemberImpact, deleteRatingApi, type ApiMemberProfile } from "@/lib/api";
import { BRAND } from "@/constants/brand";
import { useBookmarks } from "@/lib/bookmarks-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FadeInView } from "@/components/animations/FadeInView";
import { ProfileCredibilitySection } from "@/components/profile/ProfileCredibilitySection";
import {
  TierBadge, LoggedOutView,
  ImpactCard, PaymentHistoryRow, CredibilityJourney,
  TierRewardsSection, LegalLinksSection,
} from "@/components/profile/SubComponents";
import { NotificationPreferencesCard } from "@/components/profile/NotificationPreferencesCard";
import { SavedPlacesSection } from "@/components/profile/SavedPlacesSection";
import { RatingHistorySection } from "@/components/profile/RatingHistorySection";

const AMBER = BRAND.colors.amber;

function ProfileContent({ profile, refetch }: { profile: ApiMemberProfile; refetch: () => Promise<any> }) {

  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { savedList, bookmarkCount } = useBookmarks();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
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

      {/* Credibility — the one number that matters */}
      <ProfileCredibilitySection
        tier={tier}
        credibilityScore={profile.credibilityScore}
        credibilityBreakdown={profile.credibilityBreakdown}
        totalRatings={profile.totalRatings}
        distinctBusinesses={profile.distinctBusinesses}
        totalCategories={profile.totalCategories}
        daysActive={profile.daysActive}
        earnedBadgeCount={0}
        ratingHistory={profile.ratingHistory}
        currentStreak={profile.currentStreak ?? 0}
        joinedAt={profile.joinedAt}
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

      {/* Rating History — your contribution record */}
      <RatingHistorySection
        ratingHistory={profile.ratingHistory}
        username={profile.username}
        onDelete={handleDeleteRating}
      />

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

      <NotificationPreferencesCard />

      <LegalLinksSection />
    </ScrollView>
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

  // Sprint 536: credibility card, stats row, enhanced stats — moved to ProfileCredibilitySection

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

  // Sprint 443: emptyHistory, showMore/Less, emptyText styles moved to RatingHistorySection

  // Sprint 536: getting started + growth prompt — moved to ProfileCredibilitySection
});
