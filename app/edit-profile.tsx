import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/query-client";
import { hapticPress } from "@/lib/audio";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);

  const hasChanges =
    displayName.trim() !== (user?.displayName ?? "") ||
    username.trim() !== (user?.username ?? "");

  const handleSave = async () => {
    if (!hasChanges) return;

    const trimmedName = displayName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      Alert.alert("Validation", "Display name cannot be empty.");
      return;
    }
    if (!trimmedUsername) {
      Alert.alert("Validation", "Username cannot be empty.");
      return;
    }
    if (trimmedUsername.length < 3) {
      Alert.alert("Validation", "Username must be at least 3 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest("PUT", "/api/members/me", {
        displayName: trimmedName,
        username: trimmedUsername,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update profile");
      }
      await refreshUser();
      Alert.alert("Success", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user?.displayName || "U")}
              </Text>
            </View>
            <View style={styles.avatarEditOverlay}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </View>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <Text style={styles.sectionHeader}>PROFILE INFORMATION</Text>
        <View style={styles.card}>
          {/* Display Name */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />
          </View>

          {/* Username */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.usernameRow}>
              <Text style={styles.atPrefix}>@</Text>
              <TextInput
                style={[styles.fieldInput, { flex: 1 }]}
                value={username}
                onChangeText={(text) => setUsername(text.replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder="username"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
            </View>
          </View>

          {/* Email (read-only) */}
          <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputDisabled]}
              value={user?.email ?? ""}
              editable={false}
              selectTextOnFocus={false}
            />
            <Text style={styles.fieldHint}>Email cannot be changed</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!hasChanges || saving) && styles.saveBtnDisabled,
          ]}
          onPress={() => { hapticPress(); handleSave(); }}
          disabled={!hasChanges || saving}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  /* Avatar */
  avatarSection: { alignItems: "center", marginTop: 24, marginBottom: 8 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BRAND.colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: BRAND.colors.amber,
    fontFamily: "DMSans_800ExtraBold",
  },
  avatarEditOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND.colors.amber,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginTop: 8,
  },

  /* Section header */
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },

  /* Card */
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    ...Colors.cardShadow,
  },

  /* Field rows */
  fieldRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
    marginBottom: 6,
    textTransform: "uppercase" as any,
    letterSpacing: 0.5,
  },
  fieldInput: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  fieldInputDisabled: {
    color: Colors.textTertiary,
    backgroundColor: "transparent",
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginTop: 4,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  atPrefix: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
    marginRight: 2,
    paddingVertical: 6,
  },

  /* Save button */
  saveBtn: {
    marginTop: 32,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Colors.cardShadow,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "DMSans_700Bold",
  },
});
