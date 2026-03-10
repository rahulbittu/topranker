/**
 * Sprint 417: Side-by-side comparison details for challenger cards.
 * Collapsible section showing score, ratings, cuisine, neighborhood, price.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { type ApiBusiness } from "@/lib/api";

const AMBER = BRAND.colors.amber;

interface ComparisonDetailsProps {
  defender: ApiBusiness;
  challenger: ApiBusiness;
}

interface StatRowProps {
  label: string;
  icon: string;
  defenderValue: string;
  challengerValue: string;
  highlightWinner?: boolean;
}

function StatRow({ label, icon, defenderValue, challengerValue, highlightWinner }: StatRowProps) {
  const defNum = parseFloat(defenderValue) || 0;
  const chalNum = parseFloat(challengerValue) || 0;
  const defWins = highlightWinner && defNum > chalNum;
  const chalWins = highlightWinner && chalNum > defNum;

  return (
    <View style={s.statRow}>
      <Text style={[s.statValue, defWins && s.statValueWinner]} numberOfLines={1}>
        {defenderValue}
      </Text>
      <View style={s.statCenter}>
        <Ionicons name={icon as any} size={12} color={Colors.textTertiary} />
        <Text style={s.statLabel}>{label}</Text>
      </View>
      <Text style={[s.statValue, s.statValueRight, chalWins && s.statValueWinner]} numberOfLines={1}>
        {challengerValue}
      </Text>
    </View>
  );
}

export function ComparisonDetails({ defender, challenger }: ComparisonDetailsProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => !e);
  };

  const getCuisineLabel = (biz: ApiBusiness) => {
    if (!biz.cuisine) return "—";
    const display = CUISINE_DISPLAY[biz.cuisine];
    return display ? `${display.emoji} ${display.label}` : biz.cuisine;
  };

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.toggleBtn}
        onPress={toggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Hide comparison details" : "Show comparison details"}
        accessibilityState={{ expanded }}
      >
        <Ionicons name="stats-chart-outline" size={12} color={AMBER} />
        <Text style={s.toggleText}>
          {expanded ? "Hide Details" : "Compare Stats"}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={Colors.textTertiary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={s.statsGrid}>
          <View style={s.headerRow}>
            <Text style={s.headerName} numberOfLines={1}>{defender.name}</Text>
            <Text style={s.headerVs}>vs</Text>
            <Text style={[s.headerName, s.headerNameRight]} numberOfLines={1}>{challenger.name}</Text>
          </View>

          <StatRow
            label="Score"
            icon="star-outline"
            defenderValue={parseFloat(defender.weightedScore).toFixed(1)}
            challengerValue={parseFloat(challenger.weightedScore).toFixed(1)}
            highlightWinner
          />
          <StatRow
            label="Ratings"
            icon="people-outline"
            defenderValue={String(defender.totalRatings)}
            challengerValue={String(challenger.totalRatings)}
            highlightWinner
          />
          <StatRow
            label="Cuisine"
            icon="restaurant-outline"
            defenderValue={getCuisineLabel(defender)}
            challengerValue={getCuisineLabel(challenger)}
          />
          <StatRow
            label="Area"
            icon="location-outline"
            defenderValue={defender.neighborhood || "—"}
            challengerValue={challenger.neighborhood || "—"}
          />
          <StatRow
            label="Price"
            icon="cash-outline"
            defenderValue={defender.priceRange || "—"}
            challengerValue={challenger.priceRange || "—"}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: `${AMBER}08`,
    borderWidth: 1,
    borderColor: `${AMBER}15`,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
  statsGrid: {
    marginTop: 10,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerName: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  headerNameRight: {
    textAlign: "right",
  },
  headerVs: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginHorizontal: 8,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statCenter: {
    alignItems: "center",
    gap: 2,
    width: 60,
  },
  statLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    letterSpacing: 0.3,
  },
  statValue: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
  statValueRight: {
    textAlign: "right",
  },
  statValueWinner: {
    color: AMBER,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
  },
});
