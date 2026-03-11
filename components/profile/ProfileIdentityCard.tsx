/**
 * Sprint 584: Profile Identity Card — extracted from profile.tsx
 * Navy gradient card with avatar, display name, username, tier badge, founding member badge.
 * Owner: Sarah Nakamura (Lead Eng)
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND } from "@/constants/brand";
import Colors from "@/constants/colors";
import { TierBadge } from "@/components/profile/SubComponents";
import { FadeInView } from "@/components/animations/FadeInView";
import { type CredibilityTier } from "@/lib/data";

// Sprint 625: Format name as "First L." (e.g., "Rahul P.")
export function formatShortName(firstName?: string | null, lastName?: string | null, displayName?: string): string {
  if (firstName) {
    const lastInitial = lastName ? ` ${lastName.charAt(0).toUpperCase()}.` : "";
    return `${firstName}${lastInitial}`;
  }
  return displayName || "";
}

export interface ProfileIdentityCardProps {
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  username: string;
  avatarUrl: string | null;
  tier: CredibilityTier;
  isFoundingMember: boolean;
}

export function ProfileIdentityCard({
  displayName,
  firstName,
  lastName,
  username,
  avatarUrl,
  tier,
  isFoundingMember,
}: ProfileIdentityCardProps) {
  const shortName = formatShortName(firstName, lastName, displayName);
  return (
    <FadeInView delay={100} duration={500}>
      <LinearGradient
        colors={[BRAND.colors.navy, BRAND.colors.navyDark]}
        style={styles.profileCard}
      >
        <View style={styles.avatarCircle}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Text style={styles.avatarInitial}>{displayName.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{shortName}</Text>
          <Text style={styles.username}>@{username}</Text>
          <View style={styles.badgeRow}>
            <TierBadge tier={tier} />
            {isFoundingMember && (
              <View style={styles.foundingBadge}>
                <Text style={styles.foundingBadgeText}>FOUNDING MEMBER</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    ...Colors.cardShadow,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: BRAND.colors.amber,
    alignItems: "center", justifyContent: "center",
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 28 },
  avatarInitial: { fontSize: 24, fontWeight: "700", color: "#fff", fontFamily: "PlayfairDisplay_700Bold" },
  profileInfo: { gap: 4 },
  profileName: {
    fontSize: 20, fontWeight: "700", color: "#fff",
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.3,
  },
  username: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  foundingBadge: {
    backgroundColor: `${Colors.gold}20`, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: `${Colors.gold}40`,
  },
  foundingBadgeText: {
    fontSize: 8, fontWeight: "700", color: Colors.gold,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.5,
  },
});
