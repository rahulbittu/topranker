import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, TextInput, RefreshControl, Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_WEIGHTS,
  TIER_SCORE_RANGES, formatTimeAgo,
  type CredibilityTier,
} from "@/lib/data";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/lib/auth-context";
import { ProfileSkeleton } from "@/components/Skeleton";
import { fetchMemberProfile, fetchMemberImpact, type ApiMemberProfile, type ApiMemberImpact } from "@/lib/api";
import { AppLogo } from "@/components/Logo";
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import { signInWithGoogle, isGoogleAuthAvailable } from "@/lib/google-auth";
import { useBookmarks, type BookmarkEntry } from "@/lib/bookmarks-context";
import { getUnlockedPerks, getNextTierPerks } from "@/lib/tier-perks";

const AMBER = BRAND.colors.amber;

function TierBadge({ tier }: { tier: CredibilityTier }) {
  const color = TIER_COLORS[tier];
  const displayName = TIER_DISPLAY_NAMES[tier];
  return (
    <View style={[styles.tierBadge, { borderColor: color, backgroundColor: `${color}18` }]}>
      {tier === "top" && <Ionicons name="trophy" size={12} color={color} />}
      {tier === "trusted" && <Ionicons name="shield-checkmark" size={12} color={color} />}
      {tier === "city" && <Ionicons name="star" size={12} color={color} />}
      {tier === "community" && <Ionicons name="person" size={12} color={color} />}
      <Text style={[styles.tierBadgeText, { color }]}>{displayName.toUpperCase()}</Text>
    </View>
  );
}

const HistoryRow = React.memo(function HistoryRow({ r }: { r: any }) {
  return (
    <TouchableOpacity
      style={styles.historyRow}
      activeOpacity={0.7}
      onPress={() => r.businessSlug && router.push({ pathname: "/business/[id]", params: { id: r.businessSlug } })}
      accessibilityRole="link"
      accessibilityLabel={`${r.businessName || "Business"}, score ${parseFloat(r.rawScore).toFixed(1)}`}
    >
      <View style={styles.historyLeft}>
        <Text style={styles.historyName}>{r.businessName || "Business"}</Text>
        <Text style={styles.historyDate}>{formatTimeAgo(new Date(r.createdAt).getTime())}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyScore}>{parseFloat(r.rawScore).toFixed(1)}</Text>
        <Text style={styles.historyWeight}>{parseFloat(r.weight).toFixed(2)}x weight</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
});

function BreakdownRow({ label, value, icon }: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>["name"] }) {
  return (
    <View style={styles.breakdownRow}>
      <Ionicons name={icon} size={14} color={Colors.textTertiary} />
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
  );
}

function LoggedOutView() {
  const insets = useSafeAreaInsets();
  const { login, googleLogin } = useAuth();
  const googleAvailable = isGoogleAuthAvailable();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.loggedOutContainer, { paddingTop: topPad }]}>
      <View style={styles.loggedOutTop}>
        <AppLogo size="lg" />
        <Text style={styles.loggedOutSubtitle}>{BRAND.tagline}</Text>
      </View>

      <View style={styles.loggedOutForm}>
        {/* Google button */}
        <TouchableOpacity
          style={[styles.googleButton, googleAvailable && styles.googleButtonActive]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={googleAvailable ? "Continue with Google" : "Continue with Google (coming soon)"}
          disabled={!googleAvailable || isSubmitting}
          onPress={async () => {
            if (!googleAvailable) return;
            setError("");
            setIsSubmitting(true);
            try {
              const idToken = await signInWithGoogle();
              await googleLogin(idToken);
            } catch (err: any) {
              if (!err.message?.includes("cancelled")) {
                setError(err.message || "Google sign-in failed");
              }
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <Text style={[styles.googleG, googleAvailable && styles.googleGActive]}>G</Text>
          <Text style={[styles.googleButtonText, googleAvailable && styles.googleButtonTextActive]}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Or divider */}
        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Email field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        {/* Password field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.inputWithEye]}
            placeholder="Password"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sign In button */}
        <TouchableOpacity
          style={[styles.signInButton, isSubmitting && styles.signInButtonLoading]}
          onPress={handleSignIn}
          activeOpacity={0.85}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Sign up link */}
        <TouchableOpacity
          onPress={() => router.push("/auth/signup")}
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel="Sign up for an account"
        >
          <Text style={styles.signUpLink}>
            Don't have an account? <Text style={styles.signUpLinkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SavedRow = React.memo(function SavedRow({ entry }: { entry: BookmarkEntry }) {
  const catDisplay = getCategoryDisplay(entry.category);
  return (
    <TouchableOpacity
      style={styles.savedRow}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: entry.slug } })}
      accessibilityRole="link"
      accessibilityLabel={`View ${entry.name}`}
    >
      <View style={styles.savedEmoji}>
        <Text style={styles.savedEmojiText}>{catDisplay.emoji}</Text>
      </View>
      <View style={styles.savedInfo}>
        <Text style={styles.savedName} numberOfLines={1}>{entry.name}</Text>
        <Text style={styles.savedCategory}>{catDisplay.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
});

function ProfileContent({ profile, refetch }: { profile: ApiMemberProfile; refetch: () => Promise<any> }) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { savedList, bookmarkCount } = useBookmarks();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const { data: impact } = useQuery({
    queryKey: ["impact", profile.id],
    queryFn: fetchMemberImpact,
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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
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
        colors={[BRAND.colors.navy, "#1A3050"]}
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
              <View style={[styles.progressBarFill, { width: `${progressToNext}%` as any, backgroundColor: tierColor }]} />
            </View>
            <Text style={styles.credProgressHint}>
              {Math.max(nextRange.min - profile.credibilityScore, 0)} points to {TIER_DISPLAY_NAMES[nextTier]}
            </Text>
          </View>
        )}
      </View>

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
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{profile.daysActive.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
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

      {/* Tier Rewards — What you've unlocked & what's next */}
      <View style={styles.tierInfoSection}>
        <Text style={styles.sectionTitle}>Your Rewards</Text>
        <View style={styles.perksGrid}>
          {getUnlockedPerks(tier).map((perk) => (
            <View key={perk.id} style={styles.perkItem}>
              <View style={styles.perkIconWrap}>
                <Ionicons name={perk.icon as any} size={16} color={AMBER} />
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
                    <Ionicons name={perk.icon as any} size={16} color={Colors.textTertiary} />
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
      {profile && ["rahul@topranker.com", "admin@topranker.com", "alex@demo.com"].includes(profile.email) && (
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
      <View style={styles.container}>
        <ProfileSkeleton />
      </View>
    );
  }

  if (!user) {
    return <LoggedOutView />;
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
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
      <View style={styles.container}>
        <ProfileSkeleton />
      </View>
    );
  }

  return <ProfileContent profile={profile} refetch={refetch} />;
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
    flex: 1, fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  deleteAccountBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 24, paddingVertical: 12,
  },
  deleteAccountText: {
    fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium",
  },

  // ===== Logged Out (Fix 6) =====
  loggedOutContainer: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "flex-start",
    paddingHorizontal: 32,
  },
  loggedOutTop: {
    alignItems: "center",
    marginTop: "18%",
    marginBottom: 40,
  },
  loggedOutSubtitle: {
    fontSize: 15, color: Colors.textTertiary, marginTop: 12, fontFamily: "DMSans_400Regular",
  },
  loggedOutForm: {
    width: "100%", gap: 14,
  },
  googleButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, height: 52,
    width: "100%",
    opacity: 0.55,
  },
  googleButtonActive: {
    opacity: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  googleG: {
    fontSize: 20, fontWeight: "700", color: Colors.textTertiary,
  },
  googleGActive: {
    color: "#4285F4",
  },
  googleButtonText: {
    fontSize: 15, fontWeight: "600", color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold",
  },
  googleButtonTextActive: {
    color: Colors.text,
  },
  orDivider: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginVertical: 4,
  },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 13, color: Colors.textSecondary },
  errorText: {
    fontSize: 13, color: Colors.red, textAlign: "center",
  },
  inputContainer: {
    position: "relative" as const,
  },
  input: {
    width: "100%", height: 48, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, fontSize: 14, color: Colors.text,
    backgroundColor: Colors.surface, fontFamily: "DMSans_400Regular",
  },
  eyeButton: {
    position: "absolute" as const, right: 12, top: 0, bottom: 0,
    justifyContent: "center",
  },
  inputWithEye: { paddingRight: 44 },
  signInButton: {
    backgroundColor: AMBER, borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center",
    width: "100%", marginTop: 4,
    shadowColor: "rgba(196,154,26,0.35)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 6,
  },
  signInButtonLoading: { opacity: 0.7 },
  signInButtonText: {
    fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold",
  },
  signUpLink: {
    fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginTop: 4,
  },
  signUpLinkBold: {
    color: Colors.blue, fontWeight: "600", fontFamily: "DMSans_600SemiBold",
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
    backgroundColor: "rgba(255,215,0,0.2)", borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(255,215,0,0.4)",
  },
  foundingBadgeText: {
    fontSize: 8, fontWeight: "700", color: "#FFD700",
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
  tierBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, alignSelf: "flex-start",
  },
  tierBadgeText: { fontSize: 9, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.8 },

  credibilityCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    gap: 14, ...Colors.cardShadow,
  },
  credScoreRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  credScoreLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", letterSpacing: 0.5, textTransform: "uppercase" as const },
  credScore: { fontSize: 48, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -2 },
  credWeightBox: { alignItems: "center", gap: 2 },
  credWeightLabel: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  credWeight: { fontSize: 24, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold" },
  credProgress: { gap: 6 },
  credProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  credProgressLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  credProgressPct: { fontSize: 12, fontWeight: "700", color: Colors.gold, fontFamily: "DMSans_700Bold" },
  progressBarBg: { height: 4, backgroundColor: Colors.surfaceRaised, borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 2 },
  credProgressHint: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },

  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(13,27,42,0.9)", borderRadius: 14,
    overflow: "hidden",
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statNum: { fontSize: 24, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },

  joinedText: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
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
  breakdownRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  breakdownLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  breakdownValue: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  breakdownTotal: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 6, marginTop: 2,
  },
  breakdownTotalLabel: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  breakdownTotalValue: { fontSize: 20, fontWeight: "700", fontFamily: "PlayfairDisplay_700Bold" },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  sectionCount: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  historyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    ...Colors.cardShadow,
  },
  historyLeft: { gap: 2 },
  historyName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  historyDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  historyRight: { alignItems: "flex-end", gap: 2 },
  historyScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  historyWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  savedRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    gap: 12, ...Colors.cardShadow,
  },
  savedEmoji: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.goldFaint,
    alignItems: "center", justifyContent: "center",
  },
  savedEmojiText: { fontSize: 18 },
  savedInfo: { flex: 1, gap: 2 },
  savedName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  savedCategory: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

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
  tierRange: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
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
  perkDesc: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
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
});
