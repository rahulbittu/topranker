import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";
import { useAuth } from "@/lib/auth-context";
import { useCity, SUPPORTED_CITIES, type SupportedCity } from "@/lib/city-context";
import { useTheme, type ThemePreference } from "@/lib/theme-context";
import { hapticPress } from "@/lib/audio";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import packageJson from "../package.json";

const CITY_LABELS: Record<SupportedCity, string> = {
  Dallas: "Dallas, TX",
  Austin: "Austin, TX",
  Houston: "Houston, TX",
  "San Antonio": "San Antonio, TX",
  "Fort Worth": "Fort Worth, TX",
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}


function NavigationRow({
  icon,
  label,
  sublabel,
  onPress,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={() => { hapticPress(); onPress(); }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <TypedIcon name={icon} size={18} color={Colors.textSecondary} />
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sublabel && <Text style={styles.settingSublabel}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { city, setCity } = useCity();
  const { theme, setTheme } = useTheme();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const THEME_LABELS: Record<ThemePreference, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
  };

  const handleThemeChange = () => {
    Alert.alert(
      "Appearance",
      "Choose your theme preference",
      [
        { text: "System (auto)", onPress: () => setTheme("system"), style: theme === "system" ? "cancel" : "default" },
        { text: "Light", onPress: () => setTheme("light"), style: theme === "light" ? "cancel" : "default" },
        { text: "Dark", onPress: () => setTheme("dark"), style: theme === "dark" ? "cancel" : "default" },
      ],
    );
  };

  const handleCityChange = () => {
    Alert.alert(
      "Select City",
      "Choose your city for local rankings",
      SUPPORTED_CITIES.map((c) => ({
        text: CITY_LABELS[c],
        onPress: () => setCity(c),
        style: c === city ? ("cancel" as const) : ("default" as const),
      })),
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/(tabs)");
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.card}>
          <NavigationRow
            icon="location-outline"
            label="City"
            sublabel={CITY_LABELS[city] || city}
            onPress={handleCityChange}
          />
          <NavigationRow
            icon="moon-outline"
            label="Appearance"
            sublabel={THEME_LABELS[theme]}
            onPress={handleThemeChange}
          />
          {user && (
            <NavigationRow
              icon="person-outline"
              label="Edit Profile"
              sublabel={user.displayName || user.email}
              onPress={() => router.push("/edit-profile")}
            />
          )}
        </View>

        {/* Sprint 537: Extracted notification settings */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.card}>
          <NotificationSettings />
        </View>

        {/* Legal */}
        <SectionHeader title="LEGAL" />
        <View style={styles.card}>
          <NavigationRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => router.push("/legal/terms")}
          />
          <NavigationRow
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => router.push("/legal/privacy")}
          />
        </View>

        {/* Sprint 213: Feedback Link */}
        <SectionHeader title="HELP & FEEDBACK" />
        <View style={styles.card}>
          <NavigationRow
            icon="chatbox-ellipses-outline"
            label="Send Feedback"
            onPress={() => router.push("/feedback")}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.versionText}>{packageJson.version}</Text>
          </View>
        </View>

        {/* Sign Out */}
        {user && (
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.red} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  // Sprint 537: freqRow, freqLabel — moved to NotificationSettings
  settingInfo: { flex: 1, gap: 1 },
  settingLabel: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
  },
  settingSublabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  versionText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    ...Colors.cardShadow,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.red,
    fontFamily: "DMSans_600SemiBold",
  },
});
