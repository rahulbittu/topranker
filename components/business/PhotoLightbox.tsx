/**
 * Sprint 413: Fullscreen photo lightbox for business detail page.
 * Swipeable gallery with pinch-to-zoom feel, photo counter, close button.
 */
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, NativeSyntheticEvent, NativeScrollEvent,
  Dimensions, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeImage } from "@/components/SafeImage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export interface PhotoLightboxProps {
  visible: boolean;
  photoUrls: string[];
  initialIndex: number;
  category: string;
  onClose: () => void;
}

export function PhotoLightbox({
  visible, photoUrls, initialIndex, category, onClose,
}: PhotoLightboxProps) {
  const insets = useSafeAreaInsets();
  const [currentIdx, setCurrentIdx] = useState(initialIndex);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentIdx(idx);
  }, []);

  if (!visible || photoUrls.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={s.backdrop}>
        {/* Close button */}
        <TouchableOpacity
          style={[s.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close photo viewer"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Photo counter */}
        <View style={[s.counter, { top: insets.top + 16 }]}>
          <Text style={s.counterText}>
            {currentIdx + 1} / {photoUrls.length}
          </Text>
        </View>

        {/* Swipeable photos */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentOffset={{ x: initialIndex * SCREEN_W, y: 0 }}
          style={s.scroll}
        >
          {photoUrls.map((url, i) => (
            <View key={i} style={s.photoWrap}>
              <SafeImage
                uri={url}
                style={s.photo}
                contentFit="contain"
                category={category}
              />
            </View>
          ))}
        </ScrollView>

        {/* Bottom hint */}
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={s.hintText}>Swipe to browse</Text>
        </View>
      </View>
    </Modal>
  );
}

export default PhotoLightbox;

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  counterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "DMSans_600SemiBold",
  },
  scroll: {
    flex: 1,
  },
  photoWrap: {
    width: SCREEN_W,
    height: SCREEN_H,
    justifyContent: "center",
    alignItems: "center",
  },
  photo: {
    width: SCREEN_W,
    height: SCREEN_H * 0.7,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "DMSans_400Regular",
  },
});
