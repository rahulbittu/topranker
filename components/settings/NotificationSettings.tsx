/**
 * Sprint 537: Extracted from app/settings.tsx
 * Notification toggle rows, frequency pickers, state management.
 */
import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";

const NOTIFICATION_KEYS = {
  tierUpgrades: "notif_tier_upgrades",
  challengerResults: "notif_challenger_results",
  newChallengers: "notif_new_challengers",
  weeklyDigest: "notif_weekly_digest",
  rankingChanges: "notif_ranking_changes",
  savedBusinessAlerts: "notif_saved_biz_alerts",
  cityAlerts: "notif_city_alerts",
  marketingEmails: "notif_marketing_emails",
  claimUpdates: "notif_claim_updates",
  newRatings: "notif_new_ratings",
};

type NotificationFrequency = "realtime" | "daily" | "weekly";
const FREQ_LABELS: Record<NotificationFrequency, string> = {
  realtime: "Instant",
  daily: "Daily digest",
  weekly: "Weekly digest",
};
const FREQ_STORAGE_KEY = "notif_frequency_prefs";

function SettingRow({
  icon, label, value, onToggle, sublabel,
}: {
  icon: string; label: string; value: boolean;
  onToggle: (val: boolean) => void; sublabel?: string;
}) {
  return (
    <View style={s.settingRow}>
      <TypedIcon name={icon} size={18} color={Colors.textSecondary} />
      <View style={s.settingInfo}>
        <Text style={s.settingLabel}>{label}</Text>
        {sublabel && <Text style={s.settingSublabel}>{sublabel}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: `${BRAND.colors.amber}60` }}
        thumbColor={value ? BRAND.colors.amber : "#f4f3f4"}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

function FrequencyPicker({
  label, value, onChange,
}: {
  label: string; value: NotificationFrequency;
  onChange: (freq: NotificationFrequency) => void;
}) {
  const handlePress = () => {
    Alert.alert(
      `${label} Frequency`,
      "How often should we send these?",
      [
        { text: "Instant", onPress: () => onChange("realtime"), style: value === "realtime" ? "cancel" : "default" },
        { text: "Daily digest", onPress: () => onChange("daily"), style: value === "daily" ? "cancel" : "default" },
        { text: "Weekly digest", onPress: () => onChange("weekly"), style: value === "weekly" ? "cancel" : "default" },
      ],
    );
  };
  return (
    <TouchableOpacity style={s.freqRow} onPress={handlePress} activeOpacity={0.7}>
      <Text style={s.freqLabel}>Delivery: {FREQ_LABELS[value]}</Text>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export function NotificationSettings() {
  const [notifPrefs, setNotifPrefs] = useState({
    tierUpgrades: true,
    challengerResults: true,
    newChallengers: true,
    weeklyDigest: true,
    rankingChanges: true,
    savedBusinessAlerts: true,
    cityAlerts: true,
    marketingEmails: true,
    claimUpdates: true,
    newRatings: true,
  });

  const [freqPrefs, setFreqPrefs] = useState<Record<string, NotificationFrequency>>({
    rankingChanges: "realtime",
    newRatings: "realtime",
    cityAlerts: "realtime",
  });

  useEffect(() => {
    (async () => {
      for (const [key, storageKey] of Object.entries(NOTIFICATION_KEYS)) {
        const val = await AsyncStorage.getItem(storageKey);
        if (val !== null) {
          setNotifPrefs((prev) => ({ ...prev, [key]: val === "true" }));
        }
      }
      try {
        const res = await fetch("/api/members/me/notification-preferences", { credentials: "include" });
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            setNotifPrefs((prev) => ({ ...prev, ...data }));
            for (const [key, val] of Object.entries(data)) {
              const storageKey = NOTIFICATION_KEYS[key as keyof typeof NOTIFICATION_KEYS];
              if (storageKey) await AsyncStorage.setItem(storageKey, String(val));
            }
          }
        }
      } catch { /* offline — use local prefs */ }
      try {
        const freqJson = await AsyncStorage.getItem(FREQ_STORAGE_KEY);
        if (freqJson) setFreqPrefs(JSON.parse(freqJson));
      } catch { /* ignore */ }
    })();
  }, []);

  const toggleNotif = (key: keyof typeof notifPrefs) => async (val: boolean) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: val }));
    await AsyncStorage.setItem(NOTIFICATION_KEYS[key], String(val));
    fetch("/api/members/me/notification-preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...notifPrefs, [key]: val }),
    }).catch(() => {});
  };

  const changeFrequency = (key: string) => (freq: NotificationFrequency) => {
    const updated = { ...freqPrefs, [key]: freq };
    setFreqPrefs(updated);
    AsyncStorage.setItem(FREQ_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
    fetch("/api/members/me/notification-frequency", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  return (
    <>
      <SettingRow icon="arrow-up-circle-outline" label="Tier Upgrades" sublabel="When your credibility tier increases" value={notifPrefs.tierUpgrades} onToggle={toggleNotif("tierUpgrades")} />
      <SettingRow icon="trophy-outline" label="Challenger Results" sublabel="When a challenge you followed ends" value={notifPrefs.challengerResults} onToggle={toggleNotif("challengerResults")} />
      <SettingRow icon="flash-outline" label="New Challenges" sublabel="When a new challenge starts in your city" value={notifPrefs.newChallengers} onToggle={toggleNotif("newChallengers")} />
      <SettingRow icon="calendar-outline" label="Weekly Digest" sublabel="Your weekly activity summary" value={notifPrefs.weeklyDigest} onToggle={toggleNotif("weeklyDigest")} />
      <SettingRow icon="swap-vertical-outline" label="Ranking Changes" sublabel="When a saved restaurant moves up or down" value={notifPrefs.rankingChanges} onToggle={toggleNotif("rankingChanges")} />
      {notifPrefs.rankingChanges && (
        <FrequencyPicker label="Ranking Changes" value={freqPrefs.rankingChanges || "realtime"} onChange={changeFrequency("rankingChanges")} />
      )}
      <SettingRow icon="bookmark-outline" label="Saved Place Updates" sublabel="New ratings on your saved restaurants" value={notifPrefs.savedBusinessAlerts} onToggle={toggleNotif("savedBusinessAlerts")} />
      <SettingRow icon="location-outline" label="City Highlights" sublabel="Notable ranking shifts in your city" value={notifPrefs.cityAlerts} onToggle={toggleNotif("cityAlerts")} />
      {notifPrefs.cityAlerts && (
        <FrequencyPicker label="City Highlights" value={freqPrefs.cityAlerts || "realtime"} onChange={changeFrequency("cityAlerts")} />
      )}
      <SettingRow icon="document-outline" label="Claim Updates" sublabel="When your business claim is reviewed" value={notifPrefs.claimUpdates} onToggle={toggleNotif("claimUpdates")} />
      <SettingRow icon="star-outline" label="New Ratings" sublabel="When someone rates a place you've rated" value={notifPrefs.newRatings} onToggle={toggleNotif("newRatings")} />
      {notifPrefs.newRatings && (
        <FrequencyPicker label="New Ratings" value={freqPrefs.newRatings || "realtime"} onChange={changeFrequency("newRatings")} />
      )}
      <SettingRow icon="mail-outline" label="Marketing Emails" sublabel="Product updates, tips, and announcements" value={notifPrefs.marketingEmails} onToggle={toggleNotif("marketingEmails")} />
    </>
  );
}

const s = StyleSheet.create({
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  settingInfo: { flex: 1, gap: 1 },
  settingLabel: { fontSize: 15, color: Colors.text, fontFamily: "DMSans_500Medium" },
  settingSublabel: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  freqRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 46, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
    backgroundColor: `${Colors.surface}CC`,
  },
  freqLabel: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});
