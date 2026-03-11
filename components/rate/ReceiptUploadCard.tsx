import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { getReceiptHint, type VisitType } from "@/components/rate/RatingPrompts";

interface ReceiptUploadCardProps {
  receiptUri: string | null;
  setReceiptUri: (uri: string | null) => void;
  visitType?: VisitType | null;
}

export function ReceiptUploadCard({ receiptUri, setReceiptUri, visitType }: ReceiptUploadCardProps) {
  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setReceiptUri(result.assets[0].uri);
    }
  };

  const captureReceipt = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setReceiptUri(result.assets[0].uri);
    }
  };

  return (
    <View style={s.receiptSection}>
      <View style={s.receiptHeader}>
        <Ionicons name="shield-checkmark" size={18} color={Colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={s.receiptTitle}>Verify with Receipt</Text>
          <Text style={s.receiptSubtitle}>Highest verification boost available</Text>
        </View>
        <View style={s.receiptBoostBadge}>
          <Text style={s.receiptBoostText}>+25%</Text>
        </View>
      </View>
      {!receiptUri && (
        <View style={s.receiptProofList}>
          <View style={s.receiptProofItem}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.green} />
            <Text style={s.receiptProofText}>Proves you visited this restaurant</Text>
          </View>
          <View style={s.receiptProofItem}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.green} />
            <Text style={s.receiptProofText}>Confirms the date of your experience</Text>
          </View>
          <View style={s.receiptProofItem}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.green} />
            <Text style={s.receiptProofText}>Your rating gets 25% more weight in rankings</Text>
          </View>
        </View>
      )}
      <Text style={s.receiptHint}>
        {getReceiptHint(visitType)}
      </Text>
      {receiptUri ? (
        <View style={s.receiptPreview}>
          <Image source={{ uri: receiptUri }} style={s.receiptImage} contentFit="cover" />
          <TouchableOpacity
            style={s.receiptRemove}
            onPress={() => setReceiptUri(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Remove receipt"
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={s.receiptVerifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
            <Text style={s.receiptVerifiedText}>Verified Purchase</Text>
          </View>
        </View>
      ) : (
        <View style={s.receiptActionRow}>
          <TouchableOpacity
            style={s.receiptBtn}
            onPress={pickReceipt}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Upload receipt from gallery"
          >
            <Ionicons name="document-outline" size={18} color={Colors.textTertiary} />
            <Text style={s.receiptBtnText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.receiptBtn}
            onPress={captureReceipt}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Take a photo of receipt"
          >
            <Ionicons name="camera-outline" size={18} color={Colors.textTertiary} />
            <Text style={s.receiptBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  receiptSection: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: "rgba(196,154,26,0.15)",
  },
  receiptHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  receiptTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  receiptSubtitle: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  receiptProofList: { gap: 6 },
  receiptProofItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  receiptProofText: { fontSize: 12, color: Colors.text, fontFamily: "DMSans_400Regular" },
  receiptBoostBadge: {
    backgroundColor: "rgba(196,154,26,0.12)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  receiptBoostText: { fontSize: 10, fontWeight: "700", color: Colors.gold, fontFamily: "DMSans_700Bold" },
  receiptHint: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 16 },
  receiptPreview: { width: 120, height: 160, borderRadius: 10, overflow: "hidden", position: "relative" as const },
  receiptImage: { width: 120, height: 160, borderRadius: 10 },
  receiptRemove: {
    position: "absolute" as const, top: 4, right: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2,
  },
  receiptVerifiedBadge: {
    position: "absolute" as const, bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: "rgba(34, 139, 34, 0.85)", paddingVertical: 4,
  },
  receiptVerifiedText: { fontSize: 10, color: "#FFFFFF", fontWeight: "600", fontFamily: "DMSans_600SemiBold" },
  receiptActionRow: { flexDirection: "row", gap: 10 },
  receiptBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: Colors.surfaceRaised, borderRadius: 10, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed",
  },
  receiptBtnText: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});
