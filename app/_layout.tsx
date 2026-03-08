import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from "@expo-google-fonts/dm-sans";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
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
import Colors from "@/constants/colors";
import { NetworkBanner } from "@/components/NetworkBanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications } from "@/lib/notifications";
import { hapticSplashCrown, hapticSplashLogo } from "@/lib/audio";
import { ONBOARDING_KEY } from "@/app/onboarding";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { useRealtimeEvents } from "@/lib/use-realtime";

async function savePushToken(token: string) {
  try {
    await apiRequest("POST", `${getApiUrl()}/api/members/me/push-token`, { pushToken: token });
  } catch {
    // Non-critical — token will be retried next app launch
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
    // Phase 1: Radial glow ring expands (0ms)
    ringOpacity.value = withTiming(0.4, { duration: 600 });
    ringScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Phase 2: Crown drops with heavy haptic (150ms)
    setTimeout(() => hapticSplashCrown(), 150);
    crownScale.value = withDelay(150, withSequence(
      withSpring(1.3, { damping: 5, stiffness: 180 }),
      withSpring(1, { damping: 8, stiffness: 120 }),
    ));
    crownRotate.value = withDelay(150, withSequence(
      withSpring(12, { damping: 5, stiffness: 150 }),
      withSpring(-3, { damping: 6 }),
      withSpring(0, { damping: 10 }),
    ));
    // Crown golden glow pulse
    crownGlow.value = withDelay(300, withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.6, { duration: 400 }),
    ));

    // Phase 3: Logo text fades in with scale and track-in (400ms)
    setTimeout(() => hapticSplashLogo(), 400);
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(400, withSequence(
      withSpring(1.08, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 12 }),
    ));
    logoLetterSpacing.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Phase 4: Background ambient glow pulse (600ms)
    bgGlow.value = withDelay(600, withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0.5, { duration: 800 }),
    ));

    // Phase 5: Decorative line extends (800ms)
    lineOpacity.value = withDelay(800, withTiming(1, { duration: 300 }));
    lineWidth.value = withDelay(800, withTiming(140, { duration: 700, easing: Easing.out(Easing.cubic) }));

    // Phase 6: Tagline reveals (1100ms)
    taglineOpacity.value = withDelay(1100, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    taglineY.value = withDelay(1100, withSpring(0, { damping: 14, stiffness: 80 }));

    // Phase 7: Ring fades (1400ms)
    ringOpacity.value = withDelay(1400, withTiming(0, { duration: 600 }));

    // Phase 8: Cinematic zoom exit (2400ms)
    containerScale.value = withDelay(2400, withTiming(1.12, { duration: 500, easing: Easing.in(Easing.cubic) }));
    containerOpacity.value = withDelay(2400, withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }, () => {
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

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="business/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="business/claim" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="business/enter-challenger" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="business/enter-featured" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="business/enter-dashboard-pro" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="business/qr" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="business/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
      <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
      <Stack.Screen name="admin/index" options={{ headerShown: false }} />
      <Stack.Screen name="rate/[id]" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="saved" options={{ headerShown: false }} />
      <Stack.Screen name="referral" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false, presentation: "modal" }} />
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
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_900Black,
  });

  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useRef(() => {
    setShowSplash(false);
    // Check onboarding flag — navigate if first launch
    AsyncStorage.getItem(ONBOARDING_KEY).then((seen) => {
      if (!seen) {
        router.replace("/onboarding");
      }
    });
  }).current;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        console.log("[Push] Token:", token);
        // Store token on backend
        savePushToken(token);
      }
    });

    // Handle notification taps — navigate to the right screen
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const screen = data?.screen as string | undefined;
      if (screen === "challenger") {
        router.push("/(tabs)/challenger");
      } else if (screen === "profile") {
        router.push("/(tabs)/profile");
      } else if (screen === "search") {
        router.push("/(tabs)/search");
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
          <CityProvider>
            <BookmarksProvider>
              <GestureHandlerRootView style={styles.root}>
                <KeyboardProvider>
                  <RootLayoutNav />
                  <NetworkBanner />
                  {showSplash && <AnimatedSplash onFinish={handleSplashFinish} />}
                </KeyboardProvider>
              </GestureHandlerRootView>
            </BookmarksProvider>
          </CityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});
