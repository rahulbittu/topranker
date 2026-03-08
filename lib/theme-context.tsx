/**
 * Theme Context — Sprint 113
 * Provides light/dark/system theme switching with AsyncStorage persistence.
 * Owner: Leo Hernandez (Design)
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { darkColors } from "@/constants/dark-colors";

const STORAGE_KEY = "topranker_theme_preference";

export type ThemePreference = "light" | "dark" | "system";
export type ThemeColors = typeof Colors;

interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  isDark: boolean;
  colors: ThemeColors;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  isDark: false,
  colors: Colors,
  isLoaded: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [isLoaded, setIsLoaded] = useState(false);
  const systemScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
      setIsLoaded(true);
    });
  }, []);

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const isDark = useMemo(() => {
    if (theme === "system") return systemScheme === "dark";
    return theme === "dark";
  }, [theme, systemScheme]);

  const colors = useMemo(() => (isDark ? darkColors : Colors), [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, colors, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Get current theme colors and controls */
export function useTheme() {
  return useContext(ThemeContext);
}

/** Shortcut: just get the resolved color palette */
export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}
