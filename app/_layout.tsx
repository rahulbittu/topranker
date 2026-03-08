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
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
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

SplashScreen.preventAutoHideAsync();

function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Crown/logo entrance
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 120 }),
      withSpring(1, { damping: 12 }),
    );
    // Tagline fade in
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    // Fade out entire splash
    containerOpacity.value = withDelay(1800, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }, () => {
      runOnJS(onFinish)();
    }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[splashStyles.container, containerStyle]} pointerEvents="none">
      <Animated.View style={logoStyle}>
        <Text style={splashStyles.crown}>👑</Text>
        <Text style={splashStyles.logo}>TopRanker</Text>
      </Animated.View>
      <Animated.Text style={[splashStyles.tagline, taglineStyle]}>
        Trust-weighted rankings
      </Animated.Text>
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
  crown: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  logo: {
    fontSize: 36, fontWeight: "900", color: BRAND.colors.amber,
    fontFamily: "PlayfairDisplay_900Black", letterSpacing: -1, textAlign: "center",
  },
  tagline: {
    fontSize: 14, color: "rgba(255,255,255,0.6)",
    fontFamily: "DMSans_400Regular", marginTop: 8, textAlign: "center",
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
