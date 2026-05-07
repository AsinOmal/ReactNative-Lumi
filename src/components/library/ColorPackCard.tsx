import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pack } from "../../services/packService";
import { getPackGradient, getPackIcon } from "../../constants/packAccents";
import { colors } from "../../constants/colors";

interface Props {
  pack: Pack;
  onPress: () => void;
}

export const ColorPackCard: React.FC<Props> = ({ pack, onPress }) => {
  const gradient = getPackGradient(pack.id);
  const icon = getPackIcon(pack.id);

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${pack.name} pack`}
      accessibilityHint="Double tap to open pack details"
      accessibilityRole="button"
    >
      <View style={styles.header}>
        {pack.coverImageUrl ? (
          <Image
            source={{ uri: pack.coverImageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
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
      </View>
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>
          {pack.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.wordCount}>{pack.wordCount} words</Text>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    height: 120,
    overflow: "hidden",
    backgroundColor: colors.primaryLight,
  },
  iconWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    padding: 4,
  },
  footer: { padding: 12, gap: 4 },
  name: { fontFamily: "Fredoka-Bold", fontSize: 16, color: colors.textDark },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordCount: {
    fontFamily: "Fredoka-Regular",
    fontSize: 12,
    color: colors.textMid,
  },
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
  badgeText: { fontFamily: "Fredoka-SemiBold", fontSize: 10 },
});
