/**
 * Cookie Consent Banner — Sprint 105
 * GDPR/ePrivacy compliant cookie consent for web.
 * Owner: Jordan Blake (Compliance)
 */
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";


const CONSENT_KEY = "cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    AsyncStorage.getItem(CONSENT_KEY).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  const accept = async () => {
    await AsyncStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = async () => {
    await AsyncStorage.setItem(CONSENT_KEY, "essential_only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>
          We use essential cookies for authentication and analytics cookies to improve your experience.{" "}
          <Text style={styles.link} onPress={() => router.push("/legal/privacy")}>Learn more</Text>
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.declineBtn} onPress={decline}>
            <Text style={styles.declineBtnText}>Essential Only</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={accept}>
            <Text style={styles.acceptBtnText}>Accept All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute" as any,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(13, 27, 42, 0.97)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 9999,
  },
  content: {
    maxWidth: 960,
    alignSelf: "center" as any,
    width: "100%" as any,
  },
  text: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "DMSans_400Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  link: {
    color: "#C49A1A",
    textDecorationLine: "underline" as any,
  },
  buttons: {
    flexDirection: "row" as any,
    gap: 10,
  },
  declineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  declineBtnText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "DMSans_500Medium",
  },
  acceptBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#C49A1A",
  },
  acceptBtnText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
});
