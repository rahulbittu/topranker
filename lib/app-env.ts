/**
 * Sprint 198: App environment configuration for native builds.
 * Reads APP_ENV from EAS Build env or defaults based on __DEV__.
 */

import Constants from "expo-constants";

export type AppEnvironment = "development" | "preview" | "production";

export function getAppEnvironment(): AppEnvironment {
  // EAS Build sets APP_ENV in eas.json build profiles
  const easEnv = Constants.expoConfig?.extra?.APP_ENV;
  if (easEnv === "production") return "production";
  if (easEnv === "preview") return "preview";

  // Fallback: __DEV__ is true in development, false in production bundles
  return __DEV__ ? "development" : "production";
}

export function getApiBaseUrl(): string {
  const env = getAppEnvironment();
  if (env === "production") return "https://topranker.io";
  if (env === "preview") return "https://topranker.io";
  // Development: use local or Replit URL
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
}

export const APP_ENV = getAppEnvironment();
export const API_BASE_URL = getApiBaseUrl();
export const IS_PRODUCTION = APP_ENV === "production";
export const IS_PREVIEW = APP_ENV === "preview";
export const IS_DEVELOPMENT = APP_ENV === "development";

// App version from app.json
export const APP_VERSION = Constants.expoConfig?.version || "1.0.0";
export const BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber ||
  Constants.expoConfig?.android?.versionCode?.toString() || "1";
