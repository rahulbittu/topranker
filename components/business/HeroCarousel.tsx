import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";

const HERO_HEIGHT = 280;

export interface HeroCarouselProps {
  photoUrls: string[];
  heroPhotoIdx: number;
  screenWidth: number;
  businessName: string;
  category: string;
  saved: boolean;
  topPad: number;
  onHeroScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onBack: () => void;
  onToggleBookmark: () => void;
  onShare: () => void;
  onPhotoPress?: (index: number) => void;
}

export function HeroCarousel({
  photoUrls, heroPhotoIdx, screenWidth, businessName, category,
  saved, topPad, onHeroScroll, onBack, onToggleBookmark, onShare, onPhotoPress,
}: HeroCarouselProps) {
  return (
    <View style={s.heroImageContainer}>
      {photoUrls.length > 0 ? (
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onScroll={onHeroScroll} scrollEventThrottle={16}
        >
          {photoUrls.map((url, i) => (
            <TouchableOpacity key={i} activeOpacity={0.9}
              onPress={() => onPhotoPress?.(i)}
              accessibilityRole="button"
              accessibilityLabel={`View photo ${i + 1} of ${photoUrls.length} fullscreen`}>
              <SafeImage uri={url} style={[s.heroImage, { width: screenWidth }]}
                contentFit="cover" category={category}
                fallbackText={businessName.charAt(0).toUpperCase()} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <LinearGradient colors={[BRAND.colors.amber, BRAND.colors.amberDark]}
          style={[s.heroImage, s.heroImagePlaceholder, { width: screenWidth }]}>
          <Text style={s.heroPlaceholderInitial}>{businessName.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      )}

      {photoUrls.length > 1 && photoUrls.length <= 5 && (
        <View style={s.heroDotContainer}>
          {photoUrls.map((_, i) => (
            <View key={i} style={[s.heroDot, i === heroPhotoIdx ? s.heroDotActive : s.heroDotInactive]} />
          ))}
        </View>
      )}
      {photoUrls.length > 5 && (
        <View style={s.photoCountBadge}>
          <Ionicons name="images-outline" size={12} color="#fff" />
          <Text style={s.photoCountText}>{heroPhotoIdx + 1} / {photoUrls.length}</Text>
        </View>
      )}

      <View style={[s.navBar, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={onBack} style={s.navBtn} hitSlop={8}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={s.navBtnGroup}>
          <TouchableOpacity style={s.navBtn} onPress={onToggleBookmark} hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from saved" : "Save this business"}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={16}
              color={saved ? BRAND.colors.amber : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={onShare} hitSlop={8}
            accessibilityRole="button" accessibilityLabel="Share this business">
            <Ionicons name="share-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default HeroCarousel;

const s = StyleSheet.create({
  heroImageContainer: { height: HERO_HEIGHT, position: "relative" },
  heroImage: { height: HERO_HEIGHT },
  heroDotContainer: {
    flexDirection: "row", justifyContent: "center", gap: 5,
    position: "absolute", bottom: 10, left: 0, right: 0, zIndex: 5,
  },
  heroDot: { width: 7, height: 7, borderRadius: 4 },
  heroDotActive: { backgroundColor: BRAND.colors.amber },
  heroDotInactive: { backgroundColor: "rgba(255,255,255,0.6)" },
  photoCountBadge: {
    position: "absolute", bottom: 10, right: 14, zIndex: 5,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  photoCountText: {
    fontSize: 11, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold",
  },
  heroImagePlaceholder: {
    backgroundColor: BRAND.colors.amber, alignItems: "center", justifyContent: "center",
  },
  heroPlaceholderInitial: {
    fontSize: 48, fontWeight: "700", color: "#FFFFFF", fontFamily: "PlayfairDisplay_700Bold",
  },
  navBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, zIndex: 10,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  navBtnGroup: { flexDirection: "row", gap: 8 },
});
