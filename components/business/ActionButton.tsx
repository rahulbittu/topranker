/**
 * Sprint 642: Action button with icon circle for business detail.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export function ActionButton({ icon, label, onPress, disabled, accent }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  const iconColor = disabled ? Colors.textTertiary : accent ? AMBER : Colors.text;
  return (
    <TouchableOpacity
      style={[s.actionBtn, disabled && s.actionBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <View style={[s.iconCircle, accent && s.iconCircleAccent]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[s.actionBtnLabel, disabled && s.actionBtnLabelDisabled, accent && s.actionBtnLabelAccent]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default ActionButton;

const s = StyleSheet.create({
  actionBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 6,
  },
  actionBtnDisabled: { opacity: 0.4 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  iconCircleAccent: { backgroundColor: `${AMBER}10`, borderColor: `${AMBER}30` },
  actionBtnLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  actionBtnLabelDisabled: { color: Colors.textTertiary },
  actionBtnLabelAccent: { color: AMBER, fontFamily: "DMSans_600SemiBold" },
});
