import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Animated,
  StatusBar,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { usePackStore } from '../store/usePackStore';
import { HomeHeaderSection } from '../components/home/HomeHeaderSection';
import { BannerAnnouncement } from '../components/home/BannerAnnouncement';
import { PinResetBanner } from '../components/home/PinResetBanner';
import { ColorPackCard } from '../components/library/ColorPackCard';
import { getSavedWords, getStreak } from '../utils/achievementStore';
import { getDailyWord, isDailyWordFound } from '../utils/dailyWordHunt';
import { loadSavedWordsFromFirestore } from '../services/savedWordsService';
import type { Pack } from '../types/pack';
import { ParallaxScene } from '../components/scenes/ParallaxScene';
import type { MascotState } from '../components/common/LumiMascot';

// Mascot reactivity rules (kept loose so all states still get exercised):
// - Daily word done → happy
// - Long streak → excited
// - Otherwise → idle
const deriveMascotState = (
  dailyFound: boolean,
  streak: number
): MascotState => {
  if (dailyFound) {
    return 'happy';
  }
  if (streak >= 7) {
    return 'excited';
  }
  return 'idle';
};

export const HomeScreen = () => {
  const { user, childName } = useAuthStore();
  const { packs, loading, loadPacks } = usePackStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const scrollY = useRef(new Animated.Value(0)).current;
  const [wordCount, setWordCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyFound, setDailyFound] = useState(false);
  const dailyWord = getDailyWord();
  const mascotState = deriveMascotState(dailyFound, streak);

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
            setDailyFound(isDailyWordFound(fw));
            return;
          }
          const local = await getSavedWords();
          setWordCount(local.length);
          setDailyFound(isDailyWordFound(local));
        } catch (e) {
          console.error('[HomeScreen] loadData:', e);
        }
      };
      load();
    }, [user])
  );

  const renderItem: ListRenderItem<Pack> = ({ item: pack }) => (
    <View style={styles.cell}>
      <ColorPackCard
        pack={pack}
        onPress={() => (navigation as any).navigate('PackDetail', { pack })}
      />
    </View>
  );

  const header = (
    <>
      <PinResetBanner />
      <BannerAnnouncement />
      <HomeHeaderSection
        childName={childName}
        streak={streak}
        wordCount={wordCount}
        dailyWord={dailyWord}
        dailyFound={dailyFound}
        mascotState={mascotState}
        onTrophyPress={() => (navigation as any).navigate('Achievements')}
        onProgressPress={() => (navigation as any).navigate('SavedWords')}
      />
    </>
  );

  return (
    <ParallaxScene paused={!isFocused} scrollY={scrollY}>
      <StatusBar barStyle="dark-content" />
      <Animated.FlatList
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        decelerationRate={0.992}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      />
    </ParallaxScene>
  );
};

const styles = StyleSheet.create({
  list: { backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 16, gap: 12 },
  row: { gap: 12 },
  cell: { flex: 1 },
});
