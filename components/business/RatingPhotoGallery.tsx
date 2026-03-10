/**
 * Sprint 572: Rating photo gallery grid
 * Grid view of all user-submitted rating photos for a business
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";
import { PhotoCarouselModal } from "./PhotoCarouselModal";
import type { RatingPhotoData } from "@/lib/api-owner";
import Animated, { FadeInDown } from "react-native-reanimated";

const AMBER = BRAND.colors.amber;
const GRID_COLS = 3;
const GRID_GAP = 4;

export interface RatingPhotoGalleryProps {
  photos: RatingPhotoData[];
  category?: string;
  maxVisible?: number;
  delay?: number;
}

export function RatingPhotoGallery({ photos, category = "restaurant", maxVisible = 9, delay = 0 }: RatingPhotoGalleryProps) {
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (photos.length === 0) return null;

  const visiblePhotos = photos.slice(0, maxVisible);
  const overflowCount = photos.length - maxVisible;
  const hasOverflow = overflowCount > 0;
  const receiptCount = photos.filter(p => p.isVerifiedReceipt).length;

  const handlePhotoPress = (index: number) => {
    setCarouselIndex(index);
    setCarouselVisible(true);
  };

  const renderPhoto = ({ item, index }: { item: RatingPhotoData; index: number }) => {
    const isLastVisible = index === visiblePhotos.length - 1 && hasOverflow;

    return (
      <TouchableOpacity
        style={s.gridItem}
        onPress={() => handlePhotoPress(index)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Rating photo ${index + 1}${item.isVerifiedReceipt ? " (verified receipt)" : ""}`}
      >
        <SafeImage uri={item.photoUrl} style={s.gridImage} contentFit="cover" category={category} />
        {item.isVerifiedReceipt && (
          <View style={s.receiptBadge}>
            <Ionicons name="receipt-outline" size={10} color="#fff" />
          </View>
        )}
        {isLastVisible && (
          <View style={s.overflowOverlay}>
            <Text style={s.overflowText}>+{overflowCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={s.container}>
      <View style={s.header}>
        <Ionicons name="images-outline" size={16} color={AMBER} />
        <Text style={s.title}>Rating Photos</Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>{photos.length}</Text>
        </View>
        {receiptCount > 0 && (
          <View style={s.receiptCountBadge}>
            <Ionicons name="receipt-outline" size={10} color="#22C55E" />
            <Text style={s.receiptCountText}>{receiptCount} verified</Text>
          </View>
        )}
      </View>

      <FlatList
        data={visiblePhotos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        numColumns={GRID_COLS}
        scrollEnabled={false}
        columnWrapperStyle={s.gridRow}
        contentContainerStyle={s.gridContainer}
      />

      <PhotoCarouselModal
        visible={carouselVisible}
        photos={photos}
        loading={false}
        onClose={() => setCarouselVisible(false)}
      />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  countBadge: {
    backgroundColor: `${AMBER}20`,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: AMBER,
    fontFamily: "DMSans_700Bold",
  },
  receiptCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(34,197,94,0.1)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  receiptCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#22C55E",
    fontFamily: "DMSans_600SemiBold",
  },
  gridContainer: {
    gap: GRID_GAP,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative" as const,
  },
  gridImage: {
    width: "100%" as any,
    height: "100%" as any,
  },
  receiptBadge: {
    position: "absolute" as const,
    top: 4,
    right: 4,
    backgroundColor: "rgba(34,197,94,0.85)",
    borderRadius: 6,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  overflowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  overflowText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "DMSans_700Bold",
  },
});
