import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
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
  return (
    <TouchableOpacity
      style={[s.actionBtn, disabled && s.actionBtnDisabled, accent && s.actionBtnAccent]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={18} color={disabled ? Colors.textTertiary : accent ? AMBER : Colors.text} />
      <Text style={[s.actionBtnLabel, disabled && s.actionBtnLabelDisabled, accent && s.actionBtnLabelAccent]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default ActionButton;

const s = StyleSheet.create({
  actionBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.surface,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnAccent: { backgroundColor: `${AMBER}10`, borderWidth: 1, borderColor: `${AMBER}25` },
  actionBtnLabel: { fontSize: 11, color: Colors.text, fontFamily: "DMSans_500Medium" },
  actionBtnLabelDisabled: { color: Colors.textTertiary },
  actionBtnLabelAccent: { color: AMBER, fontFamily: "DMSans_600SemiBold" },
});
