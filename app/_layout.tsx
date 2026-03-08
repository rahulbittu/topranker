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
import { StyleSheet, View, Text } from "react-native";
import * as Notifications from "expo-notifications";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, withSpring, Easing, runOnJS,
} from "react-native-reanimated";
import { BRAND } from "@/constants/brand";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { CityProvider } from "@/lib/city-context";
import { BookmarksProvider } from "@/lib/bookmarks-context";
import Colors from "@/constants/colors";
import { registerForPushNotifications } from "@/lib/notifications";
import { hapticSplashCrown, hapticSplashLogo } from "@/lib/audio";

SplashScreen.preventAutoHideAsync();

function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const crownScale = useSharedValue(0);
  const crownRotate = useSharedValue(-15);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslate = useSharedValue(20);
  const lineWidth = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  useEffect(() => {
    // Crown haptic on drop
    setTimeout(() => hapticSplashCrown(), 100);
    setTimeout(() => hapticSplashLogo(), 300);

    // Crown drops in with bounce
    crownScale.value = withDelay(100, withSequence(
      withSpring(1.2, { damping: 6, stiffness: 150 }),
      withSpring(1, { damping: 10 }),
    ));
    crownRotate.value = withDelay(100, withSequence(
      withSpring(8, { damping: 6 }),
      withSpring(0, { damping: 10 }),
    ));
    // Logo text fades and scales
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(300, withSequence(
      withSpring(1.05, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 14 }),
    ));
    // Decorative line extends
    lineWidth.value = withDelay(700, withTiming(120, { duration: 600, easing: Easing.out(Easing.cubic) }));
    // Tagline slides up and fades in
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    taglineTranslate.value = withDelay(900, withSpring(0, { damping: 14 }));
    // Cinematic exit: scale up slightly + fade out
    containerScale.value = withDelay(2200, withTiming(1.05, { duration: 400, easing: Easing.in(Easing.cubic) }));
    containerOpacity.value = withDelay(2200, withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, () => {
      runOnJS(onFinish)();
    }));
  }, []);

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }, { rotate: `${crownRotate.value}deg` }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslate.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <Animated.View style={[splashStyles.container, containerStyle]} pointerEvents="none">
      <Animated.View style={crownStyle}>
        <Text style={splashStyles.crown}>👑</Text>
      </Animated.View>
      <Animated.View style={logoStyle}>
        <Text style={splashStyles.logo}>TopRanker</Text>
      </Animated.View>
      <Animated.View style={[splashStyles.decorLine, lineStyle]} />
      <Animated.View style={taglineStyle}>
        <Text style={splashStyles.tagline}>Trust-weighted rankings</Text>
        <Text style={splashStyles.taglineSub}>Dallas, TX</Text>
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
  crown: { fontSize: 56, textAlign: "center", marginBottom: 4 },
  logo: {
    fontSize: 40, fontWeight: "900", color: BRAND.colors.amber,
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -1.5, textAlign: "center",
  },
  decorLine: {
    height: 1, backgroundColor: "rgba(196,154,26,0.3)", marginVertical: 12,
  },
  tagline: {
    fontSize: 15, color: "rgba(255,255,255,0.7)",
    fontFamily: "DMSans_500Medium", textAlign: "center", letterSpacing: 1,
  },
  taglineSub: {
    fontSize: 11, color: "rgba(255,255,255,0.35)",
    fontFamily: "DMSans_400Regular", textAlign: "center", marginTop: 4, letterSpacing: 2,
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
      <Stack.Screen name="business/qr" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="business/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="admin/index" options={{ headerShown: false }} />
      <Stack.Screen name="rate/[id]" options={{ headerShown: false, presentation: "modal" }} />
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) console.log("[Push] Token:", token);
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
                  {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
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
