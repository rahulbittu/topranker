import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";

export function LegalLinksSection() {
  return (
    <>
      <View style={s.legalLinks}>
        <TouchableOpacity
          style={s.legalLink}
          onPress={() => router.push("/legal/terms")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Terms of Service"
        >
          <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
          <Text style={s.legalLinkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.legalLink}
          onPress={() => router.push("/legal/privacy")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Privacy Policy"
        >
          <Ionicons name="shield-outline" size={14} color={Colors.textTertiary} />
          <Text style={s.legalLinkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.legalLink}
          onPress={() => router.push("/legal/accessibility")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Accessibility Statement"
        >
          <Ionicons name="accessibility-outline" size={14} color={Colors.textTertiary} />
          <Text style={s.legalLinkText}>Accessibility</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={s.deleteAccountBtn}
        onPress={() => {
          Alert.alert(
            "Delete Account",
            "This will permanently delete your account and all your ratings within 30 days. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete My Account",
                style: "destructive",
                onPress: () => {
                  Alert.alert("Account Deletion Requested", "Your account will be deleted within 30 days. You will receive an email confirmation.");
                },
              },
            ]
          );
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Delete your account"
      >
        <Ionicons name="trash-outline" size={14} color={Colors.red} />
        <Text style={s.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
    </>
  );
}

const s = StyleSheet.create({
  legalLinks: {
    marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border,
    marginHorizontal: 20, gap: 2,
  },
  legalLink: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 },
  legalLinkText: { flex: 1, ...TYPOGRAPHY.ui.body, color: Colors.textSecondary },
  deleteAccountBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 24, paddingVertical: 12,
  },
  deleteAccountText: { fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium" },
});
