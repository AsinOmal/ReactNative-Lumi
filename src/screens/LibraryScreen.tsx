import React from "react";
import { Text, ScrollView, StatusBar, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { usePackStore } from "../store/usePackStore";
import { useRemoteContentStore } from "../store/useRemoteContentStore";
import { PackGrid } from "../components/home/PackGrid";
import { colors } from "../constants/colors";
import { GameBackground } from "../components/common/GameBackground";
import {
  buttonGradientColors,
  shadowHeader,
} from "../constants/skeuomorphicTokens";

export const LibraryScreen = () => {
  const insets = useSafeAreaInsets();
  const { packs, loading, loadPacks } = usePackStore();
  const appConfig = useRemoteContentStore((s) => s.appConfig);

  useFocusEffect(
    React.useCallback(() => {
      loadPacks();
    }, [])
  );

  const freePacks = packs.filter((p) => !p.isPremium);
  const premiumPacks = packs.filter((p) => p.isPremium);

  return (
    <GameBackground>
      <StatusBar barStyle="dark-content" />

      {/* Teal gradient header — wave bottom edge, bookshelf watermark */}
      <LinearGradient
        colors={buttonGradientColors.header}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <MaterialCommunityIcons
          name="bookshelf"
          size={180}
          color="rgba(255,255,255,0.08)"
          style={styles.watermark}
        />
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>{packs.length} packs available</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {freePacks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Free Packs</Text>
            <PackGrid packs={freePacks} loading={loading} />
          </>
        )}
        {premiumPacks.length > 0 &&
          appConfig?.premiumPacksEnabled !== false && (
            <>
              <Text style={styles.sectionLabel}>Premium Packs</Text>
              <PackGrid packs={premiumPacks} loading={false} />
            </>
          )}
      </ScrollView>
    </GameBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    ...shadowHeader,
  },
  watermark: {
    position: "absolute",
    right: -24,
    bottom: -20,
  },
  title: { fontFamily: "Fredoka-Bold", fontSize: 40, color: colors.textDark },
  subtitle: {
    fontFamily: "Fredoka-Regular",
    fontSize: 16,
    color: colors.textMid,
    marginTop: 2,
  },

  body: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  sectionLabel: {
    fontFamily: "Fredoka-Bold",
    fontSize: 22,
    color: colors.textDark,
    marginTop: 8,
  },
});
