import React, { useState, useCallback } from "react";
import { track } from "@/lib/analytics";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, RefreshControl, Alert, Switch,
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
  TIER_SCORE_RANGES, formatTimeAgo,
  type CredibilityTier,
} from "@/lib/data";
import { LinearGradient } from "expo-linear-gradient";
import { pct } from "@/lib/style-helpers";
import { useAuth } from "@/lib/auth-context";
import { ProfileSkeleton } from "@/components/Skeleton";
import { getApiUrl } from "@/lib/query-client";
import { fetchMemberProfile, fetchMemberImpact, type ApiMemberProfile, type ApiMemberImpact } from "@/lib/api";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { useBookmarks } from "@/lib/bookmarks-context";
import { getUnlockedPerks, getNextTierPerks } from "@/lib/tier-perks";
import { useBadgeContext } from "@/lib/hooks/useBadgeContext";
import { TypedIcon } from "@/components/TypedIcon";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TierBadge, HistoryRow, BreakdownRow, SavedRow, LoggedOutView } from "@/components/profile/SubComponents";
import { BadgeGridFull } from "@/components/profile/BadgeGrid";
import { BadgeDetailModal } from "@/components/badges/BadgeDetailModal";
import { type EarnedBadge } from "@/lib/badges";

const AMBER = BRAND.colors.amber;

function ProfileContent({ profile, refetch }: { profile: ApiMemberProfile; refetch: () => Promise<any> }) {

  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { savedList, bookmarkCount } = useBookmarks();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [selectedBadge, setSelectedBadge] = useState<EarnedBadge | null>(null);
  const [notifRatingUpdates, setNotifRatingUpdates] = useState(true);
  const [notifChallengeResults, setNotifChallengeResults] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);

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
  const weight = TIER_WEIGHTS[tier];
  const scoreRange = TIER_SCORE_RANGES[tier];

  const nextTierMap: Record<string, CredibilityTier | null> = {
    community: "city",
    city: "trusted",
    trusted: "top",
    top: null,
  };
  const nextTier = nextTierMap[tier];
  const nextRange = nextTier ? TIER_SCORE_RANGES[nextTier] : null;
  const progressToNext = nextRange
    ? Math.min(((profile.credibilityScore - scoreRange.min) / (nextRange.min - scoreRange.min)) * 100, 100)
    : 100;

  const breakdown = profile.credibilityBreakdown;
  const totalScore = profile.credibilityScore;

  // Shared badge context — used for both stats count and badge grid
  const { badges, earnedCount: earnedBadgeCount, totalPossible } = useBadgeContext(profile, tier, impact);

  const saveNotifPref = useCallback(async (key: string, value: boolean) => {
    const newPrefs = {
      ratingUpdates: key === "ratingUpdates" ? value : notifRatingUpdates,
      challengeResults: key === "challengeResults" ? value : notifChallengeResults,
      weeklyDigest: key === "weeklyDigest" ? value : notifWeeklyDigest,
    };
    if (key === "ratingUpdates") setNotifRatingUpdates(value);
    if (key === "challengeResults") setNotifChallengeResults(value);
    if (key === "weeklyDigest") setNotifWeeklyDigest(value);
    track("notification_settings_change", { setting: key, enabled: value });
    try {
      await fetch(getApiUrl("/api/members/me/notification-preferences"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPrefs),
      });
    } catch {}
  }, [notifRatingUpdates, notifChallengeResults, notifWeeklyDigest]);

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

      <View style={styles.credibilityCard}>
        <View style={styles.credScoreRow}>
          <View>
            <Text style={styles.credScoreLabel}>Credibility Score</Text>
            <Text style={[styles.credScore, { color: tierColor }]}>{profile.credibilityScore}</Text>
          </View>
          <View style={styles.credWeightBox}>
            <Text style={styles.credWeightLabel}>Vote Weight</Text>
            <Text style={[styles.credWeight, { color: tierColor }]}>{weight.toFixed(2)}x</Text>
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

      {/* Credibility Growth Prompt */}
      {nextTier && (
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

      {profile.joinedAt && (
        <Text style={styles.joinedText}>
          Member since {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </Text>
      )}

      {/* Pride Mechanism — PRD: "Your ratings contributed to X businesses moving up" */}
      {impact && impact.businessesMovedUp > 0 && (
        <View style={styles.prideCard}>
          <View style={styles.prideHeader}>
            <Ionicons name="trending-up" size={18} color={Colors.green} />
            <Text style={styles.prideTitle}>Your Impact</Text>
          </View>
          <Text style={styles.prideText}>
            Your ratings contributed to {impact.businessesMovedUp} business{impact.businessesMovedUp !== 1 ? "es" : ""} moving up in the {profile.city} rankings.
          </Text>
          {impact.topContributions.length > 0 && (
            <View style={styles.prideList}>
              {impact.topContributions.map(c => (
                <TouchableOpacity
                  key={c.slug}
                  style={styles.prideItem}
                  onPress={() => router.push({ pathname: "/business/[id]", params: { id: c.slug } })}
                  activeOpacity={0.7}
                  accessibilityRole="link"
                  accessibilityLabel={`${c.name}, moved up ${c.rankChange}`}
                >
                  <Text style={styles.prideItemName} numberOfLines={1}>{c.name}</Text>
                  <View style={styles.prideItemDelta}>
                    <Ionicons name="arrow-up" size={10} color={Colors.green} />
                    <Text style={styles.prideItemDeltaText}>{c.rankChange}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Score Breakdown</Text>
        <BreakdownRow label="Base points" value={`+${breakdown.base || 0}`} icon="person-outline" />
        <BreakdownRow label="Rating volume" value={`+${breakdown.volume || 0}`} icon="star-outline" />
        <BreakdownRow label="Category diversity" value={`+${breakdown.diversity || 0}`} icon="grid-outline" />
        <BreakdownRow label="Account age" value={`+${Math.round(breakdown.age || 0)}`} icon="time-outline" />
        <BreakdownRow label="Rating variance" value={`+${Math.round(breakdown.variance || 0)}`} icon="analytics-outline" />
        <BreakdownRow label="Helpfulness" value={`+${breakdown.helpfulness || 0}`} icon="hand-left-outline" />
        {(breakdown.penalties || 0) > 0 && (
          <BreakdownRow label="Flag penalties" value={`-${breakdown.penalties}`} icon="flag-outline" />
        )}
        <View style={styles.breakdownTotal}>
          <Text style={styles.breakdownTotalLabel}>Total</Text>
          <Text style={[styles.breakdownTotalValue, { color: tierColor }]}>
            {totalScore}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rating History</Text>
        <Text style={styles.sectionCount}>{profile.ratingHistory.length}</Text>
      </View>

      {profile.ratingHistory.map((r: any) => (
        <HistoryRow key={r.id} r={r} />
      ))}

      {profile.ratingHistory.length === 0 && (
        <View style={styles.emptyHistory}>
          <Ionicons name="star-outline" size={32} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No ratings yet</Text>
          <Text style={styles.emptySubtext}>Rate businesses to build your credibility</Text>
        </View>
      )}

      {/* Saved Places */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved Places</Text>
        <Text style={styles.sectionCount}>{bookmarkCount}</Text>
        {bookmarkCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/saved")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View all saved places"
          >
            <Text style={{ fontSize: 12, color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold" }}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {savedList.length > 0 ? (
        savedList.slice(0, 10).map(entry => (
          <SavedRow key={entry.id} entry={entry} />
        ))
      ) : (
        <View style={styles.emptyHistory}>
          <Ionicons name="bookmark-outline" size={28} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No saved places yet</Text>
          <Text style={styles.emptySubtext}>Tap the bookmark icon on any business to save it</Text>
        </View>
      )}

      {/* Payment History */}
      {paymentHistory && paymentHistory.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <Text style={styles.sectionCount}>{paymentHistory.length}</Text>
          </View>
          {paymentHistory.map((p: any) => (
            <View key={p.id} style={styles.paymentRow}>
              <View style={styles.paymentIconWrap}>
                <Ionicons
                  name={p.type === "challenger_entry" ? "flash" : p.type === "featured_placement" ? "megaphone" : "speedometer"}
                  size={16}
                  color={p.status === "succeeded" ? AMBER : p.status === "failed" ? "#E53E3E" : Colors.textTertiary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentType}>
                  {p.type === "challenger_entry" ? "Challenger Entry" : p.type === "dashboard_pro" ? "Dashboard Pro" : "Featured Placement"}
                </Text>
                <Text style={styles.paymentDate}>
                  {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.paymentAmount}>${(p.amount / 100).toFixed(2)}</Text>
                <Text style={[styles.paymentStatus, {
                  color: p.status === "succeeded" ? Colors.green : p.status === "failed" ? "#E53E3E" : Colors.textTertiary,
                }]}>
                  {p.status}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={styles.tierInfoSection}>
        <Text style={styles.sectionTitle}>Credibility Journey</Text>
        <View style={styles.tierList}>
          {(["community", "city", "trusted", "top"] as CredibilityTier[]).map((t, idx, arr) => {
            const tierOrder = arr.indexOf(tier);
            const isCompleted = idx < tierOrder;
            const isCurrent = t === tier;
            return (
              <View key={t}>
                <View style={[styles.tierRow, isCurrent && styles.tierRowActive]}>
                  <View style={[
                    styles.tierDot,
                    { backgroundColor: isCompleted || isCurrent ? TIER_COLORS[t] : Colors.border },
                  ]}>
                    {isCompleted && <Ionicons name="checkmark" size={8} color="#fff" />}
                  </View>
                  <View style={styles.tierRowInfo}>
                    <Text style={[styles.tierName, (isCurrent || isCompleted) && { color: Colors.text }]}>
                      {TIER_DISPLAY_NAMES[t]}
                    </Text>
                    <Text style={styles.tierWeight}>{TIER_WEIGHTS[t].toFixed(2)}x weight</Text>
                  </View>
                  <Text style={styles.tierRange}>
                    {TIER_SCORE_RANGES[t].min}–{TIER_SCORE_RANGES[t].max}
                  </Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>YOU</Text>
                    </View>
                  )}
                </View>
                {idx < arr.length - 1 && (
                  <View style={[styles.tierConnector, {
                    backgroundColor: isCompleted ? TIER_COLORS[t] : Colors.border,
                  }]} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Achievement Badges — Apple Fitness-style, CVO owned */}
      <BadgeGridFull
        badges={badges}
        totalPossible={totalPossible}
        title="Achievement Badges"
        onBadgePress={setSelectedBadge}
      />

      {/* Tier Rewards — What you've unlocked & what's next */}
      <View style={styles.tierInfoSection}>
        <Text style={styles.sectionTitle}>Your Rewards</Text>
        <View style={styles.perksGrid}>
          {getUnlockedPerks(tier).map((perk) => (
            <View key={perk.id} style={styles.perkItem}>
              <View style={styles.perkIconWrap}>
                <TypedIcon name={perk.icon} size={16} color={AMBER} />
              </View>
              <View style={styles.perkInfo}>
                <Text style={styles.perkTitle}>{perk.title}</Text>
                <Text style={styles.perkDesc} numberOfLines={1}>{perk.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
            </View>
          ))}
        </View>

        {/* Next tier preview */}
        {(() => {
          const next = getNextTierPerks(tier);
          if (!next) return null;
          return (
            <View style={styles.nextTierPreview}>
              <Text style={styles.nextTierLabel}>
                Unlock with {TIER_DISPLAY_NAMES[next.nextTier]}
              </Text>
              {next.perks.slice(0, 3).map((perk) => (
                <View key={perk.id} style={[styles.perkItem, styles.perkItemLocked]}>
                  <View style={[styles.perkIconWrap, styles.perkIconLocked]}>
                    <TypedIcon name={perk.icon} size={16} color={Colors.textTertiary} />
                  </View>
                  <View style={styles.perkInfo}>
                    <Text style={[styles.perkTitle, styles.perkTitleLocked]}>{perk.title}</Text>
                    <Text style={styles.perkDesc} numberOfLines={1}>{perk.description}</Text>
                  </View>
                  <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
                </View>
              ))}
            </View>
          );
        })()}
      </View>

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

      {/* Admin Panel — for admins only */}
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

      {/* Notification Preferences */}
      <View style={styles.notifCard}>
        <View style={styles.notifHeader}>
          <Ionicons name="notifications-outline" size={16} color={Colors.text} />
          <Text style={styles.notifHeaderText}>Notifications</Text>
        </View>
        <View style={styles.notifRow}>
          <View style={styles.notifLabelWrap}>
            <Text style={styles.notifLabel}>Rating updates</Text>
            <Text style={styles.notifDesc}>When someone rates a business you own</Text>
          </View>
          <Switch
            value={notifRatingUpdates}
            onValueChange={(v) => saveNotifPref("ratingUpdates", v)}
            trackColor={{ false: Colors.border, true: AMBER }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.notifSep} />
        <View style={styles.notifRow}>
          <View style={styles.notifLabelWrap}>
            <Text style={styles.notifLabel}>Challenge results</Text>
            <Text style={styles.notifDesc}>Challenger competition updates</Text>
          </View>
          <Switch
            value={notifChallengeResults}
            onValueChange={(v) => saveNotifPref("challengeResults", v)}
            trackColor={{ false: Colors.border, true: AMBER }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.notifSep} />
        <View style={styles.notifRow}>
          <View style={styles.notifLabelWrap}>
            <Text style={styles.notifLabel}>Weekly digest</Text>
            <Text style={styles.notifDesc}>Weekly email with top rankings</Text>
          </View>
          <Switch
            value={notifWeeklyDigest}
            onValueChange={(v) => saveNotifPref("weeklyDigest", v)}
            trackColor={{ false: Colors.border, true: AMBER }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Legal Links */}
      <View style={styles.legalLinks}>
        <TouchableOpacity
          style={styles.legalLink}
          onPress={() => router.push("/legal/terms")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Terms of Service"
        >
          <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.legalLinkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.legalLink}
          onPress={() => router.push("/legal/privacy")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Privacy Policy"
        >
          <Ionicons name="shield-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.legalLinkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.legalLink}
          onPress={() => router.push("/legal/accessibility")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Accessibility Statement"
        >
          <Ionicons name="accessibility-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.legalLinkText}>Accessibility</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Delete Account — App Store requirement */}
      <TouchableOpacity
        style={styles.deleteAccountBtn}
        onPress={() => {
          Alert.alert(
            "Delete Account",
            "This will permanently delete your account and all your ratings within 30 days. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete My Account",
                style: "destructive",
                onPress: () => {
                  Alert.alert("Account Deletion Requested", "Your account will be deleted within 30 days. You will receive an email confirmation.");
                },
              },
            ]
          );
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Delete your account"
      >
        <Ionicons name="trash-outline" size={14} color={Colors.red} />
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
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
  legalLinks: {
    marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border,
    marginHorizontal: 20, gap: 2,
  },
  legalLink: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10,
  },
  legalLinkText: {
    flex: 1, ...TYPOGRAPHY.ui.body, color: Colors.textSecondary,
  },
  deleteAccountBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 24, paddingVertical: 12,
  },
  deleteAccountText: {
    fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium",
  },

  // ===== Logged In =====
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

  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(13,27,42,0.9)", borderRadius: 14,
    overflow: "hidden",
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statNum: { fontSize: 24, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },

  joinedText: {
    ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary,
    textAlign: "center",
  },

  prideCard: {
    backgroundColor: `${Colors.green}08`, borderRadius: 14, padding: 16,
    gap: 10, borderWidth: 1, borderColor: `${Colors.green}20`,
  },
  prideHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  prideTitle: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  prideText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18,
  },
  prideList: { gap: 6, marginTop: 4 },
  prideItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: Colors.surface, borderRadius: 8,
  },
  prideItemName: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", flex: 1, marginRight: 8,
  },
  prideItemDelta: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: `${Colors.green}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  prideItemDeltaText: {
    fontSize: 11, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold",
  },

  breakdownCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    gap: 10, ...Colors.cardShadow,
  },
  breakdownTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", marginBottom: 2 },
  breakdownTotal: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 6, marginTop: 2,
  },
  breakdownTotalLabel: { ...TYPOGRAPHY.ui.bodyBold, fontWeight: "700", color: Colors.text },
  breakdownTotalValue: { fontSize: 20, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold" },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  sectionCount: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  emptyHistory: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  tierInfoSection: { gap: 10, marginTop: 8 },
  tierList: {
    backgroundColor: Colors.surface, borderRadius: 14,
    overflow: "hidden", ...Colors.cardShadow,
  },
  tierRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tierRowActive: { backgroundColor: Colors.goldFaint },
  tierDot: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tierConnector: { width: 2, height: 16, marginLeft: 19, borderRadius: 1 },
  tierRowInfo: { flex: 1, gap: 1 },
  tierName: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  tierWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  tierRange: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  currentBadge: {
    backgroundColor: Colors.goldFaint,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  currentBadgeText: { fontSize: 8, fontWeight: "700", color: Colors.gold, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },

  // Tier Perks
  perksGrid: {
    backgroundColor: Colors.surface, borderRadius: 14,
    overflow: "hidden", ...Colors.cardShadow,
  },
  perkItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  perkItemLocked: { opacity: 0.6 },
  perkIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.goldFaint,
    alignItems: "center", justifyContent: "center",
  },
  perkIconLocked: { backgroundColor: Colors.surfaceRaised },
  perkInfo: { flex: 1, gap: 1 },
  perkTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  perkTitleLocked: { color: Colors.textTertiary },
  perkDesc: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  nextTierPreview: {
    marginTop: 8, gap: 0,
    backgroundColor: Colors.surface, borderRadius: 14,
    overflow: "hidden", ...Colors.cardShadow,
  },
  nextTierLabel: {
    fontSize: 11, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1,
    textTransform: "uppercase" as const,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4,
  },

  // Credibility Growth Prompt
  growthPrompt: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(196,154,26,0.08)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
    borderRadius: 10, padding: 14,
    marginHorizontal: 16, marginTop: 12,
  },
  growthPromptText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium",
  },

  // Payment History
  paymentRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  paymentIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(196,154,26,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  paymentType: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  paymentDate: {
    ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginTop: 2,
  },
  paymentAmount: {
    ...TYPOGRAPHY.ui.bodyBold, fontWeight: "700", color: Colors.text,
  },
  paymentStatus: {
    fontSize: 10, fontFamily: "DMSans_500Medium", marginTop: 2,
    textTransform: "capitalize" as const,
  },

  // Notification Preferences
  notifCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginTop: 16, gap: 0,
  },
  notifHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14,
  },
  notifHeaderText: {
    fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  notifRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 6,
  },
  notifLabelWrap: { flex: 1, marginRight: 12 },
  notifLabel: {
    fontSize: 14, color: Colors.text, fontFamily: "DMSans_400Regular",
  },
  notifDesc: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2,
  },
  notifSep: {
    height: 1, backgroundColor: Colors.border, marginVertical: 4,
  },
});
