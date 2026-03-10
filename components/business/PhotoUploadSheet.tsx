/**
 * Sprint 438: Community photo upload sheet for business pages.
 * Allows authenticated users to submit photos from camera or gallery.
 * Photos go through moderation before appearing on the business page.
 */
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Platform, Alert, ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { pct } from "@/lib/style-helpers";
import { useAuth } from "@/lib/auth-context";
import { getApiUrl } from "@/lib/query-client";

const AMBER = BRAND.colors.amber;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface PhotoUploadSheetProps {
  visible: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  onUploadSuccess?: () => void;
}

type PickedPhoto = {
  uri: string;
  base64: string;
  mimeType: string;
  width: number;
  height: number;
};

export function PhotoUploadSheet({
  visible, onClose, businessId, businessName, onUploadSuccess,
}: PhotoUploadSheetProps) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<"success" | "error" | null>(null);

  const resetState = useCallback(() => {
    setPhoto(null);
    setUploading(false);
    setUploadResult(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to upload photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhoto({
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || "image/jpeg",
          width: asset.width,
          height: asset.height,
        });
      }
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow camera access to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhoto({
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || "image/jpeg",
          width: asset.width,
          height: asset.height,
        });
      }
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!photo || !user) return;
    setUploading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/businesses/${businessId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          data: photo.base64,
          mimeType: photo.mimeType,
          caption: "",
        }),
      });
      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setUploadResult("success");
        onUploadSuccess?.();
      } else {
        const err = await response.json().catch(() => ({ error: "Upload failed" }));
        Alert.alert("Upload failed", err.error || "Please try again.");
        setUploadResult("error");
      }
    } catch {
      Alert.alert("Upload failed", "Network error. Please try again.");
      setUploadResult("error");
    } finally {
      setUploading(false);
    }
  }, [photo, user, businessId, onUploadSuccess]);

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Add Photo</Text>
            <TouchableOpacity onPress={handleClose} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={s.subtitle} numberOfLines={1}>
            {businessName}
          </Text>

          {/* Upload success state */}
          {uploadResult === "success" && (
            <View style={s.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
              <Text style={s.successTitle}>Photo submitted!</Text>
              <Text style={s.successDesc}>
                Your photo will appear after review by our team.
              </Text>
              <TouchableOpacity style={s.doneBtn} onPress={handleClose}>
                <Text style={s.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Photo picker or preview */}
          {uploadResult !== "success" && !photo && (
            <View style={s.pickerContainer}>
              <Text style={s.pickerHint}>
                Share a photo of this place with the community
              </Text>
              <View style={s.pickerRow}>
                <TouchableOpacity
                  style={s.pickerBtn}
                  onPress={pickFromCamera}
                  accessibilityRole="button"
                  accessibilityLabel="Take a photo"
                >
                  <Ionicons name="camera" size={28} color={AMBER} />
                  <Text style={s.pickerBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.pickerBtn}
                  onPress={pickFromGallery}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from gallery"
                >
                  <Ionicons name="images" size={28} color={AMBER} />
                  <Text style={s.pickerBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.sizeHint}>JPEG, PNG, or WebP · Max 10MB</Text>
            </View>
          )}

          {/* Preview + submit */}
          {uploadResult !== "success" && photo && (
            <View style={s.previewContainer}>
              <View style={s.previewWrap}>
                <Image
                  source={{ uri: photo.uri }}
                  style={s.previewImage}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => setPhoto(null)}
                  accessibilityLabel="Remove photo"
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={s.previewMeta}>
                {photo.width}×{photo.height} · {photo.mimeType.split("/")[1]?.toUpperCase()}
              </Text>
              <View style={s.moderationNote}>
                <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textTertiary} />
                <Text style={s.moderationText}>
                  Photos are reviewed before appearing publicly
                </Text>
              </View>
              <TouchableOpacity
                style={[s.submitBtn, uploading && s.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={uploading}
                accessibilityRole="button"
                accessibilityLabel="Submit photo for review"
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                    <Text style={s.submitBtnText}>Submit Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  title: {
    fontSize: 17, fontWeight: "700", color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  subtitle: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    marginTop: 2, marginBottom: 16,
  },
  pickerContainer: { alignItems: "center", gap: 16, paddingVertical: 20 },
  pickerHint: {
    fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium",
    textAlign: "center",
  },
  pickerRow: { flexDirection: "row", gap: 20 },
  pickerBtn: {
    alignItems: "center", justifyContent: "center", gap: 6,
    width: 100, height: 100, borderRadius: 16,
    backgroundColor: `${AMBER}08`, borderWidth: 1.5, borderColor: `${AMBER}25`,
  },
  pickerBtnText: {
    fontSize: 12, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
  sizeHint: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  previewContainer: { alignItems: "center", gap: 12, paddingVertical: 8 },
  previewWrap: { position: "relative", borderRadius: 12, overflow: "hidden" },
  previewImage: {
    width: pct(100), aspectRatio: 4 / 3,
    backgroundColor: Colors.surfaceRaised,
    minHeight: 200,
  },
  removeBtn: {
    position: "absolute", top: 8, right: 8,
  },
  previewMeta: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  moderationNote: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8,
  },
  moderationText: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: AMBER, borderRadius: 12,
    paddingVertical: 14, width: pct(100),
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold",
  },
  successContainer: { alignItems: "center", gap: 12, paddingVertical: 30 },
  successTitle: {
    fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  successDesc: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center",
  },
  doneBtn: {
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10,
    backgroundColor: AMBER, marginTop: 8,
  },
  doneBtnText: {
    fontSize: 14, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold",
  },
});
