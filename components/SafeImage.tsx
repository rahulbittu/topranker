import React, { useState } from "react";
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Image, type ImageStyle } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND, getCategoryDisplay } from "@/constants/brand";

interface SafeImageProps {
  uri: string;
  style: StyleProp<ImageStyle>;
  category?: string;
  fallbackText?: string;
  contentFit?: "cover" | "contain" | "fill";
}

/**
 * Image that falls back to a branded gradient when the source fails to load.
 * Prevents blank white rectangles when photo URLs 404.
 */
export function SafeImage({ uri, style, category, fallbackText, contentFit = "cover" }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !uri) {
    const emoji = category ? getCategoryDisplay(category).emoji : "";
    return (
      <LinearGradient
        colors={[BRAND.colors.amber, BRAND.colors.navy]}
        style={[style, fallbackStyles.container]}
      >
        <Text style={fallbackStyles.emoji}>{fallbackText || emoji}</Text>
      </LinearGradient>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

const fallbackStyles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 28, color: "rgba(255,255,255,0.5)" },
});
