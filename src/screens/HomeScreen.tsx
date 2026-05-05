import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StatusBar,
  StyleSheet,
  ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../store/useAuthStore";
import { usePackStore } from "../store/usePackStore";
import { HomeHeaderSection } from "../components/home/HomeHeaderSection";
import { BannerAnnouncement } from "../components/home/BannerAnnouncement";
import { ColorPackCard } from "../components/library/ColorPackCard";
import { getProgress, getStreak } from "../utils/achievementStore";
import { getDailyWord, isDailyWordFound } from "../utils/dailyWordHunt";
import { loadSavedWordsFromFirestore } from "../services/savedWordsService";
import { Pack } from "../services/packService";
import { GameBackground } from "../components/common/GameBackground";

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { packs, loading, loadPacks } = usePackStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const firstName = user?.displayName?.split(" ")[0] ?? "Explorer";

  const [wordCount, setWordCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyFound, setDailyFound] = useState(false);
  const dailyWord = getDailyWord();

  useFocusEffect(
    useCallback(() => {
      loadPacks();
      const load = async () => {
        try {
          const s = await getStreak();
          setStreak(s);
          if (user) {
            const fw = await loadSavedWordsFromFirestore(user.uid);
            setWordCount(fw.length);
            setDailyFound(isDailyWordFound(fw.map((w) => w.word)));
            return;
          }
          const p = await getProgress();
          setWordCount(p.scannedWords.length);
          setDailyFound(isDailyWordFound(p.scannedWords));
        } catch (e) {
          console.error("[HomeScreen] loadData:", e);
        }
      };
      load();
    }, [user])
  );

  const renderItem: ListRenderItem<Pack> = ({ item: pack }) => (
    <View style={styles.cell}>
      <ColorPackCard
        pack={pack}
        onPress={() => (navigation as any).navigate("PackDetail", { pack })}
      />
    </View>
  );

  const header = (
    <>
      <BannerAnnouncement />
      <HomeHeaderSection
        firstName={firstName}
        streak={streak}
        wordCount={wordCount}
        dailyWord={dailyWord}
        dailyFound={dailyFound}
        onTrophyPress={() => (navigation as any).navigate("Achievements")}
        onProgressPress={() => (navigation as any).navigate("SavedWords")}
      />
    </>
  );

  return (
    <GameBackground>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={loading ? [] : packs}
        keyExtractor={(p) => p.id}
        numColumns={2}
        renderItem={renderItem}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </GameBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  row: { gap: 12 },
  cell: { flex: 1 },
});
