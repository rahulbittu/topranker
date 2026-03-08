import React, { useState } from "react";
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Image, type ImageStyle } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND, getCategoryDisplay } from "@/constants/brand";

/**
 * Accepts both ImageStyle and ViewStyle to avoid `as any` casts at call sites.
 * expo-image's Image component accepts ViewStyle-compatible styles at runtime.
 */
type SafeImageStyle = StyleProp<ImageStyle> | StyleProp<ViewStyle>;

interface SafeImageProps {
  uri: string;
  style: SafeImageStyle;
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
    const initial = fallbackText?.charAt(0)?.toUpperCase() || "";
    const emoji = category ? getCategoryDisplay(category).emoji : "";
    return (
      <LinearGradient
        colors={[BRAND.colors.amber, BRAND.colors.amberDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[style as StyleProp<ViewStyle>, fallbackStyles.container]}
      >
        {initial ? (
          <Text style={fallbackStyles.initial}>{initial}</Text>
        ) : (
          <Text style={fallbackStyles.emoji}>{emoji}</Text>
        )}
      </LinearGradient>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style as StyleProp<ImageStyle>}
      contentFit={contentFit}
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

const fallbackStyles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  initial: { fontSize: 32, fontWeight: "800", color: "#FFFFFF", fontFamily: "PlayfairDisplay_900Black" },
  emoji: { fontSize: 28, color: "rgba(255,255,255,0.5)" },
});
