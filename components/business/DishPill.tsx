import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import type { ApiDish } from "@/lib/api";

export function DishPill({ dish }: { dish: ApiDish }) {
  return (
    <View style={s.dishPill}>
      <Text style={s.dishPillText}>{dish.name}</Text>
      <Text style={s.dishVoteCountText}>{dish.voteCount}</Text>
    </View>
  );
}

export default DishPill;

const s = StyleSheet.create({
  dishPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: `${BRAND.colors.amber}10`,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: `${BRAND.colors.amber}25`,
  },
  dishPillText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_500Medium",
  },
  dishVoteCountText: {
    fontSize: 11, color: BRAND.colors.amber, fontWeight: "700",
    fontFamily: "DMSans_700Bold",
  },
});
