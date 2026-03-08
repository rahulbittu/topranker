import React, { useRef, useCallback } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { BRAND } from "@/constants/brand";
import { getCategoryDisplay } from "@/constants/brand";

interface ShareCardProps {
  winnerName: string;
  loserName: string;
  winPct: string;
  margin: string;
  totalDays: number;
  category: string;
  city: string;
  isDefenderWin: boolean;
}

export function useShareCard() {
  const cardRef = useRef<ViewShot>(null);

  const captureAndShare = useCallback(async () => {
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Challenge Result",
          UTI: "public.png",
        });
      }
    } catch (err) {
      console.warn("[ShareCard] capture failed:", err);
    }
  }, []);

  return { cardRef, captureAndShare };
}

export function ShareCardView({
  cardRef,
  winnerName,
  loserName,
  winPct,
  margin,
  totalDays,
  category,
  city,
  isDefenderWin,
}: ShareCardProps & { cardRef: React.RefObject<ViewShot> }) {
  const catDisplay = getCategoryDisplay(category);

  return (
    <ViewShot
      ref={cardRef}
      options={{ format: "png", quality: 1 }}
      style={cardStyles.offscreen}
    >
      <View style={cardStyles.card}>
        {/* Navy gradient background */}
        <View style={cardStyles.bg} />

        {/* Header */}
        <View style={cardStyles.header}>
          <Text style={cardStyles.brandMark}>TOPRANKER</Text>
          <Text style={cardStyles.headerSub}>{catDisplay.emoji} {catDisplay.label} Challenge</Text>
          <Text style={cardStyles.cityLabel}>{city}</Text>
        </View>

        {/* Trophy */}
        <Text style={cardStyles.trophy}>🏆</Text>

        {/* Winner */}
        <Text style={cardStyles.winnerLabel}>WINNER</Text>
        <Text style={cardStyles.winnerName}>{winnerName}</Text>

        {/* Stats row */}
        <View style={cardStyles.statsRow}>
          <View style={cardStyles.stat}>
            <Text style={cardStyles.statValue}>{winPct}%</Text>
            <Text style={cardStyles.statLabel}>of votes</Text>
          </View>
          <View style={cardStyles.statDivider} />
          <View style={cardStyles.stat}>
            <Text style={cardStyles.statValue}>+{margin}</Text>
            <Text style={cardStyles.statLabel}>margin</Text>
          </View>
          <View style={cardStyles.statDivider} />
          <View style={cardStyles.stat}>
            <Text style={cardStyles.statValue}>{totalDays}</Text>
            <Text style={cardStyles.statLabel}>days</Text>
          </View>
        </View>

        {/* Defeated */}
        <Text style={cardStyles.defeated}>defeated {loserName}</Text>

        {/* Role badge */}
        <View style={cardStyles.roleBadge}>
          <Text style={cardStyles.roleBadgeText}>
            {isDefenderWin ? "DEFENDED #1" : "UPSET VICTORY"}
          </Text>
        </View>

        {/* Footer */}
        <View style={cardStyles.footer}>
          <View style={cardStyles.footerLine} />
          <Text style={cardStyles.footerText}>Trust-weighted rankings</Text>
          <Text style={cardStyles.footerUrl}>topranker.com</Text>
        </View>
      </View>
    </ViewShot>
  );
}

const cardStyles = StyleSheet.create({
  offscreen: {
    position: "absolute",
    left: -9999,
    top: -9999,
    opacity: 0,
  },
  card: {
    width: 390,
    height: 520,
    backgroundColor: BRAND.colors.navy,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 28,
    overflow: "hidden",
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.colors.navy,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandMark: {
    fontSize: 14,
    fontWeight: "900",
    color: BRAND.colors.amber,
    letterSpacing: 4,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  cityLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  trophy: {
    fontSize: 56,
    marginBottom: 8,
  },
  winnerLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: BRAND.colors.amber,
    letterSpacing: 4,
    marginBottom: 4,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: BRAND.colors.amber,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  defeated: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: `${BRAND.colors.amber}20`,
    borderWidth: 1,
    borderColor: BRAND.colors.amber,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 20,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: BRAND.colors.amber,
    letterSpacing: 2,
  },
  footer: {
    alignItems: "center",
    gap: 6,
  },
  footerLine: {
    width: 60,
    height: 1,
    backgroundColor: "rgba(196,154,26,0.3)",
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  footerUrl: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 1,
  },
});
