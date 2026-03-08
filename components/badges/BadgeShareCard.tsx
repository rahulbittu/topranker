/**
 * Badge Share Card — Shareable badge image component
 * Owner: Suki (Design Lead) + James Park (Frontend)
 *
 * Renders a badge as a branded card suitable for sharing via
 * expo-sharing or screenshot capture. Includes badge icon,
 * name, rarity, description, and TopRanker branding.
 */
import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TypedIcon } from "@/components/TypedIcon";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { type Badge, RARITY_COLORS, RARITY_LABELS } from "@/lib/badges";

const AMBER = BRAND.colors.amber;

interface BadgeShareCardProps {
  badge: Badge;
  userName: string;
  earnedDate: string;
}

export const BadgeShareCard = forwardRef<View, BadgeShareCardProps>(
  function BadgeShareCard({ badge, userName, earnedDate }, ref) {
    const rarity = RARITY_COLORS[badge.rarity];

    return (
      <View ref={ref} style={s.card}>
        {/* Header with gradient-like background */}
        <View style={[s.header, { backgroundColor: badge.color }]}>
          <View style={s.badgeCircle}>
            <TypedIcon name={badge.icon} size={40} color={badge.color} />
          </View>
        </View>

        {/* Badge Info */}
        <View style={s.body}>
          <Text style={s.badgeName}>{badge.name}</Text>
          <Text style={[s.rarityPill, { color: rarity.text, backgroundColor: rarity.bg }]}>
            {RARITY_LABELS[badge.rarity]}
          </Text>
          <Text style={s.description}>{badge.description}</Text>

          <View style={s.divider} />

          <Text style={s.earnedBy}>Earned by {userName}</Text>
          <Text style={s.earnedDate}>{earnedDate}</Text>
        </View>

        {/* Footer branding */}
        <View style={s.footer}>
          <Text style={s.footerBrand}>TopRanker</Text>
          <Text style={s.footerTagline}>Rate with Confidence</Text>
        </View>
      </View>
    );
  },
);

const s = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  header: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  body: {
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  badgeName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_900Black",
    textAlign: "center",
  },
  rarityPill: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
    marginVertical: 8,
  },
  earnedBy: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  earnedDate: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  footer: {
    backgroundColor: AMBER,
    paddingVertical: 12,
    alignItems: "center",
    gap: 2,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black",
  },
  footerTagline: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "DMSans_400Regular",
  },
});
