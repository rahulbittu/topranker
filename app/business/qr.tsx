import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Share, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";
import * as Haptics from "expo-haptics";

export default function QRCodeScreen() {
  const insets = useSafeAreaInsets();
  const { name, slug } = useLocalSearchParams<{ name: string; slug: string }>();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const qrUrl = `https://topranker.com/business/${slug}`;

  const shareQR = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Rate ${name} on TopRanker!\n${qrUrl}`,
        url: qrUrl,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>QR Code</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Display this code for diners to scan and rate</Text>

        {/* QR Code Display Area — server-generated via Google Charts API */}
        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}&color=0D1B2A` }}
              style={styles.qrImage}
              resizeMode="contain"
              accessibilityLabel={`QR code for ${name}`}
            />
          </View>
          <Text style={styles.qrUrl}>{qrUrl}</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={BRAND.colors.amber} />
          <Text style={styles.infoText}>
            Print this QR code and display it at your register, tables, or entrance. When diners scan it with their phone camera, they'll be taken directly to your TopRanker listing to rate their experience.
          </Text>
        </View>

        <View style={styles.statsPreview}>
          <Text style={styles.statsTitle}>QR Code Scan Benefits</Text>
          {[
            { icon: "scan-outline", text: "Diners scan with any phone camera" },
            { icon: "star-outline", text: "Links directly to your rating page" },
            { icon: "trending-up-outline", text: "More ratings = higher ranking" },
            { icon: "shield-checkmark-outline", text: "All ratings are trust-weighted" },
          ].map((item, i) => (
            <View key={i} style={styles.statRow}>
              <TypedIcon name={item.icon} size={16} color={BRAND.colors.amber} />
              <Text style={styles.statText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareBtn} onPress={shareQR} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Share Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.printBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (Platform.OS === "web") {
                // Open a clean print window with just the QR code
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(`
                    <html><head><title>QR Code — ${name}</title>
                    <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}
                    h1{font-size:28px;color:#0D1B2A;margin:0 0 4px}p{color:#888;font-size:14px;margin:0 0 24px}
                    img{width:240px;height:240px;border:3px solid #0D1B2A;border-radius:12px;padding:8px}
                    .url{font-size:11px;color:#aaa;margin-top:12px}.brand{color:#C49A1A;font-weight:900;font-size:11px;letter-spacing:1px;margin-top:20px}</style></head>
                    <body><h1>${name}</h1><p>Scan to rate on TopRanker</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}&color=0D1B2A" />
                    <div class="url">${qrUrl}</div><div class="brand">TOPRANKER</div></body></html>`);
                  printWindow.document.close();
                  printWindow.print();
                }
              }
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="print-outline" size={18} color={BRAND.colors.navy} />
            <Text style={styles.printBtnText}>Print</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceRaised, alignItems: "center", justifyContent: "center",
  },
  navTitle: {
    fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  content: { flex: 1, paddingHorizontal: 24, alignItems: "center", gap: 16, paddingTop: 8 },

  title: {
    fontSize: 22, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },

  qrContainer: { alignItems: "center", gap: 8, marginVertical: 8 },
  qrPlaceholder: {
    width: 200, height: 200, backgroundColor: "#FFFFFF",
    borderRadius: 16, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: BRAND.colors.navy,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  qrImage: { width: 180, height: 180 },
  qrUrl: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },

  infoCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 12, padding: 14,
    width: "100%",
  },
  infoText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    lineHeight: 18, flex: 1,
  },

  statsPreview: { width: "100%", gap: 10 },
  statsTitle: {
    fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  statRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },

  actions: { flexDirection: "row", gap: 12, width: "100%", marginTop: 8 },
  shareBtn: {
    flex: 1, backgroundColor: BRAND.colors.navy, borderRadius: 12, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  shareBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  printBtn: {
    flex: 1, backgroundColor: Colors.surfaceRaised, borderRadius: 12, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  printBtnText: { fontSize: 14, fontWeight: "700", color: BRAND.colors.navy, fontFamily: "DMSans_700Bold" },
});
