import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../store/useAuthStore';
import { usePackStore } from '../store/usePackStore';
import { LumiMascot } from '../components/common/LumiMascot';
import { DailyWordBanner } from '../components/home/DailyWordBanner';
import { PackGrid } from '../components/home/PackGrid';
import { getProgress, getStreak } from '../utils/achievementStore';
import { getDailyWord, isDailyWordFound } from '../utils/dailyWordHunt';
import { loadSavedWordsFromFirestore } from '../services/savedWordsService';
import { colors } from '../constants/colors';

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { packs, loading, loadPacks } = usePackStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const firstName = user?.displayName?.split(' ')[0] ?? 'Explorer';

  const [wordCount, setWordCount] = useState(0);
  const [streak, setStreak]       = useState(0);
  const [dailyFound, setDailyFound] = useState(false);
  const dailyWord = getDailyWord();

  useFocusEffect(
    React.useCallback(() => {
      loadPacks();
      const load = async () => {
        try {
          const s = await getStreak();
          setStreak(s);
          if (user) {
            const fw = await loadSavedWordsFromFirestore(user.uid);
            setWordCount(fw.length);
            setDailyFound(isDailyWordFound(fw.map(w => w.word)));
            return;
          }
          const p = await getProgress();
          setWordCount(p.scannedWords.length);
          setDailyFound(isDailyWordFound(p.scannedWords));
        } catch (e) {
          console.error('[HomeScreen] loadData:', e);
        }
      };
      load();
    }, [user])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.body} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>

        {/* App logo placeholder — swap <View> for <Image> when asset is ready */}
        <View style={styles.logoRow}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>LUMI</Text>
          </View>
        </View>

        {/* Greeting card — lighter gradient so the mascot Lottie isn't swallowed */}
        <LinearGradient colors={['#9B62D4', '#B57AE0']} style={styles.headerCard}>
          <MaterialCommunityIcons name="star-four-points" size={14} color="rgba(255,255,255,0.35)" style={styles.deco1} />
          <MaterialCommunityIcons name="star-four-points" size={9}  color="rgba(255,255,255,0.25)" style={styles.deco2} />
          <MaterialCommunityIcons name="star-four-points" size={12} color="rgba(255,255,255,0.3)"  style={styles.deco3} />

          <View style={styles.mascotCircle}>
            <LumiMascot state="idle" size={90} />
          </View>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Hello, {firstName}!</Text>
            <Text style={styles.subGreeting}>Ready to explore?</Text>
            {streak >= 3 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={13} color={colors.accentYellow} />
                <Text style={styles.streakText}>{streak} day streak</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.trophyBtn} onPress={() => (navigation as any).navigate('Achievements')}>
            <Ionicons name="trophy" size={28} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <DailyWordBanner word={dailyWord} isFound={dailyFound} />

        {/* Words found progress banner */}
        <TouchableOpacity style={styles.progressBanner} activeOpacity={0.85} onPress={() => (navigation as any).navigate('SavedWords')}>
          <View style={styles.progressLeft}>
            <Ionicons name="bookmark" size={22} color={colors.primary} />
            <View>
              <Text style={styles.progressCount}>{wordCount} words found</Text>
              <Text style={styles.progressSub}>Tap to see your collection</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Your Packs</Text>
        </View>
        <PackGrid packs={packs} loading={loading} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyBottom },
  body:   { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 16 },

  logoRow: { alignItems: 'center', marginBottom: 4 },
  logoPlaceholder: {
    backgroundColor: colors.primary, borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 6,
  },
  logoText: { fontFamily: 'Fredoka-Bold', fontSize: 24, color: '#FFF', letterSpacing: 3 },

  headerCard: {
    borderRadius: 28, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12,
    overflow: 'hidden',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 18, elevation: 8,
  },
  deco1: { position: 'absolute', top: 12, right: 54 },
  deco2: { position: 'absolute', top: 28, right: 36 },
  deco3: { position: 'absolute', bottom: 14, left: 110 },

  mascotCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  greetingBlock: { flex: 1, gap: 2 },
  greeting:    { fontFamily: 'Fredoka-Bold', fontSize: 24, color: '#FFF' },
  subGreeting: { fontFamily: 'Fredoka-Regular', fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
  },
  streakText: { fontFamily: 'Fredoka-Bold', fontSize: 13, color: '#FFF' },
  trophyBtn:  { padding: 6 },

  progressBanner: {
    backgroundColor: colors.backgroundCard, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  progressLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressCount: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: colors.textDark },
  progressSub:   { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textMid },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sectionTitle: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
});
