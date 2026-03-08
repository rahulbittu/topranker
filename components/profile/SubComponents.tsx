/**
 * Extracted sub-components from app/(tabs)/profile.tsx
 * Presentational components for the Profile screen.
 * Extracted per Audit N1/N6 to reduce profile.tsx from 1056 LOC.
 */
import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, TextInput, Switch, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  TIER_COLORS, TIER_DISPLAY_NAMES, TIER_SCORE_RANGES,
  TIER_INFLUENCE_LABELS, formatTimeAgo,
  type CredibilityTier,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { AppLogo } from "@/components/Logo";
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { signInWithGoogle, isGoogleAuthAvailable } from "@/lib/google-auth";
import { getUnlockedPerks, getNextTierPerks } from "@/lib/tier-perks";
import { TypedIcon } from "@/components/TypedIcon";
import type { BookmarkEntry } from "@/lib/bookmarks-context";
import type { ApiMemberImpact } from "@/lib/api";

const AMBER = BRAND.colors.amber;

/* ------------------------------------------------------------------ */
/*  Original sub-components                                           */
/* ------------------------------------------------------------------ */

export function TierBadge({ tier }: { tier: CredibilityTier }) {
  const color = TIER_COLORS[tier];
  const displayName = TIER_DISPLAY_NAMES[tier];
  return (
    <View style={[s.tierBadge, { borderColor: color, backgroundColor: `${color}18` }]}>
      {tier === "top" && <Ionicons name="trophy" size={12} color={color} />}
      {tier === "trusted" && <Ionicons name="shield-checkmark" size={12} color={color} />}
      {tier === "city" && <Ionicons name="star" size={12} color={color} />}
      {tier === "community" && <Ionicons name="person" size={12} color={color} />}
      <Text style={[s.tierBadgeText, { color }]}>{displayName.toUpperCase()}</Text>
    </View>
  );
}

export const HistoryRow = React.memo(function HistoryRow({ r }: { r: any }) {
  return (
    <TouchableOpacity
      style={s.historyRow}
      activeOpacity={0.7}
      onPress={() => r.businessSlug && router.push({ pathname: "/business/[id]", params: { id: r.businessSlug } })}
      accessibilityRole="link"
      accessibilityLabel={`${r.businessName || "Business"}, score ${parseFloat(r.rawScore).toFixed(1)}`}
    >
      <View style={s.historyLeft}>
        <Text style={s.historyName}>{r.businessName || "Business"}</Text>
        <Text style={s.historyDate}>{formatTimeAgo(new Date(r.createdAt).getTime())}</Text>
      </View>
      <View style={s.historyRight}>
        <Text style={s.historyScore}>{parseFloat(r.rawScore).toFixed(1)}</Text>
        <Text style={s.historyWeight}>{parseFloat(r.weight).toFixed(2)}x weight</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
});

export function BreakdownRow({ label, value, icon }: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>["name"] }) {
  return (
    <View style={s.breakdownRow}>
      <Ionicons name={icon} size={14} color={Colors.textTertiary} />
      <Text style={s.breakdownLabel}>{label}</Text>
      <Text style={s.breakdownValue}>{value}</Text>
    </View>
  );
}

export const SavedRow = React.memo(function SavedRow({ entry }: { entry: BookmarkEntry }) {
  const catDisplay = getCategoryDisplay(entry.category);
  return (
    <TouchableOpacity
      style={s.savedRow}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: entry.slug } })}
      accessibilityRole="link"
      accessibilityLabel={`View ${entry.name}`}
    >
      <View style={s.savedEmoji}>
        <Text style={s.savedEmojiText}>{catDisplay.emoji}</Text>
      </View>
      <View style={s.savedInfo}>
        <Text style={s.savedName} numberOfLines={1}>{entry.name}</Text>
        <Text style={s.savedCategory}>{catDisplay.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
});

/* ------------------------------------------------------------------ */
/*  ImpactCard — "Your Impact" pride section                          */
/* ------------------------------------------------------------------ */

export function ImpactCard({ impact, city }: { impact: ApiMemberImpact; city: string }) {
  return (
    <View style={s.prideCard}>
      <View style={s.prideHeader}>
        <Ionicons name="trending-up" size={18} color={Colors.green} />
        <Text style={s.prideTitle}>Your Impact</Text>
      </View>
      <Text style={s.prideText}>
        Your ratings contributed to {impact.businessesMovedUp} business{impact.businessesMovedUp !== 1 ? "es" : ""} moving up in the {city} rankings.
      </Text>
      {impact.topContributions.length > 0 && (
        <View style={s.prideList}>
          {impact.topContributions.map(c => (
            <TouchableOpacity
              key={c.slug}
              style={s.prideItem}
              onPress={() => router.push({ pathname: "/business/[id]", params: { id: c.slug } })}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel={`${c.name}, moved up ${c.rankChange}`}
            >
              <Text style={s.prideItemName} numberOfLines={1}>{c.name}</Text>
              <View style={s.prideItemDelta}>
                <Ionicons name="arrow-up" size={10} color={Colors.green} />
                <Text style={s.prideItemDeltaText}>{c.rankChange}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  PaymentHistoryRow                                                 */
/* ------------------------------------------------------------------ */

export const PaymentHistoryRow = React.memo(function PaymentHistoryRow({ p }: { p: any }) {
  return (
    <View style={s.paymentRow}>
      <View style={s.paymentIconWrap}>
        <Ionicons
          name={p.type === "challenger_entry" ? "flash" : p.type === "featured_placement" ? "megaphone" : "speedometer"}
          size={16}
          color={p.status === "succeeded" ? AMBER : p.status === "failed" ? "#E53E3E" : Colors.textTertiary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.paymentType}>
          {p.type === "challenger_entry" ? "Challenger Entry" : p.type === "dashboard_pro" ? "Dashboard Pro" : "Featured Placement"}
        </Text>
        <Text style={s.paymentDate}>
          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.paymentAmount}>${(p.amount / 100).toFixed(2)}</Text>
        <Text style={[s.paymentStatus, {
          color: p.status === "succeeded" ? Colors.green : p.status === "failed" ? "#E53E3E" : Colors.textTertiary,
        }]}>
          {p.status}
        </Text>
      </View>
    </View>
  );
});

/* ------------------------------------------------------------------ */
/*  CredibilityJourney — tier ladder                                  */
/* ------------------------------------------------------------------ */

export function CredibilityJourney({ currentTier }: { currentTier: CredibilityTier }) {
  return (
    <View style={s.tierInfoSection}>
      <Text style={s.sectionTitle}>Credibility Journey</Text>
      <View style={s.tierList}>
        {(["community", "city", "trusted", "top"] as CredibilityTier[]).map((t, idx, arr) => {
          const tierOrder = arr.indexOf(currentTier);
          const isCompleted = idx < tierOrder;
          const isCurrent = t === currentTier;
          return (
            <View key={t}>
              <View style={[s.tierRow, isCurrent && s.tierRowActive]}>
                <View style={[
                  s.tierDot,
                  { backgroundColor: isCompleted || isCurrent ? TIER_COLORS[t] : Colors.border },
                ]}>
                  {isCompleted && <Ionicons name="checkmark" size={8} color="#fff" />}
                </View>
                <View style={s.tierRowInfo}>
                  <Text style={[s.tierName, (isCurrent || isCompleted) && { color: Colors.text }]}>
                    {TIER_DISPLAY_NAMES[t]}
                  </Text>
                  <Text style={s.tierWeight}>{TIER_INFLUENCE_LABELS[t]}</Text>
                </View>
                <Text style={s.tierRange}>
                  {TIER_SCORE_RANGES[t].min}–{TIER_SCORE_RANGES[t].max}
                </Text>
                {isCurrent && (
                  <View style={s.currentBadge}>
                    <Text style={s.currentBadgeText}>YOU</Text>
                  </View>
                )}
              </View>
              {idx < arr.length - 1 && (
                <View style={[s.tierConnector, {
                  backgroundColor: isCompleted ? TIER_COLORS[t] : Colors.border,
                }]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  TierRewardsSection — perks grid + next tier preview               */
/* ------------------------------------------------------------------ */

export function TierRewardsSection({ tier }: { tier: CredibilityTier }) {
  const next = getNextTierPerks(tier);
  return (
    <View style={s.tierInfoSection}>
      <Text style={s.sectionTitle}>Your Rewards</Text>
      <View style={s.perksGrid}>
        {getUnlockedPerks(tier).map((perk) => (
          <View key={perk.id} style={s.perkItem}>
            <View style={s.perkIconWrap}>
              <TypedIcon name={perk.icon} size={16} color={AMBER} />
            </View>
            <View style={s.perkInfo}>
              <Text style={s.perkTitle}>{perk.title}</Text>
              <Text style={s.perkDesc} numberOfLines={1}>{perk.description}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
          </View>
        ))}
      </View>

      {next && (
        <View style={s.nextTierPreview}>
          <Text style={s.nextTierLabel}>
            Unlock with {TIER_DISPLAY_NAMES[next.nextTier]}
          </Text>
          {next.perks.slice(0, 3).map((perk) => (
            <View key={perk.id} style={[s.perkItem, s.perkItemLocked]}>
              <View style={[s.perkIconWrap, s.perkIconLocked]}>
                <TypedIcon name={perk.icon} size={16} color={Colors.textTertiary} />
              </View>
              <View style={s.perkInfo}>
                <Text style={[s.perkTitle, s.perkTitleLocked]}>{perk.title}</Text>
                <Text style={s.perkDesc} numberOfLines={1}>{perk.description}</Text>
              </View>
              <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  NotificationPreferences                                           */
/* ------------------------------------------------------------------ */

export function NotificationPreferences({
  notifRatingUpdates, notifChallengeResults, notifWeeklyDigest,
  saveNotifPref,
}: {
  notifRatingUpdates: boolean;
  notifChallengeResults: boolean;
  notifWeeklyDigest: boolean;
  saveNotifPref: (key: string, value: boolean) => void;
}) {
  return (
    <View style={s.notifCard}>
      <View style={s.notifHeader}>
        <Ionicons name="notifications-outline" size={16} color={Colors.text} />
        <Text style={s.notifHeaderText}>Notifications</Text>
      </View>
      <View style={s.notifRow}>
        <View style={s.notifLabelWrap}>
          <Text style={s.notifLabel}>Rating updates</Text>
          <Text style={s.notifDesc}>When someone rates a business you own</Text>
        </View>
        <Switch
          value={notifRatingUpdates}
          onValueChange={(v) => saveNotifPref("ratingUpdates", v)}
          trackColor={{ false: Colors.border, true: AMBER }}
          thumbColor="#fff"
        />
      </View>
      <View style={s.notifSep} />
      <View style={s.notifRow}>
        <View style={s.notifLabelWrap}>
          <Text style={s.notifLabel}>Challenge results</Text>
          <Text style={s.notifDesc}>Challenger competition updates</Text>
        </View>
        <Switch
          value={notifChallengeResults}
          onValueChange={(v) => saveNotifPref("challengeResults", v)}
          trackColor={{ false: Colors.border, true: AMBER }}
          thumbColor="#fff"
        />
      </View>
      <View style={s.notifSep} />
      <View style={s.notifRow}>
        <View style={s.notifLabelWrap}>
          <Text style={s.notifLabel}>Weekly digest</Text>
          <Text style={s.notifDesc}>Weekly email with top rankings</Text>
        </View>
        <Switch
          value={notifWeeklyDigest}
          onValueChange={(v) => saveNotifPref("weeklyDigest", v)}
          trackColor={{ false: Colors.border, true: AMBER }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  LegalLinksSection — legal links + delete account                  */
/* ------------------------------------------------------------------ */

export function LegalLinksSection() {
  return (
    <>
      <View style={s.legalLinks}>
        <TouchableOpacity
          style={s.legalLink}
          onPress={() => router.push("/legal/terms")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Terms of Service"
        >
          <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
          <Text style={s.legalLinkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.legalLink}
          onPress={() => router.push("/legal/privacy")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Privacy Policy"
        >
          <Ionicons name="shield-outline" size={14} color={Colors.textTertiary} />
          <Text style={s.legalLinkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.legalLink}
          onPress={() => router.push("/legal/accessibility")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Accessibility Statement"
        >
          <Ionicons name="accessibility-outline" size={14} color={Colors.textTertiary} />
          <Text style={s.legalLinkText}>Accessibility</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={s.deleteAccountBtn}
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
        <Text style={s.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  LoggedOutView                                                     */
/* ------------------------------------------------------------------ */

export function LoggedOutView() {
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
    <View style={[s.loggedOutContainer, { paddingTop: topPad }]}>
      <View style={s.loggedOutTop}>
        <AppLogo size="lg" />
        <Text style={s.loggedOutSubtitle}>{BRAND.tagline}</Text>
      </View>

      <View style={s.loggedOutForm}>
        <TouchableOpacity
          style={[s.googleButton, googleAvailable && s.googleButtonActive]}
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
          <Text style={[s.googleG, googleAvailable && s.googleGActive]}>G</Text>
          <Text style={[s.googleButtonText, googleAvailable && s.googleButtonTextActive]}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={s.orDivider}>
          <View style={s.orLine} />
          <Text style={s.orText}>or</Text>
          <View style={s.orLine} />
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={s.inputContainer}>
          <TextInput
            style={[s.input, s.inputWithEye]}
            placeholder="Password"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
          />
          <TouchableOpacity
            style={s.eyeButton}
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

        <TouchableOpacity
          style={[s.signInButton, isSubmitting && s.signInButtonLoading]}
          onPress={handleSignIn}
          activeOpacity={0.85}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/signup")}
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel="Sign up for an account"
        >
          <Text style={s.signUpLink}>
            Don't have an account? <Text style={s.signUpLinkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  tierBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, alignSelf: "flex-start",
  },
  tierBadgeText: { fontSize: 9, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.8 },

  historyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, ...Colors.cardShadow,
  },
  historyLeft: { gap: 2 },
  historyName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  historyDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  historyRight: { alignItems: "flex-end", gap: 2 },
  historyScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  historyWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  breakdownRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  breakdownLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  breakdownValue: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },

  savedRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, gap: 12, ...Colors.cardShadow,
  },
  savedEmoji: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.goldFaint, alignItems: "center", justifyContent: "center",
  },
  savedEmojiText: { fontSize: 18 },
  savedInfo: { flex: 1, gap: 2 },
  savedName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  savedCategory: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  // Impact / Pride card
  prideCard: {
    backgroundColor: `${Colors.green}08`, borderRadius: 14, padding: 16,
    gap: 10, borderWidth: 1, borderColor: `${Colors.green}20`,
  },
  prideHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  prideTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  prideText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18 },
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
  prideItemDeltaText: { fontSize: 11, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold" },

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
  paymentType: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  paymentDate: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, marginTop: 2 },
  paymentAmount: { ...TYPOGRAPHY.ui.bodyBold, fontWeight: "700", color: Colors.text },
  paymentStatus: {
    fontSize: 10, fontFamily: "DMSans_500Medium", marginTop: 2,
    textTransform: "capitalize" as const,
  },

  // Credibility Journey
  tierInfoSection: { gap: 10, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
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

  // Tier Perks / Rewards
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

  // Notification Preferences
  notifCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginTop: 16, gap: 0,
  },
  notifHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  notifHeaderText: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  notifRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 6,
  },
  notifLabelWrap: { flex: 1, marginRight: 12 },
  notifLabel: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_400Regular" },
  notifDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2 },
  notifSep: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Legal Links
  legalLinks: {
    marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border,
    marginHorizontal: 20, gap: 2,
  },
  legalLink: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 },
  legalLinkText: { flex: 1, ...TYPOGRAPHY.ui.body, color: Colors.textSecondary },
  deleteAccountBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 24, paddingVertical: 12,
  },
  deleteAccountText: { fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium" },

  // Logged out view
  loggedOutContainer: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "flex-start", paddingHorizontal: 32,
  },
  loggedOutTop: { alignItems: "center", marginTop: "18%", marginBottom: 40 },
  loggedOutSubtitle: { fontSize: 15, color: Colors.textTertiary, marginTop: 12, fontFamily: "DMSans_400Regular" },
  loggedOutForm: { width: "100%", gap: 14 },
  googleButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, height: 52, width: "100%", opacity: 0.55,
  },
  googleButtonActive: {
    opacity: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  googleG: { fontSize: 20, fontWeight: "700", color: Colors.textTertiary },
  googleGActive: { color: "#4285F4" },
  googleButtonText: { fontSize: 15, fontWeight: "600", color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold" },
  googleButtonTextActive: { color: Colors.text },
  orDivider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 13, color: Colors.textSecondary },
  errorText: { fontSize: 13, color: Colors.red, textAlign: "center" },
  inputContainer: { position: "relative" as const },
  input: {
    width: "100%", height: 48, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, fontSize: 14, color: Colors.text,
    backgroundColor: Colors.surface, fontFamily: "DMSans_400Regular",
  },
  eyeButton: { position: "absolute" as const, right: 12, top: 0, bottom: 0, justifyContent: "center" },
  inputWithEye: { paddingRight: 44 },
  signInButton: {
    backgroundColor: AMBER, borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center", width: "100%", marginTop: 4,
    shadowColor: "rgba(196,154,26,0.35)", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 6,
  },
  signInButtonLoading: { opacity: 0.7 },
  signInButtonText: { fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  signUpLink: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginTop: 4 },
  signUpLinkBold: { color: Colors.blue, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
});
