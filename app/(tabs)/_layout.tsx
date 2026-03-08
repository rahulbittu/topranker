import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Platform, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { hapticTabSwitch } from "@/lib/audio";

const AMBER = BRAND.colors.amber;

function TabIcon({ name, color, focused }: { name: React.ComponentProps<typeof Ionicons>["name"]; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.6);

  useEffect(() => {
    if (focused) {
      // Unified spring config for cohesive motion
      const springConfig = { damping: 14, stiffness: 160 };
      scale.value = withSpring(1.12, springConfig);
      glowOpacity.value = withSpring(1, springConfig);
      glowScale.value = withSpring(1, springConfig);
      hapticTabSwitch();
    } else {
      const springConfig = { damping: 16, stiffness: 140 };
      scale.value = withSpring(1, springConfig);
      glowOpacity.value = withSpring(0, springConfig);
      glowScale.value = withSpring(0.5, springConfig);
    }
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={tabStyles.iconContainer}>
      {/* Golden glow behind icon when selected */}
      <Animated.View style={[tabStyles.glow, glowStyle]} />
      <Animated.View style={[tabStyles.iconWrap, iconStyle]}>
        <Ionicons name={name} size={22} color={color} />
      </Animated.View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 32,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  glow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.amberGlow,
    // Soft amber glow shadow
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
});

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Rankings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="challenger">
        <Icon sf={{ default: "bolt", selected: "bolt.fill" }} />
        <Label>Challenger</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND.colors.amber,
        tabBarInactiveTintColor: Colors.textTertiary,
        ...(isWeb ? { sceneStyle: { maxWidth: 600, alignSelf: "center" as const, width: "100%" } } : {}),
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          ...(isWeb ? { height: 56 + 28 } : { height: 56 + 34 }),
          paddingTop: 6,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surface }]} />
        ),
        tabBarLabelStyle: {
          fontFamily: "DMSans_600SemiBold",
          fontSize: 10,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Rankings",
          tabBarIcon: ({ color, focused }) => <TabIcon name="bar-chart" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="challenger"
        options={{
          title: "Challenger",
          tabBarIcon: ({ color, focused }) => <TabIcon name="flash" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => <TabIcon name="compass" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
