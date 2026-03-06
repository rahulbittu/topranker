import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
          <Ionicons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollViewCompat
        bottomOffset={40}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="trophy" size={32} color={Colors.gold} />
          </View>
          <Text style={styles.appName}>Top Ranker</Text>
          <Text style={styles.tagline}>Sign in to rate and rank Dallas businesses</Text>
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
          <Text style={styles.demoHintText}>Demo: alex@demo.com / demo123</Text>
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

  logoContainer: { alignItems: "center", gap: 8, marginBottom: 12 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.goldFaint, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.goldDim,
  },
  appName: {
    fontSize: 28, fontWeight: "700", color: Colors.text,
    fontFamily: "Inter_700Bold", letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "Inter_400Regular",
    textAlign: "center",
  },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.redFaint, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(176,48,48,0.3)",
  },
  errorText: { fontSize: 13, color: Colors.redBright, fontFamily: "Inter_500Medium", flex: 1 },

  formGroup: { gap: 6 },
  label: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
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
    alignItems: "center", justifyContent: "center", marginTop: 8,
  },
  submitButtonLoading: { opacity: 0.8 },
  submitButtonText: { fontSize: 16, fontWeight: "700", color: "#000", fontFamily: "Inter_700Bold" },

  demoHint: {
    alignItems: "center", paddingVertical: 8,
    borderRadius: 8, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, padding: 10,
  },
  demoHintText: { fontSize: 12, color: Colors.textTertiary, fontFamily: "Inter_400Regular" },

  switchLink: { alignItems: "center", paddingVertical: 12 },
  switchText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
  switchHighlight: { color: Colors.gold, fontFamily: "Inter_600SemiBold" },
});
