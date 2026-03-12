/**
 * Sprint 584: Profile Bottom Section — extracted from profile.tsx
 * Payment history, credibility journey, badge grid, tier rewards,
 * invite friends, admin panel, notification preferences, legal links.
 * Owner: Sarah Nakamura (Lead Eng)
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { isAdminEmail } from "@/shared/admin";
import { type CredibilityTier } from "@/lib/data";
import {
  PaymentHistoryRow, CredibilityJourney,
  TierRewardsSection, LegalLinksSection,
} from "@/components/profile/SubComponents";
import { BadgeGridFull } from "@/components/profile/BadgeGrid";
import { NotificationPreferencesCard } from "@/components/profile/NotificationPreferencesCard";
import { type EarnedBadge } from "@/lib/badges";
import { APP_VERSION, BUILD_NUMBER } from "@/lib/app-env";

export interface ProfileBottomSectionProps {
  tier: CredibilityTier;
  credibilityScore: number;
  totalRatings: number;
  email: string;
  paymentHistory: any[];
  badges: Array<{ badge: { id: string; name: string }; progress: number; earnedAt: number }>;
  totalPossible: number;
  onBadgePress: (badge: EarnedBadge) => void;
}

export function ProfileBottomSection({
  tier,
  credibilityScore,
  totalRatings,
  email,
  paymentHistory,
  badges,
  totalPossible,
  onBadgePress,
}: ProfileBottomSectionProps) {
  return (
    <>
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

      <CredibilityJourney currentTier={tier} credibilityScore={credibilityScore} totalRatings={totalRatings} />

      {/* Achievement Badges */}
      <BadgeGridFull
        badges={badges}
        totalPossible={totalPossible}
        title="Achievement Badges"
        onBadgePress={onBadgePress}
      />

      <TierRewardsSection tier={tier} />

      {/* Invite Friends */}
      <TouchableOpacity
        style={styles.actionLink}
        onPress={() => router.push("/referral")}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Invite friends"
      >
        <Ionicons name="people-outline" size={14} color={BRAND.colors.amber} />
        <Text style={styles.actionLinkText}>Invite Friends</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
      </TouchableOpacity>

      {/* Admin Panel */}
      {isAdminEmail(email) && (
        <TouchableOpacity
          style={styles.actionLink}
          onPress={() => router.push("/admin")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open admin panel"
        >
          <Ionicons name="shield-checkmark" size={14} color={BRAND.colors.amber} />
          <Text style={styles.actionLinkText}>Admin Panel</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}

      <NotificationPreferencesCard />

      <LegalLinksSection />

      {/* Sprint 756: App version for beta debugging */}
      <Text style={styles.versionLabel}>
        TopRanker v{APP_VERSION} ({BUILD_NUMBER}) · {Platform.OS}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  sectionCount: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  actionLink: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 20, marginBottom: 12,
  },
  actionLinkText: {
    flex: 1, fontSize: 14, fontWeight: "600", color: BRAND.colors.amber,
    fontFamily: "DMSans_600SemiBold",
  },
  versionLabel: {
    textAlign: "center", fontSize: 11, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular", marginTop: 8, marginBottom: 24,
  },
});
