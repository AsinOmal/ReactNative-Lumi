import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pack } from "../services/packService";
import { getPackAccent } from "../constants/packAccents";
import { colors } from "../constants/colors";
import { MODEL_REGISTRY } from "../utils/modelRegistry";
import { GameBackground } from "../components/common/GameBackground";

export const PackDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { pack } = route.params as { pack: Pack };
  const accent = getPackAccent(pack.id);

  if (pack.isPremium) {
    return (
      <GameBackground>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[accent, `${accent}CC`]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.packName}>{pack.name}</Text>
          <View style={{ width: 44 }} />
        </LinearGradient>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <View style={styles.lockCard}>
            <Ionicons
              name="lock-closed"
              size={52}
              color={colors.primaryLight}
            />
            <Text style={styles.lockTitle}>This pack is locked</Text>
            <Text style={styles.lockBody}>
              Unlock {pack.name} to scan, discover, and play with all{" "}
              {pack.wordCount} 3D models!
            </Text>
            <View style={styles.chipRow}>
              {pack.words.slice(0, 6).map((w) => (
                <View key={w} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </Text>
                </View>
              ))}
              {pack.words.length > 6 && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    +{pack.words.length - 6} more
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.unlockBtn, { backgroundColor: accent }]}
              activeOpacity={0.85}
              accessibilityLabel={`Unlock ${pack.name} pack`}
              accessibilityRole="button"
            >
              <Ionicons name="star" size={20} color={colors.accentYellow} />
              <Text style={styles.unlockBtnText}>Unlock {pack.name}</Text>
            </TouchableOpacity>
            <Text style={styles.comingSoon}>In-app purchase — coming soon</Text>
          </View>
        </ScrollView>
      </GameBackground>
    );
  }

  return (
    <GameBackground>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[accent, `${accent}BB`]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.packName}>{pack.name}</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {pack.words.map((word) => {
          const display = word.charAt(0).toUpperCase() + word.slice(1);
          const model = MODEL_REGISTRY[word];
          return (
            <View key={word} style={styles.wordRow}>
              <MaterialCommunityIcons
                name="cube-outline"
                size={26}
                color={accent}
              />
              <Text style={styles.wordLabel}>{display}</Text>
              <Text style={styles.wordSyllables}>
                {model?.syllables.join(" · ") ?? ""}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.arBtn, { backgroundColor: accent }]}
        activeOpacity={0.85}
        onPress={() => (navigation as any).navigate("PackARPreview", { pack })}
        accessibilityLabel="View pack in AR"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="target" size={22} color="#FFF" />
        <Text style={styles.arBtnText}>View in AR</Text>
      </TouchableOpacity>
    </GameBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  backBtn: { padding: 8, width: 44 },
  packName: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Fredoka-Bold",
    fontSize: 24,
    color: "#FFF",
  },
  body: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  wordRow: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  wordLabel: {
    fontFamily: "Fredoka-Bold",
    fontSize: 18,
    color: colors.textDark,
    flex: 1,
  },
  wordSyllables: {
    fontFamily: "Fredoka-Regular",
    fontSize: 13,
    color: colors.textMid,
  },
  // Premium lock card
  lockCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 28,
    margin: 16,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  lockTitle: {
    fontFamily: "Fredoka-Bold",
    fontSize: 24,
    color: colors.textDark,
    textAlign: "center",
  },
  lockBody: {
    fontFamily: "Fredoka-Regular",
    fontSize: 15,
    color: colors.textMid,
    textAlign: "center",
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
  chip: {
    backgroundColor: "#EDE9FE",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
  unlockBtn: {
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  unlockBtnText: { fontFamily: "Fredoka-Bold", fontSize: 18, color: "#FFF" },
  comingSoon: {
    fontFamily: "Fredoka-Regular",
    fontSize: 13,
    color: colors.textMid,
    marginTop: 4,
  },
  // AR button
  arBtn: {
    marginHorizontal: 16,
    marginBottom: 32,
    marginTop: 8,
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  arBtnText: { fontFamily: "Fredoka-Bold", fontSize: 18, color: "#FFF" },
});
