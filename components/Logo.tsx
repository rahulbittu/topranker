import React from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { BRAND } from "../constants/brand";

interface MarkProps {
  fill?: string;
  size?: number;
}

export function LeaderboardMark({ fill = BRAND.colors.amber, size = 40 }: MarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="2" y="28" width="11" height="16" rx="2.5" fill={fill} />
      <Rect x="18.5" y="10" width="11" height="34" rx="2.5" fill={fill} />
      <Rect x="35" y="20" width="11" height="24" rx="2.5" fill={fill} />
      <Circle cx="24" cy="5" r="3.5" fill={fill} />
    </Svg>
  );
}

interface AppIconProps {
  size?: number;
  variant?: "amber" | "navy" | "dark" | "white";
}

export function AppIcon({ size = 80, variant = "amber" }: AppIconProps) {
  const configs = {
    amber: { bg: BRAND.colors.amber,  fill: "#fff" },
    navy:  { bg: BRAND.colors.navy,   fill: BRAND.colors.amber },
    dark:  { bg: "#111",              fill: BRAND.colors.amber },
    white: { bg: "#fff",              fill: BRAND.colors.amber },
  };
  const c = configs[variant];
  const radius = size * 0.22;

  return (
    <View style={{
      width: size, height: size,
      borderRadius: radius,
      backgroundColor: c.bg,
      alignItems: "center", justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    }}>
      <LeaderboardMark fill={c.fill} size={size * 0.52} />
    </View>
  );
}

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}

export function AppLogo({ size = "md", dark = false }: AppLogoProps) {
  const scales = { sm: 0.72, md: 1, lg: 1.35 };
  const s = scales[size];
  const textColor = dark ? "#fff" : BRAND.colors.ink;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 * s }}>
      <LeaderboardMark fill={BRAND.colors.amber} size={32 * s} />
      <View style={{ gap: 0 }}>
        <Text style={{
          fontSize: 9 * s,
          fontWeight: "800",
          color: BRAND.colors.amber,
          fontFamily: "DMSans_700Bold",
          letterSpacing: 3,
          textTransform: "uppercase",
          lineHeight: 12 * s,
        }}>
          Top
        </Text>
        <Text style={{
          fontSize: 20 * s,
          fontWeight: "900",
          color: textColor,
          fontFamily: "PlayfairDisplay_800ExtraBold",
          letterSpacing: -0.5,
          lineHeight: 22 * s,
        }}>
          Ranker
        </Text>
      </View>
    </View>
  );
}

export function SplashLogo() {
  return (
    <View style={{ alignItems: "center", gap: 16 }}>
      <AppIcon size={96} variant="amber" />
      <View style={{ alignItems: "center", gap: 2 }}>
        <Text style={{
          fontSize: 11,
          fontWeight: "800",
          color: BRAND.colors.amber,
          letterSpacing: 4,
          fontFamily: "DMSans_700Bold",
        }}>
          TOP
        </Text>
        <Text style={{
          fontSize: 38,
          fontWeight: "900",
          color: "#fff",
          fontFamily: "PlayfairDisplay_800ExtraBold",
          letterSpacing: -1,
        }}>
          Ranker
        </Text>
      </View>
      <Text style={{
        fontSize: 12,
        color: "rgba(255,255,255,0.35)",
        fontFamily: "DMSans_400Regular",
        letterSpacing: 0.5,
      }}>
        {BRAND.tagline}
      </Text>
    </View>
  );
}
