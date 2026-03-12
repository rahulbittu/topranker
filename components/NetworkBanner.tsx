import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { BRAND } from "@/constants/brand";
import { isServingMockData, resetMockDataFlag } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Network connectivity banner.
 * Shows a persistent bar when the device is offline or serving mock data.
 * Web: navigator.onLine + online/offline events (reliable, no CORS issues).
 * Native (Sprint 688): NetInfo for real-time connectivity monitoring.
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

    if (Platform.OS === "web" && typeof navigator !== "undefined") {
      // Web: use navigator.onLine + online/offline events (reliable, no CORS)
      if (!navigator.onLine) goOffline();
      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);
      return () => {
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }

    // Sprint 688: Native platforms — use NetInfo for real-time connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected === false || state.isInternetReachable === false) {
        goOffline();
      } else {
        goOnline();
      }
    });
    return () => unsubscribe();
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

// Sprint 697: ErrorState and EmptyState extracted to components/ErrorState.tsx
export { ErrorState, EmptyState } from "@/components/ErrorState";

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
});
