import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

/**
 * Network connectivity banner.
 * Shows a persistent bar when the device is offline.
 * Animates in/out smoothly.
 */
export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Check network status using the actual API server, not a hardcoded domain.
    // Falls back to Google's generate_204 endpoint if no API host is configured.
    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        // Use a well-known endpoint that always returns 204 — avoids reliance on our own /api/health
        await fetch("https://clients3.google.com/generate_204", {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (isOffline) {
          setWasOffline(true);
          setTimeout(() => setWasOffline(false), 3000);
        }
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    };

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [isOffline]);

  useEffect(() => {
    if (isOffline || wasOffline) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-50, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOffline, wasOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isOffline && !wasOffline) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        wasOffline && !isOffline ? styles.bannerOnline : styles.bannerOffline,
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={isOffline ? "You are offline. Some features may be limited." : "Back online."}
    >
      <Ionicons
        name={isOffline ? "cloud-offline-outline" : "checkmark-circle-outline"}
        size={14}
        color="#FFFFFF"
      />
      <Text style={styles.bannerText}>
        {isOffline
          ? "You're offline — viewing cached data"
          : "Back online"}
      </Text>
    </Animated.View>
  );
}

/**
 * Full-screen error state with retry action.
 */
export function ErrorState({
  title = "Something went wrong",
  subtitle = "Check your connection and try again",
  onRetry,
  icon = "cloud-offline-outline",
}: {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  icon?: string;
}) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name={icon as any} size={48} color={Colors.textTertiary} />
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorSubtitle}>{subtitle}</Text>
      {onRetry && (
        <View style={styles.retryBtn}>
          <Text
            style={styles.retryText}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            Retry
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Empty state for lists with no data.
 */
export function EmptyState({
  icon = "search-outline",
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon as any} size={40} color={Colors.textTertiary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingTop: Platform.OS === "ios" ? 50 : 8,
  },
  bannerOffline: {
    backgroundColor: "#E53935",
  },
  bannerOnline: {
    backgroundColor: "#4CAF50",
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "DMSans_600SemiBold",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
});
