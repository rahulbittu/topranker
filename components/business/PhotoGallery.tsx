import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeImage } from "@/components/SafeImage";
import Colors from "@/constants/colors";

export interface PhotoGalleryProps {
  photoUrls: string[];
  category: string;
}

export function PhotoGallery({ photoUrls, category }: PhotoGalleryProps) {
  if (photoUrls.length <= 1) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Photos</Text>
        <Text style={s.count}>{photoUrls.length} photos</Text>
      </View>
      <View style={s.grid}>
        {/* Featured first photo — full width */}
        <SafeImage
          uri={photoUrls[0]}
          style={s.featured}
          contentFit="cover"
          category={category}
        />
        {/* Remaining photos — 2-column grid */}
        <View style={s.row}>
          {photoUrls.slice(1, 5).map((url, i) => (
            <SafeImage
              key={i}
              uri={url}
              style={s.gridImage}
              contentFit="cover"
              category={category}
            />
          ))}
        </View>
        {photoUrls.length > 5 && (
          <Text style={s.more}>+{photoUrls.length - 5} more in carousel above</Text>
        )}
      </View>
    </View>
  );
}

export default PhotoGallery;

const s = StyleSheet.create({
  container: { gap: 10 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  title: {
    fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  count: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_500Medium",
  },
  grid: {
    borderRadius: 12, overflow: "hidden", gap: 3,
  },
  featured: {
    width: "100%" as any, aspectRatio: 16 / 9,
    backgroundColor: Colors.surfaceRaised,
  },
  row: {
    flexDirection: "row", flexWrap: "wrap", gap: 3,
  },
  gridImage: {
    width: "48.5%" as any, aspectRatio: 1,
    backgroundColor: Colors.surfaceRaised,
  },
  more: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_500Medium",
    textAlign: "center", paddingVertical: 6,
  },
});
