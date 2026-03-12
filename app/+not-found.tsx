import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container} accessibilityRole="alert" accessibilityLabel="Page not found">
        <Ionicons name="compass-outline" size={48} color={Colors.textTertiary} accessibilityElementsHidden />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>This page doesn't exist or has been moved.</Text>
        <Link href="/" style={styles.link} accessibilityRole="button" accessibilityLabel="Back to Rankings">
          <Text style={styles.linkText}>Back to Rankings</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.background,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  link: {
    marginTop: 12,
    backgroundColor: Colors.text,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "DMSans_600SemiBold",
  },
});
