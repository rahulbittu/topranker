export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  // Handle deep links from QR codes, share links, and universal links
  // topranker://business/pecan-lodge → /business/pecan-lodge
  // https://topranker.com/business/pecan-lodge → /business/pecan-lodge

  try {
    // Strip protocol and domain
    let cleanPath = path;
    if (cleanPath.includes("topranker.com/")) {
      cleanPath = "/" + cleanPath.split("topranker.com/")[1];
    }
    if (cleanPath.startsWith("topranker://")) {
      cleanPath = "/" + cleanPath.replace("topranker://", "");
    }

    // Route business deep links
    if (cleanPath.startsWith("/business/")) {
      const slug = cleanPath.replace("/business/", "").split("?")[0];
      if (slug && slug !== "claim" && slug !== "qr" && slug !== "enter-challenger") {
        return `/business/${slug}`;
      }
    }

    // Route challenger deep links
    if (cleanPath.startsWith("/challenger") || cleanPath.startsWith("/(tabs)/challenger")) {
      return "/(tabs)/challenger";
    }

    // Route profile deep links
    if (cleanPath.startsWith("/profile") || cleanPath.startsWith("/(tabs)/profile")) {
      return "/(tabs)/profile";
    }

    // Route discover deep links
    if (cleanPath.startsWith("/discover") || cleanPath.startsWith("/search") || cleanPath.startsWith("/(tabs)/search")) {
      return "/(tabs)/search";
    }
  } catch {
    // Silently fall through to default
  }

  return "/";
}
