/**
 * Sprint 483: Infinite Scroll Footer
 *
 * Loading indicator and "end of results" message for
 * FlatList ListFooterComponent during infinite scroll.
 */
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export interface InfiniteScrollFooterProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalCount: number;
  displayedCount: number;
}

export function InfiniteScrollFooter({
  isFetchingNextPage,
  hasNextPage,
  totalCount,
  displayedCount,
}: InfiniteScrollFooterProps) {
  if (isFetchingNextPage) {
    return (
      <View style={s.container}>
        <ActivityIndicator size="small" color={AMBER} />
        <Text style={s.loadingText}>Loading more results...</Text>
      </View>
    );
  }

  if (!hasNextPage && displayedCount > 0 && totalCount > displayedCount) {
    return (
      <View style={s.container}>
        <Text style={s.endText}>Showing all {displayedCount} results</Text>
      </View>
    );
  }

  if (!hasNextPage && displayedCount > 0) {
    return (
      <View style={s.container}>
        <Text style={s.endText}>
          {totalCount > 0 ? `All ${totalCount} results loaded` : "End of results"}
        </Text>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  endText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
});
