import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";
import { isServingMockData, resetMockDataFlag } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Network connectivity banner.
 * Shows a persistent bar when the device is offline or serving mock data.
 * Uses navigator.onLine + online/offline events on web (reliable, no CORS issues).
 * Does NOT ping external URLs — that causes false positives in dev.
 */
export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);
  const isMock = isServingMockData();
  const queryClient = useQueryClient();
  const wasOfflineRef = useRef(false);

  const handleRetry = async () => {
    setRetrying(true);
    resetMockDataFlag();
    await queryClient.invalidateQueries();
    setRetrying(false);
  };

  useEffect(() => {
    // On web: use navigator.onLine + online/offline events (reliable, no CORS).
    // On native: use NetInfo or similar (future). For now, don't show offline banner
    // unless the browser API explicitly says we're offline.
    if (Platform.OS === "web" && typeof navigator !== "undefined") {
      // Initial check
      if (!navigator.onLine) {
        setIsOffline(true);
        wasOfflineRef.current = true;
      }

      const goOnline = () => {
        if (wasOfflineRef.current) {
          setWasOffline(true);
          setTimeout(() => setWasOffline(false), 3000);
        }
        wasOfflineRef.current = false;
        setIsOffline(false);
      };
      const goOffline = () => {
        setIsOffline(true);
        wasOfflineRef.current = true;
      };
      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);
      return () => {
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }
    // On native platforms, don't falsely report offline
    return undefined;
  }, []);

  useEffect(() => {
    if (isOffline || wasOffline || isMock) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-50, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOffline, wasOffline, isMock]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Reset dismiss when state changes
  useEffect(() => {
    if (!isOffline && !isMock) setDismissed(false);
  }, [isOffline, isMock]);

  const showBanner = !dismissed && (isOffline || wasOffline || isMock);
  if (!showBanner) return null;

  const bannerMessage = wasOffline && !isOffline
    ? "Back online"
    : isOffline
    ? "No internet connection"
    : isMock
    ? "Demo mode — backend not connected"
    : "";

  return (
    <Animated.View
      style={[
        styles.banner,
        wasOffline && !isOffline ? styles.bannerOnline : isMock && !isOffline ? styles.bannerMock : styles.bannerOffline,
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={bannerMessage}
    >
      <Ionicons
        name={wasOffline && !isOffline ? "checkmark-circle-outline" : isMock ? "flask-outline" : "cloud-offline-outline"}
        size={14}
        color="#FFFFFF"
      />
      <Text style={styles.bannerText}>{bannerMessage}</Text>
      {isMock && !isOffline && !retrying && (
        <TouchableOpacity
          onPress={handleRetry}
          hitSlop={8}
          style={styles.retryBannerBtn}
          accessibilityRole="button"
          accessibilityLabel="Retry connecting to server"
        >
          <Text style={styles.retryBannerText}>Retry</Text>
        </TouchableOpacity>
      )}
      {(isMock || isOffline) && (
        <TouchableOpacity
          onPress={() => setDismissed(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss banner"
        >
          <Ionicons name="close" size={14} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      )}
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
      <TypedIcon name={icon} size={48} color={Colors.textTertiary} />
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
      <TypedIcon name={icon} size={40} color={Colors.textTertiary} />
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
    backgroundColor: BRAND.colors.navy,
  },
  bannerMock: {
    backgroundColor: "#6B7280",
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
  retryBannerBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  retryBannerText: {
    fontSize: 11,
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
