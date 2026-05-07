import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../../constants/colors";

const CARD_WIDTH = (Dimensions.get("window").width - 32 - 24) / 3;

const PACK_META: Record<string, { gradient: string[]; icon: string }> = {
  fruits: { gradient: ["#FF8A65", "#FF6B6B"], icon: "fruit-watermelon" },
  vegetables: { gradient: ["#4ECDC4", "#26A69A"], icon: "carrot" },
  vehicles: { gradient: ["#5C9CE5", "#4A90D9"], icon: "car" },
  dinosaurs: { gradient: ["#FFC107", "#F59E0B"], icon: "dinosaur" },
  space: { gradient: ["#B553E8", "#7C3AED"], icon: "rocket-launch" },
};

interface PackCardProps {
  id: string;
  name: string;
  progress: number;
  total: number;
  isPremium?: boolean;
  isUnlocked?: boolean;
  onPress?: () => void;
}

export const PackCard = ({
  id,
  name,
  progress,
  total,
  isPremium = false,
  isUnlocked = true,
  onPress,
}: PackCardProps) => {
  const isLocked = isPremium && !isUnlocked;
  const meta = PACK_META[id] ?? {
    gradient: [colors.primary, colors.primaryDark],
    icon: "cube-outline",
  };

  return (
    <TouchableOpacity
      style={[styles.touchable, isLocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={meta.gradient} style={styles.header}>
        <MaterialCommunityIcons
          name={meta.icon}
          size={28}
          color="rgba(255,255,255,0.95)"
        />
        {isLocked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={10} color="#FFF" />
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        <View
          style={[
            styles.badge,
            isLocked ? styles.badgePremium : styles.badgeFree,
          ]}
        >
          <Ionicons
            name={isLocked ? "star" : "checkmark"}
            size={10}
            color={isLocked ? "#92400E" : "#166534"}
          />
          <Text
            style={[
              styles.badgeText,
              isLocked ? styles.badgeTextPremium : styles.badgeTextFree,
            ]}
          >
            {isLocked ? "Premium" : "Free"}
          </Text>
        </View>
        <Text style={styles.packName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.progressText}>
          {isLocked ? "Preview" : `${progress}/${total}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: CARD_WIDTH,
    margin: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLocked: { opacity: 0.85 },
  header: {
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 3,
  },
  body: {
    padding: 8,
    alignItems: "center",
    gap: 3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeFree: { backgroundColor: "#DCFCE7" },
  badgePremium: { backgroundColor: "#FEF3C7" },
  badgeText: { fontFamily: "Fredoka-SemiBold", fontSize: 9 },
  badgeTextFree: { color: "#166534" },
  badgeTextPremium: { color: "#92400E" },
  packName: {
    fontFamily: "Fredoka-Bold",
    fontSize: 13,
    color: colors.textDark,
    textAlign: "center",
  },
  progressText: {
    fontFamily: "Fredoka-Regular",
    fontSize: 11,
    color: colors.textMid,
    textAlign: "center",
  },
});
