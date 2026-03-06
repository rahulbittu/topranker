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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.back();
    } catch (err: any) {
      const msg = err.message || "Login failed";
      if (msg.includes("401")) {
        setError("Invalid email or password");
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
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons name="trophy" size={36} color={Colors.gold} />
            </View>
          </View>
          <Text style={styles.appName}>TOP RANKER</Text>
          <Text style={styles.tagline}>Rate. Rank. Discover Dallas.</Text>
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
          <Text style={styles.dividerText}>or sign in with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.redBright} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
              testID="login-email"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              testID="login-password"
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

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonLoading]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
          testID="login-submit"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoHint}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.demoHintText}>Demo: alex@demo.com / demo123</Text>
        </View>

        <View style={styles.browseHint}>
          <Ionicons name="compass-outline" size={14} color={Colors.gold} />
          <Text style={styles.browseHintText}>
            You can browse rankings without signing in
          </Text>
        </View>

        <TouchableOpacity
          style={styles.switchLink}
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/auth/signup"), 100);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.switchText}>
            Don't have an account? <Text style={styles.switchHighlight}>Sign Up</Text>
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, gap: 16 },

  logoContainer: { alignItems: "center", gap: 10, marginBottom: 8, marginTop: 8 },
  logoOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(201, 151, 58, 0.08)",
    alignItems: "center", justifyContent: "center",
  },
  logoInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.goldFaint, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.goldDim,
  },
  appName: {
    fontSize: 26, fontWeight: "800" as const, color: Colors.gold,
    fontFamily: "Inter_700Bold", letterSpacing: 3,
  },
  tagline: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "Inter_400Regular",
    textAlign: "center",
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

  submitButton: {
    backgroundColor: Colors.gold, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  submitButtonLoading: { opacity: 0.8 },
  submitButtonText: { fontSize: 16, fontWeight: "700" as const, color: "#000", fontFamily: "Inter_700Bold" },

  demoHint: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10,
    borderRadius: 10, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12,
  },
  demoHintText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

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
