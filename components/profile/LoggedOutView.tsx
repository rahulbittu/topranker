import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { useAuth } from "@/lib/auth-context";
import { AppLogo } from "@/components/Logo";
import { signInWithGoogle, isGoogleAuthAvailable } from "@/lib/google-auth";

const AMBER = BRAND.colors.amber;

export function LoggedOutView() {
  const insets = useSafeAreaInsets();
  const { login, googleLogin } = useAuth();
  const googleAvailable = isGoogleAuthAvailable();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[s.loggedOutContainer, { paddingTop: topPad }]}>
      <View style={s.loggedOutTop}>
        <AppLogo size="lg" />
        <Text style={s.loggedOutSubtitle}>{BRAND.tagline}</Text>
      </View>

      <View style={s.loggedOutForm}>
        <TouchableOpacity
          style={[s.googleButton, googleAvailable && s.googleButtonActive]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={googleAvailable ? "Continue with Google" : "Continue with Google (coming soon)"}
          disabled={!googleAvailable || isSubmitting}
          onPress={async () => {
            if (!googleAvailable) return;
            setError("");
            setIsSubmitting(true);
            try {
              const idToken = await signInWithGoogle();
              await googleLogin(idToken);
            } catch (err: any) {
              if (!err.message?.includes("cancelled")) {
                setError(err.message || "Google sign-in failed");
              }
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <Text style={[s.googleG, googleAvailable && s.googleGActive]}>G</Text>
          <Text style={[s.googleButtonText, googleAvailable && s.googleButtonTextActive]}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={s.orDivider}>
          <View style={s.orLine} />
          <Text style={s.orText}>or</Text>
          <View style={s.orLine} />
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={s.inputContainer}>
          <TextInput
            style={[s.input, s.inputWithEye]}
            placeholder="Password"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
          />
          <TouchableOpacity
            style={s.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.signInButton, isSubmitting && s.signInButtonLoading]}
          onPress={handleSignIn}
          activeOpacity={0.85}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/signup")}
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel="Sign up for an account"
        >
          <Text style={s.signUpLink}>
            Don't have an account? <Text style={s.signUpLinkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  loggedOutContainer: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "flex-start", paddingHorizontal: 32,
  },
  loggedOutTop: { alignItems: "center", marginTop: "18%", marginBottom: 40 },
  loggedOutSubtitle: { fontSize: 15, color: Colors.textTertiary, marginTop: 12, fontFamily: "DMSans_400Regular" },
  loggedOutForm: { width: "100%", gap: 14 },
  googleButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, height: 52, width: "100%", opacity: 0.55,
  },
  googleButtonActive: {
    opacity: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  googleG: { fontSize: 20, fontWeight: "700", color: Colors.textTertiary },
  googleGActive: { color: "#4285F4" },
  googleButtonText: { fontSize: 15, fontWeight: "600", color: Colors.textTertiary, fontFamily: "DMSans_600SemiBold" },
  googleButtonTextActive: { color: Colors.text },
  orDivider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 13, color: Colors.textSecondary },
  errorText: { fontSize: 13, color: Colors.red, textAlign: "center" },
  inputContainer: { position: "relative" as const },
  input: {
    width: "100%", height: 48, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, fontSize: 14, color: Colors.text,
    backgroundColor: Colors.surface, fontFamily: "DMSans_400Regular",
  },
  eyeButton: { position: "absolute" as const, right: 12, top: 0, bottom: 0, justifyContent: "center" },
  inputWithEye: { paddingRight: 44 },
  signInButton: {
    backgroundColor: AMBER, borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center", width: "100%", marginTop: 4,
    shadowColor: "rgba(196,154,26,0.35)", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 14, elevation: 6,
  },
  signInButtonLoading: { opacity: 0.7 },
  signInButtonText: { fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  signUpLink: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginTop: 4 },
  signUpLinkBold: { color: Colors.blue, fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
});
