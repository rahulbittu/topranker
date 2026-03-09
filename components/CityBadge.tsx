import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getCityBadge } from "@/shared/city-config";

interface CityBadgeProps {
  city: string;
}

export default function CityBadge({ city }: CityBadgeProps) {
  const badge = getCityBadge(city);

  if (badge === "beta") {
    return (
      <View style={[styles.container, styles.betaBg]}>
        <Text style={[styles.text, styles.betaText]}>BETA</Text>
      </View>
    );
  }

  if (badge === "planned") {
    return (
      <View style={[styles.container, styles.plannedBg]}>
        <Text style={[styles.text, styles.plannedText]}>COMING SOON</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    alignSelf: "center",
  },
  text: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  betaBg: { backgroundColor: "rgba(196, 154, 26, 0.2)" },
  betaText: { color: "#C49A1A" },
  plannedBg: { backgroundColor: "rgba(136, 136, 136, 0.2)" },
  plannedText: { color: "#888" },
});
