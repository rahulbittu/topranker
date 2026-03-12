import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from "@expo-google-fonts/dm-sans";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Dimensions, StatusBar, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, withSpring, Easing, runOnJS,
} from "react-native-reanimated";
import { BRAND } from "@/constants/brand";
import { LeaderboardMark } from "@/components/Logo";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { CityProvider } from "@/lib/city-context";
import { BookmarksProvider } from "@/lib/bookmarks-context";
import { ThemeProvider } from "@/lib/theme-context";
import Colors from "@/constants/colors";
import { NetworkBanner } from "@/components/NetworkBanner";
import { CookieConsent } from "@/components/CookieConsent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications, isValidDeepLinkScreen } from "@/lib/notifications";
import { initSyncService } from "@/lib/offline-sync-service";
import { hapticSplashCrown, hapticSplashLogo } from "@/lib/audio";
import { ONBOARDING_KEY } from "@/app/onboarding";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { useRealtimeEvents } from "@/lib/use-realtime";
import { Analytics } from "@/lib/analytics";

async function savePushToken(token: string) {
  try {
    await apiRequest("POST", `${getApiUrl()}/api/members/me/push-token`, { pushToken: token });
  } catch {
    // Non-critical — token will be retried next app launch
  }
}

// Sprint 501: Report notification open to server for analytics
async function reportNotificationOpened(notificationId: string, category: string) {
  try {
    await apiRequest("POST", `${getApiUrl()}/api/notifications/opened`, { notificationId, category });
  } catch {
    // Non-critical — analytics can tolerate missed events
  }
}

SplashScreen.preventAutoHideAsync();

const { width: SPLASH_W, height: SPLASH_H } = Dimensions.get("window");

function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  // Background pulse
  const bgGlow = useSharedValue(0);
  // Crown
  const crownScale = useSharedValue(0);
  const crownRotate = useSharedValue(-20);
  const crownGlow = useSharedValue(0);
  // Logo
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const logoLetterSpacing = useSharedValue(8);
  // Divider line
  const lineWidth = useSharedValue(0);
  const lineOpacity = useSharedValue(0);
  // Tagline
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(30);
  // Container exit
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);
  // Radial glow ring
  const ringScale = useSharedValue(0.3);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    // Sprint 699: Tightened splash from ~2.9s to ~2.1s for faster time-to-interactive

    // Phase 1: Radial glow ring expands (0ms)
    ringOpacity.value = withTiming(0.4, { duration: 400 });
    ringScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });

    // Phase 2: Crown drops with heavy haptic (100ms)
    setTimeout(() => hapticSplashCrown(), 100);
    crownScale.value = withDelay(100, withSequence(
      withSpring(1.3, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 140 }),
    ));
    crownRotate.value = withDelay(100, withSequence(
      withSpring(10, { damping: 6, stiffness: 180 }),
      withSpring(0, { damping: 12 }),
    ));
    // Crown golden glow pulse
    crownGlow.value = withDelay(200, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0.6, { duration: 300 }),
    ));

    // Phase 3: Logo text fades in with scale and track-in (300ms)
    setTimeout(() => hapticSplashLogo(), 300);
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(300, withSequence(
      withSpring(1.08, { damping: 10, stiffness: 120 }),
      withSpring(1, { damping: 14 }),
    ));
    logoLetterSpacing.value = withDelay(300, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    // Phase 4: Background ambient glow pulse (450ms)
    bgGlow.value = withDelay(450, withSequence(
      withTiming(1, { duration: 350 }),
      withTiming(0.5, { duration: 500 }),
    ));

    // Phase 5: Decorative line extends (600ms)
    lineOpacity.value = withDelay(600, withTiming(1, { duration: 200 }));
    lineWidth.value = withDelay(600, withTiming(140, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Phase 6: Tagline reveals (800ms)
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    taglineY.value = withDelay(800, withSpring(0, { damping: 16, stiffness: 100 }));

    // Phase 7: Ring fades (1000ms)
    ringOpacity.value = withDelay(1000, withTiming(0, { duration: 400 }));

    // Phase 8: Cinematic zoom exit (1700ms)
    containerScale.value = withDelay(1700, withTiming(1.12, { duration: 400, easing: Easing.in(Easing.cubic) }));
    containerOpacity.value = withDelay(1700, withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, () => {
      runOnJS(onFinish)();
    }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const bgGlowStyle = useAnimatedStyle(() => ({
    opacity: bgGlow.value * 0.15,
  }));

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }, { rotate: `${crownRotate.value}deg` }],
  }));

  const crownGlowAnim = useAnimatedStyle(() => ({
    opacity: crownGlow.value,
    transform: [{ scale: 1 + crownGlow.value * 0.3 }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth.value,
    opacity: lineOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  return (
    <Animated.View style={[splashStyles.container, containerStyle]} pointerEvents="none">
      {/* Ambient background glow */}
      <Animated.View style={[splashStyles.bgGlow, bgGlowStyle]} />

      {/* Radial ring */}
      <Animated.View style={[splashStyles.ring, ringStyle]} />

      {/* Crown with golden glow */}
      <View style={splashStyles.crownWrap}>
        <Animated.View style={[splashStyles.crownGlow, crownGlowAnim]} />
        <Animated.View style={crownStyle}>
          <LeaderboardMark fill={BRAND.colors.amber} size={72} />
        </Animated.View>
      </View>

      {/* Logo text */}
      <Animated.View style={[splashStyles.logoBlock, logoStyle]}>
        <Text style={splashStyles.logoTop}>TOP</Text>
        <Text style={splashStyles.logo}>Ranker</Text>
      </Animated.View>

      {/* Decorative line */}
      <Animated.View style={[splashStyles.decorLine, lineStyle]} />

      {/* Tagline */}
      <Animated.View style={taglineStyle}>
        <Text style={splashStyles.tagline}>{BRAND.tagline}</Text>
        <Text style={splashStyles.taglineSub}>Texas</Text>
      </Animated.View>
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.colors.navy,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  bgGlow: {
    position: "absolute",
    width: SPLASH_W * 1.5,
    height: SPLASH_W * 1.5,
    borderRadius: SPLASH_W * 0.75,
    backgroundColor: BRAND.colors.amber,
  },
  ring: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(196,154,26,0.3)",
  },
  crownWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  crownGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(196,154,26,0.2)",
    shadowColor: BRAND.colors.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  logoBlock: {
    alignItems: "center",
    gap: 2,
    marginTop: 20,
  },
  logoTop: {
    fontSize: 14, fontWeight: "800", color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold", letterSpacing: 8, textTransform: "uppercase" as const,
  },
  logo: {
    fontSize: 52, fontWeight: "900", color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -2, textAlign: "center",
  },
  decorLine: {
    height: 1.5,
    backgroundColor: "rgba(196,154,26,0.4)",
    marginVertical: 16,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 16, color: "rgba(255,255,255,0.75)",
    fontFamily: "DMSans_500Medium", textAlign: "center", letterSpacing: 1.5,
  },
  taglineSub: {
    fontSize: 11, color: "rgba(255,255,255,0.35)",
    fontFamily: "DMSans_400Regular", textAlign: "center", marginTop: 6, letterSpacing: 3,
    textTransform: "uppercase" as const,
  },
});

// Sprint 669: Shared modal options for native polish (swipe-to-dismiss on iOS)
const modalOpts = {
  headerShown: false,
  presentation: "modal" as const,
  animation: "slide_from_bottom" as const,
  animationDuration: 250,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

const cardOpts = {
  headerShown: false,
  presentation: "card" as const,
  animation: "slide_from_right" as const,
  animationDuration: 250,
  gestureEnabled: true,
};

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: "slide_from_right",
        animationDuration: 250,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade", animationDuration: 200 }} />
      <Stack.Screen name="business/[id]" options={cardOpts} />
      <Stack.Screen name="business/claim" options={modalOpts} />
      <Stack.Screen name="business/enter-challenger" options={modalOpts} />
      <Stack.Screen name="business/enter-featured" options={modalOpts} />
      <Stack.Screen name="business/enter-dashboard-pro" options={modalOpts} />
      <Stack.Screen name="business/qr" options={modalOpts} />
      <Stack.Screen name="business/dashboard" options={{ headerShown: false, animation: "slide_from_right", animationDuration: 250, gestureEnabled: true }} />
      <Stack.Screen name="legal/terms" options={{ headerShown: false, animation: "fade", animationDuration: 250 }} />
      <Stack.Screen name="legal/privacy" options={{ headerShown: false, animation: "fade", animationDuration: 250 }} />
      <Stack.Screen name="admin/index" options={{ headerShown: false, animation: "slide_from_right", animationDuration: 250, gestureEnabled: true }} />
      <Stack.Screen name="dish/[slug]" options={cardOpts} />
      <Stack.Screen name="share/[slug]" options={{ headerShown: false, animation: "fade", animationDuration: 250 }} />
      <Stack.Screen name="rate/[id]" options={modalOpts} />
      <Stack.Screen name="saved" options={{ headerShown: false, animation: "slide_from_right", animationDuration: 250, gestureEnabled: true }} />
      <Stack.Screen name="referral" options={{ headerShown: false, animation: "slide_from_right", animationDuration: 250, gestureEnabled: true }} />
      <Stack.Screen name="settings" options={{ headerShown: false, animation: "slide_from_right", animationDuration: 250, gestureEnabled: true }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false, animation: "slide_from_right", animationDuration: 250, gestureEnabled: true }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade", animationDuration: 300 }} />
      <Stack.Screen name="auth/login" options={modalOpts} />
      <Stack.Screen name="auth/signup" options={modalOpts} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_900Black,
  });

  const [showSplash, setShowSplash] = useState(true);

  // Sprint 699: Prefetch onboarding flag + initial data during splash
  const onboardingSeen = useRef<boolean | null>(null);
  useEffect(() => {
    // Start prefetching while splash animation plays
    AsyncStorage.getItem(ONBOARDING_KEY).then((seen) => {
      onboardingSeen.current = !!seen;
    });
    // Prefetch default leaderboard so Rankings tab loads instantly
    queryClient.prefetchQuery({
      queryKey: ["leaderboard", "Dallas", "restaurant", null, null, null],
      queryFn: () => import("@/lib/api").then(m => m.fetchLeaderboard("Dallas", "restaurant")),
      staleTime: 30000,
    });
  }, []);

  const handleSplashFinish = useRef(() => {
    setShowSplash(false);
    // Navigate to onboarding if first launch (flag already prefetched)
    if (onboardingSeen.current === false || onboardingSeen.current === null) {
      AsyncStorage.getItem(ONBOARDING_KEY).then((seen) => {
        if (!seen) router.replace("/onboarding");
      });
    }
  }).current;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      if (typeof window !== "undefined" && (window as any).__REMOVE_LOADING) {
        (window as any).__REMOVE_LOADING();
      }
    }
  }, [fontsLoaded, fontError]);

  // Sprint 667: Initialize offline sync service
  useEffect(() => {
    initSyncService();
  }, []);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        console.log("[Push] Token:", token);
        // Store token on backend
        savePushToken(token);
      }
    });

    // Handle notification taps — navigate to the right screen
    // Sprint 182: Enhanced deep linking with entity-level navigation
    // Sprint 672: Validated screen extraction with type guard
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const screen = data?.screen;
      const slug = typeof data?.slug === "string" ? data.slug : undefined;
      const id = typeof data?.id === "string" ? data.id : undefined;
      const notifType = typeof data?.type === "string" ? data.type : "unknown";

      // Sprint 501: Report notification open for analytics
      const notifId = response.notification.request.identifier;
      reportNotificationOpened(notifId, notifType).catch(() => {});
      // Sprint 507: Client-side notification analytics
      Analytics.notificationOpenReported(notifId, notifType);

      // Sprint 672: Validate screen before navigation
      if (!isValidDeepLinkScreen(screen)) return;

      if (screen === "business" && slug) {
        router.push({ pathname: "/business/[id]", params: { id: slug } });
      } else if (screen === "challenger" && id) {
        router.push({ pathname: "/(tabs)/challenger", params: { id } });
      } else if (screen === "challenger") {
        router.push("/(tabs)/challenger");
      } else if (screen === "profile") {
        router.push("/(tabs)/profile");
      } else if (screen === "search") {
        router.push("/(tabs)/search");
      } else if (screen === "dish" && slug) {
        router.push({ pathname: "/dish/[slug]", params: { slug } });
      }
    });

    return () => subscription.remove();
  }, []);

  // Connect to SSE for near-real-time data updates
  useRealtimeEvents();

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <CityProvider>
              <BookmarksProvider>
              <GestureHandlerRootView style={styles.root}>
                {Platform.OS !== "web" && (
                  <StatusBar barStyle="light-content" backgroundColor={BRAND.colors.navy} />
                )}
                <KeyboardProvider>
                  <RootLayoutNav />
                  <NetworkBanner />
                  <CookieConsent />
                  {showSplash && <AnimatedSplash onFinish={handleSplashFinish} />}
                </KeyboardProvider>
              </GestureHandlerRootView>
              </BookmarksProvider>
            </CityProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});
