/**
 * Badge Display Components for Profile & Business Pages
 * Owner: Jordan (CVO) + Suki (Design Lead)
 *
 * Apple Fitness-style badge grid with progress rings, earned/locked states,
 * and rarity-colored borders.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TypedIcon } from "@/components/TypedIcon";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct as pctDim } from "@/lib/style-helpers";
import {
  type EarnedBadge, type BadgeCategory,
  RARITY_COLORS, RARITY_LABELS,
  getEarnedCount, getNextUnearned,
} from "@/lib/badges";

const AMBER = BRAND.colors.amber;

// ── Badge Summary Header ────────────────────────────────────────
export function BadgeSummary({
  badges,
  totalPossible,
  label,
}: {
  badges: EarnedBadge[];
  totalPossible: number;
  label: string;
}) {
  const earned = getEarnedCount(badges);
  const next = getNextUnearned(badges);
  const pct = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryTop}>
        <View style={s.summaryCircle}>
          <Text style={s.summaryCount}>{earned}</Text>
          <Text style={s.summaryTotal}>/{totalPossible}</Text>
        </View>
        <View style={s.summaryInfo}>
          <Text style={s.summaryLabel}>{label}</Text>
          <View style={s.summaryBarBg}>
            <View style={[s.summaryBarFill, { width: pctDim(pct) }]} />
          </View>
          <Text style={s.summaryPct}>{pct}% complete</Text>
        </View>
      </View>
      {next && (
        <View style={s.nextBadge}>
          <Text style={s.nextBadgeLabel}>NEXT BADGE</Text>
          <View style={s.nextBadgeRow}>
            <View style={[s.nextBadgeIcon, { backgroundColor: `${next.badge.color}15` }]}>
              <TypedIcon name={next.badge.icon} size={14} color={next.badge.color} />
            </View>
            <View style={s.nextBadgeInfo}>
              <Text style={s.nextBadgeName}>{next.badge.name}</Text>
              <View style={s.nextBadgeProgressBg}>
                <View style={[s.nextBadgeProgressFill, { width: pctDim(next.progress), backgroundColor: next.badge.color }]} />
              </View>
            </View>
            <Text style={[s.nextBadgePct, { color: next.badge.color }]}>{Math.round(next.progress)}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Single Badge Item ───────────────────────────────────────────
export function BadgeItem({ item, compact, onPress }: { item: EarnedBadge; compact?: boolean; onPress?: () => void }) {
  const isEarned = item.earnedAt > 0;
  const rarity = RARITY_COLORS[item.badge.rarity];
  const size = compact ? 44 : 56;
  const iconSize = compact ? 18 : 22;

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps} style={[s.badgeItem, compact && s.badgeItemCompact]}>
      <View style={[
        s.badgeRing,
        {
          width: size, height: size, borderRadius: size / 2,
          borderColor: isEarned ? rarity.border : Colors.border,
          backgroundColor: isEarned ? rarity.bg : Colors.surfaceRaised,
        },
      ]}>
        {/* Progress ring (background arc) */}
        {!isEarned && item.progress > 0 && (
          <View style={[s.progressOverlay, {
            width: size, height: size, borderRadius: size / 2,
            borderColor: `${item.badge.color}40`,
            borderTopColor: item.badge.color,
            transform: [{ rotate: `${(item.progress / 100) * 360}deg` }],
          }]} />
        )}
        <TypedIcon
          name={item.badge.icon}
          size={iconSize}
          color={isEarned ? item.badge.color : Colors.textTertiary}
        />
        {!isEarned && (
          <View style={s.lockOverlay}>
            <Ionicons name="lock-closed" size={8} color={Colors.textTertiary} />
          </View>
        )}
      </View>
      {!compact && (
        <Text
          style={[s.badgeName, !isEarned && s.badgeNameLocked]}
          numberOfLines={2}
        >
          {item.badge.name}
        </Text>
      )}
      {!compact && isEarned && (
        <Text style={[s.badgeRarity, { color: rarity.text }]}>
          {RARITY_LABELS[item.badge.rarity]}
        </Text>
      )}
      {!compact && !isEarned && item.progress > 0 && (
        <Text style={s.badgeProgress}>{Math.round(item.progress)}%</Text>
      )}
    </Wrapper>
  );
}

// ── Badge Category Section ──────────────────────────────────────
const CATEGORY_LABELS: Record<BadgeCategory, { label: string; icon: string }> = {
  milestone: { label: "Milestones", icon: "flag" },
  streak:    { label: "Streaks", icon: "flame" },
  explorer:  { label: "Explorer", icon: "compass" },
  social:    { label: "Social", icon: "people" },
  seasonal:  { label: "Seasonal", icon: "calendar" },
  special:   { label: "Special", icon: "sparkles" },
};

export function BadgeCategorySection({
  category,
  badges,
  onBadgePress,
}: {
  category: BadgeCategory;
  badges: EarnedBadge[];
  onBadgePress?: (badge: EarnedBadge) => void;
}) {
  const catBadges = badges.filter(b => b.badge.category === category);
  if (catBadges.length === 0) return null;

  const earned = catBadges.filter(b => b.earnedAt > 0).length;
  const cat = CATEGORY_LABELS[category];

  return (
    <View style={s.categorySection}>
      <View style={s.categoryHeader}>
        <TypedIcon name={cat.icon} size={14} color={AMBER} />
        <Text style={s.categoryTitle}>{cat.label}</Text>
        <Text style={s.categoryCount}>{earned}/{catBadges.length}</Text>
      </View>
      <View style={s.badgeGrid}>
        {catBadges.map(item => (
          <BadgeItem
            key={item.badge.id}
            item={item}
            onPress={onBadgePress ? () => onBadgePress(item) : undefined}
          />
        ))}
      </View>
    </View>
  );
}

// ── Full Badge Grid (for profile page) ──────────────────────────
export function BadgeGridFull({
  badges,
  totalPossible,
  title,
  onBadgePress,
}: {
  badges: EarnedBadge[];
  totalPossible: number;
  title: string;
  onBadgePress?: (badge: EarnedBadge) => void;
}) {
  const categories: BadgeCategory[] = ["milestone", "streak", "explorer", "social", "seasonal", "special"];

  return (
    <View style={s.fullGrid}>
      <BadgeSummary badges={badges} totalPossible={totalPossible} label={title} />
      {categories.map(cat => (
        <BadgeCategorySection key={cat} category={cat} badges={badges} onBadgePress={onBadgePress} />
      ))}
    </View>
  );
}

// ── Compact Badge Row (for business detail page) ────────────────
export function BadgeRowCompact({ badges }: { badges: EarnedBadge[] }) {
  const earned = badges.filter(b => b.earnedAt > 0);
  if (earned.length === 0) return null;

  return (
    <View style={s.compactRow}>
      {earned.slice(0, 6).map(item => (
        <BadgeItem key={item.badge.id} item={item} compact />
      ))}
      {earned.length > 6 && (
        <View style={s.moreCount}>
          <Text style={s.moreCountText}>+{earned.length - 6}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    gap: 14, ...Colors.cardShadow,
  },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  summaryCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(196,154,26,0.08)", borderWidth: 3, borderColor: AMBER,
    alignItems: "center", justifyContent: "center", flexDirection: "row",
  },
  summaryCount: { fontSize: 22, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold" },
  summaryTotal: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },
  summaryInfo: { flex: 1, gap: 4 },
  summaryLabel: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  summaryBarBg: { height: 6, backgroundColor: Colors.surfaceRaised, borderRadius: 3, overflow: "hidden" },
  summaryBarFill: { height: "100%", backgroundColor: AMBER, borderRadius: 3 },
  summaryPct: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  nextBadge: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 12, gap: 6,
  },
  nextBadgeLabel: {
    fontSize: 9, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 1, textTransform: "uppercase",
  },
  nextBadgeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nextBadgeIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  nextBadgeInfo: { flex: 1, gap: 4 },
  nextBadgeName: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  nextBadgeProgressBg: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: "hidden" },
  nextBadgeProgressFill: { height: "100%", borderRadius: 2 },
  nextBadgePct: { fontSize: 12, fontWeight: "700", fontFamily: "DMSans_700Bold" },

  badgeItem: { alignItems: "center", gap: 4, width: 72 },
  badgeItemCompact: { width: 44 },
  badgeRing: {
    borderWidth: 2.5, alignItems: "center", justifyContent: "center",
  },
  progressOverlay: {
    position: "absolute", borderWidth: 2.5, borderBottomColor: "transparent",
    borderLeftColor: "transparent", borderRightColor: "transparent",
  },
  lockOverlay: {
    position: "absolute", bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  badgeName: {
    fontSize: 10, color: Colors.text, fontFamily: "DMSans_500Medium",
    textAlign: "center", lineHeight: 13,
  },
  badgeNameLocked: { color: Colors.textTertiary },
  badgeRarity: { fontSize: 8, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  badgeProgress: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  categorySection: { gap: 10 },
  categoryHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  categoryCount: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  badgeGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    backgroundColor: Colors.surface, borderRadius: 14, padding: 12,
    ...Colors.cardShadow,
  },

  fullGrid: { gap: 16 },

  compactRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  moreCount: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  moreCountText: { fontSize: 12, fontWeight: "600", color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold" },
});
