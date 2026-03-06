import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSignup = async () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signup({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        city: "Dallas",
      });
      router.back();
    } catch (err: any) {
      const msg = err.message || "Signup failed";
      if (msg.includes("400")) {
        setError("Username or email already taken");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollViewCompat
        bottomOffset={40}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoSmall}>
              <Ionicons name="trophy" size={20} color={Colors.gold} />
            </View>
            <Text style={styles.brandName}>TOP RANKER</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Dallas ranking community</Text>
        </View>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.7} disabled>
          <MaterialCommunityIcons name="google" size={20} color={Colors.textTertiary} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.redBright} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Display Name</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.textTertiary}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              testID="signup-name"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor={Colors.textTertiary}
              value={username}
              onChangeText={t => setUsername(t.replace(/[^a-zA-Z0-9_]/g, ""))}
              autoCapitalize="none"
              autoCorrect={false}
              testID="signup-username"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="signup-email"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              testID="signup-password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tierPreview}>
          <View style={styles.tierPreviewIcon}>
            <Ionicons name="people" size={14} color={Colors.textTertiary} />
          </View>
          <View style={styles.tierPreviewInfo}>
            <Text style={styles.tierPreviewTitle}>You'll start as a Community Member</Text>
            <Text style={styles.tierPreviewSub}>
              0.10x vote weight · Rate businesses to level up
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonLoading]}
          onPress={handleSignup}
          activeOpacity={0.85}
          disabled={loading}
          testID="signup-submit"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.browseHint}>
          <Ionicons name="compass-outline" size={14} color={Colors.gold} />
          <Text style={styles.browseHintText}>
            You can browse rankings without an account
          </Text>
        </View>

        <TouchableOpacity
          style={styles.switchLink}
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/auth/login"), 100);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchHighlight}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navBar: { paddingHorizontal: 16, paddingBottom: 8 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, gap: 14 },

  headerSection: { gap: 4, marginBottom: 4 },
  logoRow: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6,
  },
  logoSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.goldFaint, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.goldDim,
  },
  brandName: {
    fontSize: 14, fontWeight: "800" as const, color: Colors.gold,
    fontFamily: "Inter_700Bold", letterSpacing: 2.5,
  },
  title: {
    fontSize: 28, fontWeight: "700" as const, color: Colors.text,
    fontFamily: "Inter_700Bold", letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "Inter_400Regular",
  },

  googleButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 15,
    borderWidth: 1, borderColor: Colors.border, opacity: 0.55,
  },
  googleButtonText: {
    fontSize: 15, fontWeight: "600" as const, color: Colors.textTertiary,
    fontFamily: "Inter_600SemiBold",
  },
  comingSoonBadge: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  comingSoonText: {
    fontSize: 9, fontWeight: "700" as const, color: Colors.textTertiary,
    fontFamily: "Inter_700Bold", letterSpacing: 0.5, textTransform: "uppercase" as const,
  },

  dividerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "Inter_400Regular",
  },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.redFaint, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(176,48,48,0.3)",
  },
  errorText: { fontSize: 13, color: Colors.redBright, fontFamily: "Inter_500Medium", flex: 1 },

  formGroup: { gap: 6 },
  label: {
    fontSize: 12, fontWeight: "600" as const, color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold", letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: {
    flex: 1, fontSize: 15, color: Colors.text, fontFamily: "Inter_400Regular",
  },
  atSign: { fontSize: 16, color: Colors.textTertiary, fontFamily: "Inter_500Medium" },

  tierPreview: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  tierPreviewIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  tierPreviewInfo: { flex: 1, gap: 2 },
  tierPreviewTitle: { fontSize: 13, fontWeight: "600" as const, color: Colors.text, fontFamily: "Inter_600SemiBold" },
  tierPreviewSub: { fontSize: 11, color: Colors.textTertiary, fontFamily: "Inter_400Regular", lineHeight: 16 },

  submitButton: {
    backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  submitButtonLoading: { opacity: 0.8 },
  submitButtonText: { fontSize: 16, fontWeight: "700" as const, color: "#000", fontFamily: "Inter_700Bold" },

  browseHint: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 8,
  },
  browseHintText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "Inter_400Regular",
  },

  switchLink: { alignItems: "center", paddingVertical: 12 },
  switchText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  switchHighlight: { color: Colors.gold, fontFamily: "Inter_600SemiBold" },
});
