import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, Alert, ActivityIndicator, Image,
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
  const [firstName, setFirstName] = useState((user as any)?.firstName ?? "");
  const [lastName, setLastName] = useState((user as any)?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (user as any)?.avatarUrl ?? null,
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

  /** Upload a file (File or Blob) to the avatar endpoint via multipart FormData */
  const uploadAvatarFile = useCallback(async (file: File | Blob, filename?: string) => {
    setUploadingAvatar(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file, filename || "avatar.jpg");
      const res = await fetch("/api/members/me/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
        // Don't set Content-Type — browser sets it with the multipart boundary
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to upload avatar");
      }
      await refreshUser();
    } catch (err: any) {
      setError(err.message || "Avatar upload failed.");
    } finally {
      setUploadingAvatar(false);
    }
  }, [refreshUser]);

  /** Handle web file input change */
  const handleWebFileChange = useCallback(
    async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        Alert.alert("Invalid file", "Please select an image file.");
        return;
      }
      if (file.size > MAX_AVATAR_BYTES) {
        Alert.alert("Too large", "Image must be under 2 MB.");
        return;
      }

      // Show local preview via object URL
      setAvatarPreview(URL.createObjectURL(file));
      await uploadAvatarFile(file, file.name);
    },
    [uploadAvatarFile],
  );

  /** Tap avatar — open picker */
  const handleAvatarPress = useCallback(async () => {
    hapticPress();

    if (Platform.OS === "web") {
      // Trigger the hidden file input
      fileInputRef.current?.click();
      return;
    }

    // Mobile: try expo-image-picker
    try {
      const ImagePicker = require("expo-image-picker");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant photo library access to change your avatar.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setAvatarPreview(asset.uri);
        // Fetch the local file URI as a blob and upload via FormData
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        await uploadAvatarFile(blob, "avatar.jpg");
      }
    } catch {
      // expo-image-picker not installed — fallback alert
      Alert.alert("Not available", "Image picker is not available on this device.");
    }
  }, [uploadAvatarFile]);

  const emailChanged = email.trim() !== (user?.email ?? "");
  const hasChanges =
    displayName.trim() !== (user?.displayName ?? "") ||
    firstName.trim() !== ((user as any)?.firstName ?? "") ||
    lastName.trim() !== ((user as any)?.lastName ?? "") ||
    username.trim() !== (user?.username ?? "") ||
    emailChanged;

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
    setError("");
    setEmailConfirmation("");
    try {
      // Update display name and username if changed
      if (
        trimmedName !== (user?.displayName ?? "") ||
        trimmedUsername !== (user?.username ?? "")
      ) {
        const res = await apiRequest("PUT", "/api/members/me", {
          displayName: trimmedName,
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          username: trimmedUsername,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to update profile");
        }
      }

      // Update email if changed
      if (emailChanged) {
        const emailRes = await apiRequest("PUT", "/api/members/me/email", {
          email: email.trim(),
        });
        if (!emailRes.ok) {
          const body = await emailRes.json().catch(() => ({}));
          throw new Error(body.error || "Failed to update email");
        }
        setEmailConfirmation("Email updated successfully");
      }

      await refreshUser();
      setSaved(true);
      setTimeout(() => router.back(), emailChanged ? 3000 : 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            disabled={uploadingAvatar}
          >
            {avatarPreview ? (
              <Image
                source={{ uri: avatarPreview }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.displayName || "U")}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditOverlay}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={14} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>
          {/* Hidden file input for web */}
          {Platform.OS === "web" && (
            <input
              ref={fileInputRef as any}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleWebFileChange}
            />
          )}
          <Text style={styles.avatarHint}>
            {uploadingAvatar ? "Uploading..." : "Tap to change photo"}
          </Text>
        </View>

        {/* Form */}
        <Text style={styles.sectionHeader}>PROFILE INFORMATION</Text>
        <View style={styles.card}>
          {/* Sprint 625: First Name + Last Name */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={[
                styles.fieldInput,
                focusedField === "firstName" && styles.fieldInputFocused,
              ]}
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFocusedField("firstName")}
              onBlur={() => setFocusedField(null)}
              placeholder="First name"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={30}
            />
            <Text style={styles.fieldHint}>Shown as "First L." on your profile</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={[
                styles.fieldInput,
                focusedField === "lastName" && styles.fieldInputFocused,
              ]}
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setFocusedField("lastName")}
              onBlur={() => setFocusedField(null)}
              placeholder="Last name"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={30}
            />
          </View>
          {/* Display Name (fallback) */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
              style={[
                styles.fieldInput,
                focusedField === "displayName" && styles.fieldInputFocused,
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              onFocus={() => setFocusedField("displayName")}
              onBlur={() => setFocusedField(null)}
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
                style={[
                  styles.fieldInput,
                  { flex: 1 },
                  focusedField === "username" && styles.fieldInputFocused,
                ]}
                value={username}
                onChangeText={(text) => setUsername(text.replace(/[^a-zA-Z0-9_]/g, ""))}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                placeholder="username"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
            </View>
          </View>

          {/* Email */}
          <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[
                styles.fieldInput,
                focusedField === "email" && styles.fieldInputFocused,
              ]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              maxLength={100}
            />
            <Text style={styles.fieldHint}>Your email will be updated immediately</Text>
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

        {/* Success feedback */}
        {saved && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.successText}>Profile updated!</Text>
          </View>
        )}

        {/* Email confirmation notice */}
        {!!emailConfirmation && (
          <View style={styles.emailConfirmBanner}>
            <Ionicons name="mail-outline" size={16} color="#2563eb" />
            <Text style={styles.emailConfirmText}>{emailConfirmation}</Text>
          </View>
        )}

        {/* Error feedback */}
        {!!error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
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
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
    textTransform: "uppercase",
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

  /* Input focus */
  fieldInputFocused: {
    borderBottomColor: BRAND.colors.amber,
    borderBottomWidth: 2,
  },

  /* Success banner */
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    gap: 8,
  },
  successText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#16a34a",
    fontFamily: "DMSans_600SemiBold",
  },

  /* Email confirmation banner */
  emailConfirmBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    gap: 6,
  },
  emailConfirmText: {
    fontSize: 13,
    color: "#2563eb",
    fontFamily: "DMSans_500Medium",
    flex: 1,
  },

  /* Error banner */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    fontFamily: "DMSans_500Medium",
    flex: 1,
  },
});
