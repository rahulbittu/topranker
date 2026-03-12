/**
 * Error Boundary — Sprint 110
 * Catches unhandled errors and displays a recovery UI.
 * Owner: Sarah Nakamura (Lead Engineer)
 */
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { reportComponentCrash } from "@/lib/error-reporting";
import { addBreadcrumb } from "@/lib/sentry";
import { track } from "@/lib/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Component crash:", {
      error: error.message,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
      componentStack: errorInfo.componentStack?.split("\n").slice(0, 5).join("\n"),
    });
    reportComponentCrash(error, errorInfo.componentStack || undefined);
    // Sprint 726: Breadcrumb + analytics for crash debugging
    addBreadcrumb("error_boundary", `crash: ${error.message}`);
    track("error_boundary_crash" as any, {
      error_message: error.message,
      component_stack: errorInfo.componentStack?.split("\n").slice(0, 3).join(" > ") || "unknown",
    });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    // Sprint 726: Track recovery action
    track("error_boundary_retry" as any);
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      // Sprint 709: Improved error boundary UI — icon, better copy, home fallback
      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={32} color={BRAND.colors.amber} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            Don't worry — your data is safe. Try again or head back to the home screen.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.debugInfo}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={this.handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => {
              track("error_boundary_go_home" as any);
              this.setState({ hasError: false, error: null });
              // Navigate to home — wrapped in try/catch in case router is also broken
              try { require("expo-router").router.replace("/(tabs)"); } catch {}
            }}
            accessibilityRole="button"
            accessibilityLabel="Go to home screen"
          >
            <Text style={styles.homeBtnText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: Colors.background,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${BRAND.colors.amber}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: BRAND.colors.amber,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 15,
    fontFamily: "DMSans_700Bold",
    color: "#FFFFFF",
  },
  homeBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  homeBtnText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Colors.textSecondary,
  },
  debugInfo: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
});
