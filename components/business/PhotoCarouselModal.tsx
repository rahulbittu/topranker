// Sprint 563: Extracted from CollapsibleReviews.tsx (was at 407/420 LOC — 97% threshold)
import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, FlatList, Dimensions, ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { BRAND } from "@/constants/brand";
import type { RatingPhotoData } from "@/lib/api";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function PhotoCarouselModal({ visible, photos, loading, onClose }: {
  visible: boolean; photos: RatingPhotoData[]; loading: boolean; onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.carouselOverlay}>
        <TouchableOpacity style={s.carouselClose} onPress={onClose}>
          <Ionicons name="close-circle" size={32} color="#fff" />
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color={BRAND.colors.amber} />
        ) : photos.length === 0 ? (
          <Text style={s.carouselEmpty}>No photos available</Text>
        ) : (
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <View style={s.carouselSlide}>
                <Image source={{ uri: item.photoUrl }} style={s.carouselImage} contentFit="contain" />
                {item.isVerifiedReceipt && (
                  <View style={s.carouselReceiptBadge}>
                    <Ionicons name="receipt-outline" size={14} color="#fff" />
                    <Text style={s.carouselReceiptText}>Receipt</Text>
                  </View>
                )}
              </View>
            )}
          />
        )}
        <Text style={s.carouselCount}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</Text>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  carouselOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center", alignItems: "center",
  },
  carouselClose: { position: "absolute" as const, top: 50, right: 20, zIndex: 10 },
  carouselSlide: { width: SCREEN_WIDTH, justifyContent: "center" as const, alignItems: "center" as const },
  carouselImage: { width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH - 32, borderRadius: 12 },
  carouselReceiptBadge: {
    position: "absolute" as const, bottom: 16, left: 32,
    flexDirection: "row" as const, alignItems: "center" as const, gap: 4,
    backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  carouselReceiptText: { fontSize: 11, color: "#fff", fontWeight: "600" as const },
  carouselEmpty: { fontSize: 14, color: "#fff", fontFamily: "DMSans_400Regular" },
  carouselCount: { position: "absolute" as const, bottom: 40, fontSize: 12, color: "rgba(255,255,255,0.6)" },
});
