/**
 * Themed Styles Utility — Sprint 114
 * Creates StyleSheet factories that respond to theme changes.
 * Owner: Sarah Nakamura (Lead Engineer)
 */
import { StyleSheet } from "react-native";
import { useMemo } from "react";
import { useThemeColors, type ThemeColors } from "./theme-context";
import Colors from "@/constants/colors";

/** Create a styles factory that receives theme colors */
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: typeof Colors) => T
) {
  // Pre-compute light theme styles for static usage
  const lightStyles = StyleSheet.create(factory(Colors));
  return { factory, lightStyles };
}

/** Hook that returns theme-aware styles */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styleDef: { factory: (colors: typeof Colors) => T; lightStyles: StyleSheet.NamedStyles<T> }
): StyleSheet.NamedStyles<T> {
  const colors = useThemeColors();
  return useMemo(
    () => StyleSheet.create(styleDef.factory(colors)),
    [colors]
  );
}
