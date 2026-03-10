/**
 * Sprint 317: Extracted from app/dish/[slug].tsx
 *
 * DishEntryCard renders a single ranked entry in a dish leaderboard:
 * photo with rank badge, business name, dish score, rating count,
 * early data badge, and rate button.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeImage } from "@/components/SafeImage";
import { BRAND } from "@/constants/brand";
import { TYPOGRAPHY } from "@/constants/typography";
import { pct } from "@/lib/style-helpers";
import { shareToWhatsApp, getBestInShareText, getShareUrl } from "@/lib/sharing";

const AMBER = BRAND.colors.amber;

export interface DishEntryCardProps {
  entry: {
    id: string;
    businessSlug: string;
    businessName: string;
    neighborhood: string | null;
    photoUrl: string | null;
    rankPosition: number;
    dishScore: string;
    dishRatingCount: number;
  };
  dishName: string;
  city?: string;
}

export function DishEntryCard({ entry, dishName, city }: DishEntryCardProps) {
  return (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: entry.businessSlug } })}
      activeOpacity={0.7}
    >
      <View style={styles.entryPhoto}>
        <SafeImage
          source={{ uri: entry.photoUrl || undefined }}
          style={styles.entryPhotoImg}
          fallbackGradient
        />
        <View style={styles.rankBadge}>
          <Text style={styles.rankBadgeText}>{entry.rankPosition}</Text>
        </View>
      </View>
      <View style={styles.entryInfo}>
        <View style={styles.entryRow}>
          <Text style={styles.entryName} numberOfLines={1}>{entry.businessName}</Text>
          {entry.neighborhood && (
            <Text style={styles.entryNeighborhood}>{entry.neighborhood}</Text>
          )}
        </View>
        <View style={styles.entryRow}>
          <Text style={styles.entryScore}>
            {parseFloat(entry.dishScore).toFixed(1)}
          </Text>
          <Text style={styles.entryScoreLabel}>
            {dishName} score
          </Text>
        </View>
        <Text style={styles.entryRaterCount}>
          Based on {entry.dishRatingCount} {dishName.toLowerCase()} ratings
        </Text>
        {entry.dishRatingCount < 5 && (
          <View style={styles.earlyDataBadge}>
            <Text style={styles.earlyDataText}>Early data</Text>
          </View>
        )}
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={styles.rateEntryButton}
            onPress={() => router.push({ pathname: "/rate/[id]", params: { id: entry.businessSlug, dish: dishName } })}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${dishName} at ${entry.businessName}`}
          >
            <Ionicons name="star-outline" size={14} color={AMBER} />
            <Text style={styles.rateEntryText}>Rate {dishName}</Text>
          </TouchableOpacity>
          {/* Sprint 539: WhatsApp share */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => {
              const url = getShareUrl("business", entry.businessSlug);
              const text = getBestInShareText(dishName, city || "Dallas", entry.businessName, entry.rankPosition, url);
              shareToWhatsApp(text);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Share ${entry.businessName} on WhatsApp`}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  entryCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
    backgroundColor: "#fff", overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  entryPhoto: { height: 150, width: pct(100) },
  entryPhotoImg: { width: pct(100), height: pct(100) },
  rankBadge: {
    position: "absolute", bottom: 8, left: 8, width: 32, height: 32,
    borderRadius: 16, backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  rankBadgeText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  entryInfo: { padding: 12 },
  entryRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 2 },
  entryName: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
  entryNeighborhood: { fontSize: 12, color: "#636366" },
  entryScore: {
    fontSize: 28, fontWeight: "700", color: AMBER,
    fontFamily: TYPOGRAPHY.score?.fontFamily || "System",
  },
  entryScoreLabel: { fontSize: 11, color: "#636366" },
  entryRaterCount: { fontSize: 12, color: "#999", marginTop: 4 },
  earlyDataBadge: {
    backgroundColor: "rgba(196,154,26,0.12)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", marginTop: 6,
  },
  earlyDataText: { fontSize: 10, color: AMBER, fontWeight: "600" },
  entryActions: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8,
  },
  rateEntryButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    backgroundColor: "rgba(196,154,26,0.08)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.2)",
  },
  rateEntryText: { fontSize: 12, fontWeight: "600", color: AMBER },
  whatsappBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(37,211,102,0.12)",
    alignItems: "center", justifyContent: "center",
  },
});
