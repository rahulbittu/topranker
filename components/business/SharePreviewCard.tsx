/**
 * Sprint 378: Share Preview Card
 * Shows a visual preview of what the shared link looks like (Open Graph style).
 * Appears in business detail above the share/copy link actions.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";
import { getShareUrl, getShareText } from "@/lib/sharing";

const AMBER = BRAND.colors.amber;

export interface SharePreviewCardProps {
  businessName: string;
  slug: string;
  weightedScore: number;
  category: string;
  neighborhood?: string;
  city?: string;
  photoUrl?: string;
  rank?: number;
  onShare: () => void;
  onCopyLink: () => void;
}

export function SharePreviewCard({
  businessName, slug, weightedScore, category, neighborhood, city,
  photoUrl, rank, onShare, onCopyLink,
}: SharePreviewCardProps) {
  const shareUrl = getShareUrl("business", slug);
  const shareText = getShareText(businessName, weightedScore);
  const locationParts = [neighborhood, city].filter(Boolean).join(", ");

  return (
    <View style={s.container}>
      <Text style={s.sectionLabel}>SHARE THIS PLACE</Text>
      <View style={s.previewCard}>
        {photoUrl && (
          <SafeImage uri={photoUrl} style={s.previewImage} contentFit="cover" category={category} />
        )}
        <View style={s.previewContent}>
          <Text style={s.previewDomain}>topranker.com</Text>
          <Text style={s.previewTitle} numberOfLines={1}>{businessName}</Text>
          <Text style={s.previewDesc} numberOfLines={2}>
            {rank && rank > 0 ? `#${rank} • ` : ""}{"\u2B50"} {weightedScore.toFixed(1)}{locationParts ? ` • ${locationParts}` : ""}
          </Text>
        </View>
      </View>
      <View style={s.actionRow}>
        <TouchableOpacity
          style={s.shareBtn}
          onPress={onShare}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Share ${businessName}`}
        >
          <Ionicons name="share-outline" size={16} color="#fff" />
          <Text style={s.shareBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.copyBtn}
          onPress={onCopyLink}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Copy link to clipboard"
        >
          <Ionicons name="copy-outline" size={16} color={AMBER} />
          <Text style={s.copyBtnText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: Colors.textTertiary,
    letterSpacing: 1.2, textTransform: "uppercase",
    fontFamily: "DMSans_700Bold",
  },
  previewCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    overflow: "hidden", borderWidth: 1, borderColor: Colors.border,
  },
  previewImage: { width: "100%", height: 120 },
  previewContent: { padding: 12, gap: 2 },
  previewDomain: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  previewTitle: {
    fontSize: 15, fontWeight: "700", color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  previewDesc: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    lineHeight: 16,
  },
  actionRow: { flexDirection: "row", gap: 10 },
  shareBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: AMBER, borderRadius: 10,
    paddingVertical: 10,
  },
  shareBtnText: {
    fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold",
  },
  copyBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: AMBER,
  },
  copyBtnText: {
    fontSize: 14, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
});
