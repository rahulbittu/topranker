/**
 * Sprint 432: Photo metadata bar for lightbox overlay.
 *
 * Shows photo attribution (uploader, date, verification status)
 * and thumbnail strip for quick navigation in fullscreen lightbox.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeImage } from "@/components/SafeImage";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
const AMBER = BRAND.colors.amber;

export interface PhotoMeta {
  url: string;
  uploaderName?: string;
  uploadDate?: string;
  isVerified?: boolean;
  source?: "business" | "community" | "rating";
}

export interface PhotoMetadataBarProps {
  photos: PhotoMeta[];
  currentIndex: number;
  onThumbnailPress: (index: number) => void;
  category: string;
}

const SOURCE_LABELS: Record<string, { label: string; icon: IoniconsName; color: string }> = {
  business: { label: "Business photo", icon: "storefront-outline", color: "#4A90D9" },
  community: { label: "Community photo", icon: "people-outline", color: AMBER },
  rating: { label: "From a rating", icon: "star-outline", color: "#FF6B35" },
};

function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PhotoMetadataBar({ photos, currentIndex, onThumbnailPress, category }: PhotoMetadataBarProps) {
  const current = photos[currentIndex];
  if (!current) return null;

  const sourceInfo = current.source ? SOURCE_LABELS[current.source] : null;

  return (
    <View style={s.container}>
      {/* Metadata row */}
      <View style={s.metaRow}>
        {sourceInfo && (
          <View style={s.sourceBadge}>
            <Ionicons name={sourceInfo.icon} size={11} color={sourceInfo.color} />
            <Text style={[s.sourceText, { color: sourceInfo.color }]}>{sourceInfo.label}</Text>
          </View>
        )}
        {current.uploaderName && (
          <View style={s.uploaderRow}>
            <Ionicons name="person-outline" size={10} color="rgba(255,255,255,0.6)" />
            <Text style={s.uploaderText}>{current.uploaderName}</Text>
          </View>
        )}
        {current.uploadDate && (
          <Text style={s.dateText}>{formatRelativeDate(current.uploadDate)}</Text>
        )}
        {current.isVerified && (
          <View style={s.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={10} color={Colors.green} />
            <Text style={s.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.thumbStrip}
        >
          {photos.map((photo, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onThumbnailPress(i)}
              activeOpacity={0.8}
              style={[s.thumbWrap, i === currentIndex && s.thumbActive]}
              accessibilityRole="button"
              accessibilityLabel={`Go to photo ${i + 1}`}
            >
              <SafeImage
                uri={photo.url}
                style={s.thumbImage}
                contentFit="cover"
                category={category}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 10 },
  metaRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16,
  },
  sourceBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  sourceText: { fontSize: 10, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  uploaderRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  uploaderText: {
    fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "DMSans_400Regular",
  },
  dateText: {
    fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "DMSans_400Regular",
  },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(52,199,89,0.15)", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9, fontWeight: "600", color: Colors.green, fontFamily: "DMSans_600SemiBold",
  },
  thumbStrip: { paddingHorizontal: 16, gap: 6 },
  thumbWrap: {
    width: 48, height: 48, borderRadius: 6, overflow: "hidden",
    borderWidth: 2, borderColor: "transparent",
  },
  thumbActive: { borderColor: AMBER },
  thumbImage: { width: "100%", height: "100%" },
});
