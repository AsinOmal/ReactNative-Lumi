import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { Pack } from "../../types/pack";
import { getPackGradient, getPackIcon } from "../../constants/packAccents";
import { colors } from "../../constants/colors";
import { usePackDownloadStore } from "../../store/usePackDownloadStore";
import { DownloadBadge } from "./DownloadBadge";

interface Props {
  pack: Pack;
  onPress: () => void;
}

export const ColorPackCard: React.FC<Props> = ({ pack, onPress }) => {
  const gradient = getPackGradient(pack.id);
  const icon = getPackIcon(pack.id);
  const dlStatus = usePackDownloadStore((s) => s.packs[pack.id]?.status);
  // Bundled (or legacy/undefined-typed) packs are already available — no badge.
  const showBadge = !!pack.packType && pack.packType !== "bundled";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${pack.name} pack`}
      accessibilityHint="Double tap to open pack details"
      accessibilityRole="button"
    >
      {/* 3-layer wood bevel wraps the card — overflow:hidden lives on the inner
          card so the image clips correctly while the bevel sits outside the clip */}
      <View style={styles.woodOuter}>
        <View style={styles.woodInner}>
          <View style={styles.card}>
            <View style={styles.header}>
              {pack.coverImageUrl ? (
                <Image
                  source={{ uri: pack.coverImageUrl, cache: "force-cache" }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              ) : (
                <LinearGradient colors={gradient} style={StyleSheet.absoluteFill}>
                  <View style={styles.iconWrap}>
                    <MaterialCommunityIcons
                      name={icon}
                      size={48}
                      color="rgba(255,255,255,0.95)"
                    />
                  </View>
                </LinearGradient>
              )}
              {pack.isPremium && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color="#FFF" />
                </View>
              )}
              {showBadge && <DownloadBadge status={dlStatus} />}
            </View>
            <View style={styles.footer}>
              <Text style={styles.name} numberOfLines={1}>
                {pack.name}
              </Text>
              <View style={styles.packProgressTrack}>
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.packProgressFill, { width: "0%" }]} />
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.wordCount}>0/{pack.wordCount} words</Text>
                {pack.isPremium ? (
                  <View style={[styles.badge, styles.badgePremium]}>
                    <Ionicons name="star" size={9} color={colors.accentAmber} />
                    <Text style={[styles.badgeText, { color: colors.accentAmber }]}>
                      Premium
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.badge, styles.badgeFree]}>
                    <Ionicons name="checkmark" size={9} color={colors.successDark} />
                    <Text style={[styles.badgeText, { color: colors.successDark }]}>
                      Free
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  woodOuter: {
    borderRadius: 26,
    padding: 3,
    backgroundColor: "#5C3317",
    shadowColor: "#5C3317",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  woodInner: {
    borderRadius: 23,
    padding: 2,
    backgroundColor: "#C48A4A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    overflow: "hidden",
  },
  header: { aspectRatio: 1, overflow: "hidden", backgroundColor: colors.primaryLight },
  iconWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  lockBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    padding: 4,
  },
  footer: { padding: 12, gap: 6 },
  packProgressTrack: { height: 4, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.06)", overflow: "hidden" },
  packProgressFill: { height: 4, borderRadius: 2 },
  name: { fontFamily: "Fredoka-Bold", fontSize: 19, color: colors.textDark },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordCount: { fontFamily: "Fredoka-Regular", fontSize: 15, color: colors.textMid },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeFree: { backgroundColor: "#DCFCE7" },
  badgePremium: { backgroundColor: "#FEF3C7" },
  badgeText: { fontFamily: "Fredoka-SemiBold", fontSize: 13 },
});
