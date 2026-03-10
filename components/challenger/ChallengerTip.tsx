import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const CHALLENGER_TIP_KEY = "challenger_tip_dismissed";

export function useChallengerTip() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHALLENGER_TIP_KEY).then((val) => {
      if (val !== "true") setShowTip(true);
    });
  }, []);

  const dismissTip = useCallback(() => {
    setShowTip(false);
    AsyncStorage.setItem(CHALLENGER_TIP_KEY, "true");
  }, []);

  return { showTip, dismissTip };
}

export function ChallengerTipCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <View style={s.tipCard}>
      <Ionicons name="trophy-outline" size={20} color={BRAND.colors.amber} style={s.tipIcon} />
      <View style={s.tipTextStack}>
        <Text style={s.tipTitle}>Watch businesses compete head-to-head</Text>
        <Text style={s.tipSubtext}>Vote for your favorite and help decide the winner</Text>
      </View>
      <TouchableOpacity
        style={s.tipDismiss}
        onPress={onDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Dismiss tip"
      >
        <Ionicons name="close" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipTextStack: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  tipSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    marginTop: 2,
  },
  tipDismiss: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
