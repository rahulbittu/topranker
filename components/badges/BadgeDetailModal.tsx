/**
 * Badge Detail Modal — Full badge info with share button
 * Owner: Suki (Design Lead) + James Park (Frontend)
 *
 * Displays badge icon, name, rarity, description, progress,
 * and a share button for earned badges.
 */
import React, { useRef } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Alert,
} from "react-native";
import { TypedIcon } from "@/components/TypedIcon";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import {
  type EarnedBadge, RARITY_COLORS, RARITY_LABELS,
} from "@/lib/badges";
import { BadgeShareCard } from "@/components/badges/BadgeShareCard";
import { shareBadgeCard, getBadgeShareUrl } from "@/lib/badge-sharing";
import * as Clipboard from "expo-clipboard";

const AMBER = BRAND.colors.amber;

interface BadgeDetailModalProps {
  badge: EarnedBadge | null;
  userName: string;
  onClose: () => void;
}

export function BadgeDetailModal({ badge, userName, onClose }: BadgeDetailModalProps) {
  const shareCardRef = useRef<View>(null);

  if (!badge) return null;

  const isEarned = badge.earnedAt > 0;
  const rarity = RARITY_COLORS[badge.badge.rarity];
  const earnedDate = isEarned
    ? new Date(badge.earnedAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "";

  const handleShare = async () => {
    const success = await shareBadgeCard(shareCardRef);
    if (!success) {
      Alert.alert("Sharing unavailable", "Badge sharing is not available on this device.");
    }
  };

  const handleCopyLink = async () => {
    const url = getBadgeShareUrl(badge.badge.id, userName);
    await Clipboard.setStringAsync(url);
    Alert.alert("Link Copied", "Badge share link copied to clipboard!");
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={s.card}>
          {/* Badge icon */}
          <View style={[s.iconCircle, {
            borderColor: isEarned ? rarity.border : Colors.border,
            backgroundColor: isEarned ? rarity.bg : Colors.surfaceRaised,
          }]}>
            <TypedIcon
              name={badge.badge.icon}
              size={36}
              color={isEarned ? badge.badge.color : Colors.textTertiary}
            />
          </View>

          {/* Badge name */}
          <Text style={s.badgeName}>{badge.badge.name}</Text>

          {/* Rarity pill */}
          <View style={[s.rarityPill, { backgroundColor: rarity.bg }]}>
            <Text style={[s.rarityText, { color: rarity.text }]}>
              {RARITY_LABELS[badge.badge.rarity]}
            </Text>
          </View>

          {/* Description */}
          <Text style={s.description}>{badge.badge.description}</Text>

          {/* Progress or earned date */}
          {isEarned ? (
            <Text style={s.earnedDate}>Earned {earnedDate}</Text>
          ) : (
            <View style={s.progressSection}>
              <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, {
                  width: `${badge.progress}%`,
                  backgroundColor: badge.badge.color,
                }]} />
              </View>
              <Text style={[s.progressText, { color: badge.badge.color }]}>
                {Math.round(badge.progress)}% complete
              </Text>
            </View>
          )}

          {/* Share buttons (only for earned badges) */}
          {isEarned && (
            <View style={s.shareRow}>
              <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                <TypedIcon name="share-outline" size={18} color="#FFFFFF" />
                <Text style={s.shareBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.linkBtn} onPress={handleCopyLink} activeOpacity={0.8}>
                <TypedIcon name="link-outline" size={18} color={AMBER} />
                <Text style={s.linkBtnText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Hidden share card for screenshot capture */}
      {isEarned && (
        <View style={s.offscreen}>
          <BadgeShareCard
            ref={shareCardRef}
            badge={badge.badge}
            userName={userName}
            earnedDate={earnedDate}
          />
        </View>
      )}
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 340,
    ...Colors.cardShadow,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_900Black",
    textAlign: "center",
  },
  rarityPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  earnedDate: {
    fontSize: 12,
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },
  progressSection: {
    width: "100%",
    gap: 6,
    alignItems: "center",
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
  shareRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AMBER,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${AMBER}15`,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: AMBER,
    fontFamily: "DMSans_700Bold",
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
  offscreen: {
    position: "absolute",
    left: -9999,
    top: -9999,
  },
});
