import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, TextInput,
} from "react-native";
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
import { fetchMemberProfile, type ApiMemberProfile } from "@/lib/api";
import { AppLogo } from "@/components/Logo";
import { BRAND } from "@/constants/brand";

const AMBER = "#C49A1A";

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

function BreakdownRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.breakdownRow}>
      <Ionicons name={icon as any} size={14} color={Colors.textTertiary} />
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
  );
}

function LoggedOutView() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
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
        <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
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
          />
        </View>

        {/* Password field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { paddingRight: 44 }]}
            placeholder="Password"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
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
          style={[styles.signInButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSignIn}
          activeOpacity={0.85}
          disabled={isSubmitting}
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
        >
          <Text style={styles.signUpLink}>
            Don't have an account? <Text style={styles.signUpLinkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProfileContent({ profile }: { profile: ApiMemberProfile }) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
  const totalScore = (breakdown.base || 0) + (breakdown.volume || 0) +
    (breakdown.diversity || 0) + Math.round(breakdown.age || 0) +
    Math.round(breakdown.variance || 0) + (breakdown.helpfulness || 0) -
    (breakdown.penalties || 0);

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
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["#0D1B2A", "#1A3050"]}
        style={styles.profileCard}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{profile.displayName.charAt(0)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: "#fff", fontFamily: "PlayfairDisplay_700Bold" }]}>{profile.displayName}</Text>
          <Text style={[styles.username, { color: "rgba(255,255,255,0.5)" }]}>@{profile.username}</Text>
          <TierBadge tier={tier} />
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

        {nextTier && (
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
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{profile.totalRatings}</Text>
          <Text style={styles.statLabel}>Ratings</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statNum}>{profile.totalCategories}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{profile.daysActive}</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
      </View>

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

      {profile.ratingHistory.map((r: any, i: number) => (
        <View key={i} style={styles.historyRow}>
          <View style={styles.historyLeft}>
            <Text style={styles.historyName}>{r.businessName || "Business"}</Text>
            <Text style={styles.historyDate}>{formatTimeAgo(new Date(r.createdAt).getTime())}</Text>
          </View>
          <View style={styles.historyRight}>
            <Text style={styles.historyScore}>{parseFloat(r.rawScore).toFixed(1)}</Text>
            <Text style={styles.historyWeight}>{parseFloat(r.weight).toFixed(2)}x weight</Text>
          </View>
        </View>
      ))}

      {profile.ratingHistory.length === 0 && (
        <View style={styles.emptyHistory}>
          <Ionicons name="star-outline" size={32} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No ratings yet</Text>
          <Text style={styles.emptySubtext}>Rate businesses to build your credibility</Text>
        </View>
      )}

      <View style={styles.tierInfoSection}>
        <Text style={styles.sectionTitle}>Credibility Tiers</Text>
        <View style={styles.tierList}>
          {(["community", "city", "trusted", "top"] as CredibilityTier[]).map(t => (
            <View key={t} style={[styles.tierRow, tier === t && styles.tierRowActive]}>
              <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[t] }]} />
              <View style={styles.tierRowInfo}>
                <Text style={[styles.tierName, tier === t && { color: Colors.text }]}>
                  {TIER_DISPLAY_NAMES[t]}
                </Text>
                <Text style={styles.tierWeight}>{TIER_WEIGHTS[t].toFixed(2)}x</Text>
              </View>
              <Text style={styles.tierRange}>
                {TIER_SCORE_RANGES[t].min}–{TIER_SCORE_RANGES[t].max}
              </Text>
              {tier === t && (
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

export default function ProfileScreen() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchMemberProfile(),
    enabled: !!user,
    staleTime: 30000,
  });

  if (authLoading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  if (!user) {
    return <LoggedOutView />;
  }

  if (profileLoading || !profile) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return <ProfileContent profile={profile} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
    fontSize: 15, color: "#8E8E93", marginTop: 12, fontFamily: "DMSans_400Regular",
  },
  loggedOutForm: {
    width: "100%", gap: 14,
  },
  googleButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E5EA",
    borderRadius: 14, height: 52,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  googleG: {
    fontSize: 20, fontWeight: "700", color: "#4285F4",
  },
  googleButtonText: {
    fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
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
    borderWidth: 1, borderColor: "#E5E5EA",
    paddingHorizontal: 14, fontSize: 14, color: Colors.text,
    backgroundColor: "#fff", fontFamily: "DMSans_400Regular",
  },
  eyeButton: {
    position: "absolute" as const, right: 12, top: 0, bottom: 0,
    justifyContent: "center",
  },
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
  signInButtonText: {
    fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold",
  },
  signUpLink: {
    fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginTop: 4,
  },
  signUpLinkBold: {
    color: "#007AFF", fontWeight: "600", fontFamily: "DMSans_600SemiBold",
  },

  // ===== Logged In =====
  profileCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    ...Colors.cardShadow,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontSize: 24, fontWeight: "700", color: "#fff", fontFamily: "PlayfairDisplay_700Bold" },
  profileInfo: { gap: 4 },
  profileName: {
    fontSize: 20, fontWeight: "700", color: Colors.text,
    fontFamily: "DMSans_700Bold", letterSpacing: -0.3,
  },
  username: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  tierBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, alignSelf: "flex-start",
  },
  tierBadgeText: { fontSize: 9, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.8 },

  credibilityCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
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

  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(13,27,42,0.9)", borderRadius: 14,
    overflow: "hidden",
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statNum: { fontSize: 24, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },

  breakdownCard: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16,
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
    backgroundColor: "#FFFFFF", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    ...Colors.cardShadow,
  },
  historyLeft: { gap: 2 },
  historyName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  historyDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  historyRight: { alignItems: "flex-end", gap: 2 },
  historyScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  historyWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  emptyHistory: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  tierInfoSection: { gap: 10, marginTop: 8 },
  tierList: {
    backgroundColor: "#FFFFFF", borderRadius: 14,
    overflow: "hidden", ...Colors.cardShadow,
  },
  tierRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tierRowActive: { backgroundColor: Colors.goldFaint },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierRowInfo: { flex: 1, gap: 1 },
  tierName: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  tierWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  tierRange: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  currentBadge: {
    backgroundColor: Colors.goldFaint,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  currentBadgeText: { fontSize: 8, fontWeight: "700", color: Colors.gold, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
});
