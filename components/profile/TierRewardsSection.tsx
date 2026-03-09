import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { TIER_DISPLAY_NAMES, type CredibilityTier } from "@/lib/data";
import { getUnlockedPerks, getNextTierPerks } from "@/lib/tier-perks";
import { TypedIcon } from "@/components/TypedIcon";

const AMBER = BRAND.colors.amber;

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

const s = StyleSheet.create({
  tierInfoSection: { gap: 10, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
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
});
