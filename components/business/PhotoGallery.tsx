import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeImage } from "@/components/SafeImage";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;

export interface PhotoGalleryProps {
  photoUrls: string[];
  category: string;
  communityPhotoCount?: number;
  onAddPhoto?: () => void;
  onPhotoPress?: (index: number) => void;
}

export function PhotoGallery({ photoUrls, category, communityPhotoCount = 0, onAddPhoto, onPhotoPress }: PhotoGalleryProps) {
  if (photoUrls.length <= 1) return null;

  const maxGrid = 6;
  const gridPhotos = photoUrls.slice(1, maxGrid + 1);
  const overflowCount = photoUrls.length - maxGrid - 1;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>Photos</Text>
          <View style={s.photoBadge}>
            <Ionicons name="camera" size={10} color={AMBER} />
            <Text style={s.photoBadgeText}>{photoUrls.length}</Text>
          </View>
        </View>
        {communityPhotoCount > 0 && (
          <Text style={s.communityLabel}>{communityPhotoCount} from community</Text>
        )}
      </View>
      <View style={s.grid}>
        {/* Featured first photo — full width with label */}
        <TouchableOpacity style={s.featuredWrap} activeOpacity={0.9}
          onPress={() => onPhotoPress?.(0)}
          accessibilityRole="button"
          accessibilityLabel={`View photo 1 of ${photoUrls.length} fullscreen`}>
          <SafeImage
            uri={photoUrls[0]}
            style={s.featured}
            contentFit="cover"
            category={category}
          />
          <View style={s.photoIndexBadge}>
            <Text style={s.photoIndexText}>1 of {photoUrls.length}</Text>
          </View>
        </TouchableOpacity>
        {/* Remaining photos — 2-column grid */}
        <View style={s.row}>
          {gridPhotos.map((url, i) => {
            const isLast = i === gridPhotos.length - 1 && overflowCount > 0;
            return (
              <TouchableOpacity key={i} style={s.gridImageWrap} activeOpacity={0.9}
                onPress={() => onPhotoPress?.(i + 1)}
                accessibilityRole="button"
                accessibilityLabel={`View photo ${i + 2} of ${photoUrls.length} fullscreen`}>
                <SafeImage
                  uri={url}
                  style={s.gridImage}
                  contentFit="cover"
                  category={category}
                />
                {/* Sprint 402: "See all" overlay on last grid image when overflow */}
                {isLast && (
                  <View style={s.seeAllOverlay}>
                    <Text style={s.seeAllText}>+{overflowCount}</Text>
                    <Text style={s.seeAllLabel}>See all</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {/* Sprint 402: Community photo CTA */}
      {onAddPhoto && (
        <TouchableOpacity
          style={s.addPhotoCta}
          onPress={onAddPhoto}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add your photo"
        >
          <Ionicons name="camera-outline" size={14} color={AMBER} />
          <Text style={s.addPhotoText}>Add your photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default PhotoGallery;

const s = StyleSheet.create({
  container: { gap: 10 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  title: {
    fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  photoBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(196,154,26,0.1)", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8,
  },
  photoBadgeText: {
    fontSize: 11, fontWeight: "700", color: AMBER, fontFamily: "DMSans_700Bold",
  },
  communityLabel: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  grid: {
    borderRadius: 12, overflow: "hidden", gap: 3,
  },
  featuredWrap: {
    position: "relative",
  },
  featured: {
    width: pct(100), aspectRatio: 16 / 9,
    backgroundColor: Colors.surfaceRaised,
  },
  photoIndexBadge: {
    position: "absolute", bottom: 8, left: 8,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  photoIndexText: {
    fontSize: 10, color: "#FFFFFF", fontFamily: "DMSans_500Medium",
  },
  row: {
    flexDirection: "row", flexWrap: "wrap", gap: 3,
  },
  gridImageWrap: {
    width: pct(48.5), aspectRatio: 1, position: "relative",
  },
  gridImage: {
    width: pct(100), height: pct(100),
    backgroundColor: Colors.surfaceRaised,
  },
  seeAllOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
    borderRadius: 0,
  },
  seeAllText: {
    fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold",
  },
  seeAllLabel: {
    fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: "DMSans_400Regular",
  },
  addPhotoCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: "rgba(196,154,26,0.06)", borderWidth: 1, borderColor: "rgba(196,154,26,0.15)",
  },
  addPhotoText: {
    fontSize: 13, color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
});
