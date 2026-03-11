/**
 * Sprint 396: Extracted bottom section from business/[id].tsx
 *
 * Contains: rate button (gated), claim card, report link, claim link.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { Analytics } from "@/lib/analytics";
import * as Haptics from "expo-haptics";

export interface BusinessBottomSectionProps {
  businessName: string;
  businessSlug: string;
  isClaimed: boolean;
  isLoggedIn: boolean;
  hasExistingRating: boolean;
  memberDaysActive: number;
}

export function BusinessBottomSection({
  businessName,
  businessSlug,
  isClaimed,
  isLoggedIn,
  hasExistingRating,
  memberDaysActive,
}: BusinessBottomSectionProps) {
  const canRate = memberDaysActive >= 3;

  return (
    <>
      {/* Rate Button — gated: active after 3+ days */}
      {isLoggedIn ? (
        canRate ? (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push({ pathname: "/rate/[id]", params: { id: businessSlug } }); }}
            activeOpacity={0.85}
            testID="rate-this-place"
            accessibilityRole="button"
            accessibilityLabel={`Rate ${businessName}`}
          >
            <Ionicons name="star" size={18} color="#FFFFFF" />
            <Text style={styles.rateButtonText}>
              {hasExistingRating ? "Update Your Rating" : "Rate This Place"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rateGated}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.rateGatedText}>Build your reviewer credibility to rate this business.</Text>
            <Text style={styles.rateGatedSubtext}>{3 - memberDaysActive} more days active to unlock rating.</Text>
          </View>
        )
      ) : (
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => router.push("/auth/login")}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Sign in to rate this place"
        >
          <Text style={styles.rateButtonText}>Sign In to Rate</Text>
        </TouchableOpacity>
      )}

      {/* Claim Listing */}
      {!isClaimed && (
        <View style={styles.claimCard}>
          <Text style={styles.claimTitle}>Own this business?</Text>
          <Text style={styles.claimDesc}>Claim your listing to access analytics and get a verified badge</Text>
          <TouchableOpacity
            style={styles.claimBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Claim this business listing"
            onPress={() => {
              Analytics.dashboardUpgradeTap(businessSlug);
              router.push({ pathname: "/business/claim", params: { name: businessName, slug: businessSlug } });
            }}
          >
            <Text style={styles.claimBtnText}>Claim Listing</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.reportLink}
        accessibilityRole="button"
        accessibilityLabel="Report suspicious activity"
        onPress={() => {
          if (Platform.OS === "web") {
            window.alert("Thank you. Our team will review this listing.");
          } else {
            Alert.alert("Report Submitted", "Thank you. Our team will review this listing.");
          }
        }}
      >
        <Ionicons name="flag-outline" size={12} color={Colors.textTertiary} />
        <Text style={styles.reportLinkText}>Report Suspicious Activity</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.claimLink}
        onPress={() => router.push({ pathname: "/business/claim", params: { name: businessName, slug: businessSlug } })}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Claim ${businessName} as your business`}
      >
        <Ionicons name="shield-checkmark-outline" size={12} color={BRAND.colors.amber} />
        <Text style={styles.claimLinkText}>Own this business? Claim it</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  rateButton: {
    backgroundColor: BRAND.colors.amber, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "rgba(196,154,26,0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  rateButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  rateGated: {
    backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    alignItems: "center", gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  rateGatedText: {
    fontSize: 13, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium", textAlign: "center",
  },
  rateGatedSubtext: {
    ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary,
  },
  claimCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    ...Colors.cardShadow,
  },
  claimTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  claimDesc: { ...TYPOGRAPHY.ui.caption, color: Colors.textSecondary, lineHeight: 16 },
  claimBtn: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
  },
  claimBtnText: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  reportLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 16, marginTop: 4,
  },
  reportLinkText: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  claimLink: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center",
    paddingVertical: 8,
  },
  claimLinkText: { fontSize: 11, color: BRAND.colors.amber, fontFamily: "DMSans_500Medium" },
});
