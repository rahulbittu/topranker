/**
 * Sprint 479: Notification Preferences Card
 *
 * Inline notification toggles on Profile tab — replaces the simple
 * "Notification Preferences" link that navigated to Settings.
 *
 * Categories:
 * - Activity: Tier upgrades, challenger results, new challengers, weekly digest
 * - Push: Ranking changes, saved business alerts, city alerts
 * - Email: Marketing emails
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

// Sprint 479: Extended notification categories
export const NOTIFICATION_CATEGORIES = {
  // Activity notifications (existing)
  tierUpgrades: { key: "notif_tier_upgrades", label: "Tier Upgrades", sublabel: "When your credibility tier increases", icon: "arrow-up-circle-outline", group: "activity" },
  challengerResults: { key: "notif_challenger_results", label: "Challenger Results", sublabel: "When a challenge you followed ends", icon: "trophy-outline", group: "activity" },
  newChallengers: { key: "notif_new_challengers", label: "New Challenges", sublabel: "When a new challenge starts in your city", icon: "flash-outline", group: "activity" },
  weeklyDigest: { key: "notif_weekly_digest", label: "Weekly Digest", sublabel: "Your weekly activity summary", icon: "calendar-outline", group: "activity" },
  // Push notification categories (new Sprint 479)
  rankingChanges: { key: "notif_ranking_changes", label: "Ranking Changes", sublabel: "When a saved restaurant moves up or down", icon: "swap-vertical-outline", group: "push" },
  savedBusinessAlerts: { key: "notif_saved_biz_alerts", label: "Saved Place Updates", sublabel: "New ratings on your saved restaurants", icon: "bookmark-outline", group: "push" },
  cityAlerts: { key: "notif_city_alerts", label: "City Highlights", sublabel: "Notable ranking shifts in your city", icon: "location-outline", group: "push" },
  // Email
  marketingEmails: { key: "notif_marketing_emails", label: "Marketing Emails", sublabel: "Product updates, tips, and announcements", icon: "mail-outline", group: "email" },
} as const;

export type NotificationCategoryKey = keyof typeof NOTIFICATION_CATEGORIES;

const GROUPS = [
  { id: "activity", title: "Activity" },
  { id: "push", title: "Push Alerts" },
  { id: "email", title: "Email" },
] as const;

const DEFAULT_PREFS: Record<NotificationCategoryKey, boolean> = {
  tierUpgrades: true,
  challengerResults: true,
  newChallengers: true,
  weeklyDigest: true,
  rankingChanges: true,
  savedBusinessAlerts: true,
  cityAlerts: true,
  marketingEmails: true,
};

export function NotificationPreferencesCard() {
  const [prefs, setPrefs] = useState<Record<NotificationCategoryKey, boolean>>({ ...DEFAULT_PREFS });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = { ...DEFAULT_PREFS };
      for (const [catKey, cat] of Object.entries(NOTIFICATION_CATEGORIES)) {
        const val = await AsyncStorage.getItem(cat.key);
        if (val !== null) {
          loaded[catKey as NotificationCategoryKey] = val === "true";
        }
      }
      setPrefs(loaded);
      // Server sync — overrides local
      try {
        const res = await fetch("/api/members/me/notification-preferences", { credentials: "include" });
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            const merged = { ...loaded, ...data };
            setPrefs(merged);
            for (const [key, val] of Object.entries(data)) {
              const cat = NOTIFICATION_CATEGORIES[key as NotificationCategoryKey];
              if (cat) await AsyncStorage.setItem(cat.key, String(val));
            }
          }
        }
      } catch {
        /* offline — use local prefs */
      }
    })();
  }, []);

  const togglePref = useCallback((key: NotificationCategoryKey) => async (val: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: val }));
    const cat = NOTIFICATION_CATEGORIES[key];
    await AsyncStorage.setItem(cat.key, String(val));
    // Fire-and-forget server sync
    fetch("/api/members/me/notification-preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...prefs, [key]: val }),
    }).catch(() => {});
  }, [prefs]);

  // Collapsed: show summary + expand button
  const enabledCount = Object.values(prefs).filter(Boolean).length;
  const totalCount = Object.keys(prefs).length;

  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.headerRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse notification preferences" : "Expand notification preferences"}
      >
        <Ionicons name="notifications-outline" size={16} color={AMBER} />
        <Text style={s.headerText}>Notification Preferences</Text>
        <Text style={s.enabledBadge}>{enabledCount}/{totalCount}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textTertiary} />
      </TouchableOpacity>

      {expanded && (
        <View style={s.body}>
          {GROUPS.map((group) => {
            const groupCategories = Object.entries(NOTIFICATION_CATEGORIES)
              .filter(([, cat]) => cat.group === group.id);
            return (
              <View key={group.id}>
                <Text style={s.groupTitle}>{group.title}</Text>
                {groupCategories.map(([key, cat]) => (
                  <View style={s.toggleRow} key={key}>
                    <Ionicons name={cat.icon as any} size={16} color={Colors.textSecondary} />
                    <View style={s.toggleInfo}>
                      <Text style={s.toggleLabel}>{cat.label}</Text>
                      <Text style={s.toggleSublabel}>{cat.sublabel}</Text>
                    </View>
                    <Switch
                      value={prefs[key as NotificationCategoryKey]}
                      onValueChange={togglePref(key as NotificationCategoryKey)}
                      trackColor={{ false: Colors.border, true: `${AMBER}60` }}
                      thumbColor={prefs[key as NotificationCategoryKey] ? AMBER : "#f4f3f4"}
                      ios_backgroundColor={Colors.border}
                    />
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
  enabledBadge: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textTertiary,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  toggleInfo: { flex: 1, gap: 1 },
  toggleLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "DMSans_500Medium",
  },
  toggleSublabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});
