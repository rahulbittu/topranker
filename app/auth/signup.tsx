import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { useAuth } from "@/lib/auth-context";
import { useCity } from "@/lib/city-context";
import { AppLogo } from "@/components/Logo";
import { signInWithGoogle, isGoogleAuthAvailable } from "@/lib/google-auth";
import { Analytics } from "@/lib/analytics";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup, googleLogin } = useAuth();
  const { city } = useCity();
  const { ref: referralParam } = useLocalSearchParams<{ ref?: string }>();
  const googleAvailable = isGoogleAuthAvailable();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const handleSignup = async () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^[a-zA-Z0-9_]{2,30}$/.test(username.trim())) {
      setError("Username must be 2-30 characters: letters, numbers, or underscores");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters with a number");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
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
        city,
        ...(referralParam ? { referralCode: referralParam } : {}),
      });
      setShowWelcome(true);
      // Sprint 202: Track beta signup with referral
      Analytics.signupComplete("email");
      if (referralParam) {
        Analytics.betaSignupWithReferral(referralParam);
      }
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

  if (showWelcome) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.welcomeInner}>
          <View style={styles.welcomeIconCircle}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to TopRanker!</Text>
          <Text style={styles.welcomeSub}>You've joined the {city} community as @{username.trim().toLowerCase()}</Text>

          <View style={styles.welcomeSteps}>
            <View style={styles.welcomeStep}>
              <Text style={styles.welcomeStepNum}>1</Text>
              <View style={styles.welcomeStepInfo}>
                <Text style={styles.welcomeStepTitle}>Explore rankings</Text>
                <Text style={styles.welcomeStepSub}>See what {city} thinks about local restaurants</Text>
              </View>
            </View>
            <View style={styles.welcomeStep}>
              <Text style={styles.welcomeStepNum}>2</Text>
              <View style={styles.welcomeStepInfo}>
                <Text style={styles.welcomeStepTitle}>Unlock rating in 3 days</Text>
                <Text style={styles.welcomeStepSub}>Your voice will shape the leaderboard</Text>
              </View>
            </View>
            <View style={styles.welcomeStep}>
              <Text style={styles.welcomeStepNum}>3</Text>
              <View style={styles.welcomeStepInfo}>
                <Text style={styles.welcomeStepTitle}>Build credibility</Text>
                <Text style={styles.welcomeStepSub}>More ratings = higher vote weight</Text>
              </View>
            </View>
          </View>

          <Text style={styles.welcomeEmailNote}>Check your email for a welcome guide</Text>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>Start Exploring</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
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
          <AppLogo size="md" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the {city} ranking community</Text>
        </View>

        <TouchableOpacity
          style={[styles.googleButton, googleAvailable && styles.googleButtonActive]}
          activeOpacity={0.7}
          disabled={!googleAvailable || loading}
          onPress={async () => {
            if (!googleAvailable) return;
            setError("");
            setLoading(true);
            try {
              const idToken = await signInWithGoogle();
              await googleLogin(idToken);
              router.back();
            } catch (err: any) {
              if (!err.message?.includes("cancelled")) {
                setError(err.message || "Google sign-in failed");
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          <MaterialCommunityIcons name="google" size={20} color={googleAvailable ? Colors.text : Colors.textTertiary} />
          <Text style={[styles.googleButtonText, googleAvailable && styles.googleButtonTextActive]}>Continue with Google</Text>
          {!googleAvailable && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.red} />
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
              returnKeyType="go"
              onSubmitEditing={handleSignup}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8} accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tierPreview}>
          <Ionicons name="people-outline" size={16} color={Colors.textTertiary} />
          <View style={styles.tierPreviewInfo}>
            <Text style={styles.tierPreviewTitle}>You'll start as a New Member</Text>
            <Text style={styles.tierPreviewSub}>0.10x vote weight · Rate businesses to level up</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToTerms }}
        >
          <Ionicons
            name={agreedToTerms ? "checkbox" : "square-outline"}
            size={20}
            color={agreedToTerms ? BRAND.colors.amber : Colors.textTertiary}
          />
          <Text style={styles.consentText}>
            I agree to the{" "}
            <Text style={styles.consentLink} onPress={() => router.push("/legal/terms")}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={styles.consentLink} onPress={() => router.push("/legal/privacy")}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonLoading]}
          onPress={handleSignup}
          activeOpacity={0.85}
          disabled={loading}
          testID="signup-submit"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.browseHint}>
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
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, gap: 14 },

  headerSection: { gap: 8, marginBottom: 4, alignItems: "center" },
  title: {
    fontSize: 28, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },

  googleButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, paddingVertical: 15,
    opacity: 0.55,
  },
  googleButtonActive: {
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleButtonText: {
    fontSize: 15, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold",
  },
  googleButtonTextActive: {
    color: Colors.text,
  },
  comingSoonBadge: {
    backgroundColor: Colors.border, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  comingSoonText: {
    fontSize: 9, fontWeight: "700", color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.5, textTransform: "uppercase" as const,
  },

  dividerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.redFaint, borderRadius: 12, padding: 14,
  },
  errorText: { fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium", flex: 1 },

  formGroup: { gap: 6 },
  label: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  input: {
    flex: 1, fontSize: 15, color: Colors.text, fontFamily: "DMSans_400Regular",
  },
  atSign: { fontSize: 16, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },

  tierPreview: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 14,
  },
  tierPreviewInfo: { flex: 1, gap: 2 },
  tierPreviewTitle: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  tierPreviewSub: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", lineHeight: 16 },

  consentRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 12, marginBottom: 8,
  },
  consentText: {
    flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 20,
  },
  consentLink: {
    color: BRAND.colors.amber, fontFamily: "DMSans_600SemiBold", textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: Colors.text, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  submitButtonLoading: { opacity: 0.8 },
  submitButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },

  browseHint: {
    alignItems: "center", paddingVertical: 8,
  },
  browseHintText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },

  switchLink: { alignItems: "center", paddingVertical: 12 },
  switchText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  switchHighlight: { color: Colors.gold, fontFamily: "DMSans_600SemiBold" },

  // Welcome screen
  welcomeInner: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  welcomeIconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.green,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5, marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginBottom: 28,
  },
  welcomeSteps: { width: "100%", gap: 12, marginBottom: 24 },
  welcomeStep: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 14,
  },
  welcomeStepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.gold,
    textAlign: "center", lineHeight: 28, fontSize: 14, fontWeight: "700",
    color: "#FFFFFF", fontFamily: "DMSans_700Bold",
  },
  welcomeStepInfo: { flex: 1 },
  welcomeStepTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  welcomeStepSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", marginTop: 2 },
  welcomeEmailNote: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginBottom: 20,
  },
});
