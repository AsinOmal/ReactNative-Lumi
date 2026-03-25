import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { usePackStore } from '../store/usePackStore';
import { DiscoveredWordCard } from '../components/home/DiscoveredWordCard';
import { PackCard } from '../components/library/PackCard';
import { getProgress, getStreak } from '../utils/achievementStore';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { getDailyWord, isDailyWordFound } from '../utils/dailyWordHunt';

// Pack → word list map for progress calculation
const PACK_WORDS: Record<string, string[]> = {
  fruits: ['apple', 'banana', 'cherry', 'grape', 'lemon', 'mango', 'orange', 'pineapple', 'strawberry', 'watermelon'],
};

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { packs, loading, loadPacks } = usePackStore();
  const navigation = useNavigation();

  const firstName = user?.displayName?.split(' ')[0] ?? 'Seeker';

  // Live data
  const [scannedWords, setScannedWords]   = useState<string[]>([]);
  const [streak, setStreak]               = useState(0);
  const [dailyFound, setDailyFound]       = useState(false);

  const dailyWord = getDailyWord();
  const dailyModel = MODEL_REGISTRY[dailyWord];

  // Reload whenever screen is focused (e.g. after saving a word)
  useFocusEffect(
    React.useCallback(() => {
      loadPacks();
      Promise.all([getProgress(), getStreak()]).then(([p, s]) => {
        setScannedWords(p.scannedWords);
        setStreak(s);
        setDailyFound(isDailyWordFound(p.scannedWords));
      });
    }, [])
  );

  // Build recent word cards (last 4 saved)
  const recentWords = [...scannedWords].reverse().slice(0, 4);

  // Build per-pack progress from saved words
  const computedProgress: Record<string, number> = {};
  packs.forEach(pack => {
    const packWordList = PACK_WORDS[pack.id] ?? [];
    computedProgress[pack.id] = packWordList.filter(w => scannedWords.includes(w)).length;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.logoChip}>
              <Text style={styles.logoText}>Lumi</Text>
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.greeting}>
                Hello, <Text style={styles.greetingName}>{firstName}!</Text>
              </Text>
              {streak > 0 && (
                <View style={styles.streakChip}>
                  <Text style={styles.streakText}>🔥 {streak} day{streak !== 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.gearBtn} onPress={() => (navigation as any).navigate('Achievements')}>
                <Text style={styles.gearIcon}>🏆</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gearBtn}>
                <Text style={styles.gearIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Scan Banner ── */}
          <TouchableOpacity
            style={styles.scanBanner}
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('Scan')}
          >
            <Text style={styles.scanBannerText}>Scan a New Word! 🍭</Text>
          </TouchableOpacity>

          {/* ── Play Game Banner ── */}
          <TouchableOpacity
            style={styles.gameBanner}
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('ARWordFind')}
          >
            <Text style={styles.gameBannerEmoji}>🎮</Text>
            <View style={styles.gameBannerText}>
              <Text style={styles.gameBannerTitle}>AR Word Find</Text>
              <Text style={styles.gameBannerSub}>Find the 3D models • Tap the right one!</Text>
            </View>
            <Text style={styles.gameBannerArrow}>▶</Text>
          </TouchableOpacity>

          {/* ── Daily Word Hunt ── */}
          <Text style={styles.sectionTitle}>🎯 Daily Word Hunt</Text>
          <View style={[styles.huntCard, dailyFound && styles.huntCardDone]}>
            <Text style={styles.huntEmoji}>
              {dailyFound ? '✅' : dailyModel?.emoji ?? '🔍'}
            </Text>
            <View style={styles.huntText}>
              <Text style={styles.huntLabel}>
                {dailyFound ? 'Great job!' : 'Find today\'s word:'}
              </Text>
              <Text style={styles.huntWord}>
                {dailyFound
                  ? `You found ${dailyWord.charAt(0).toUpperCase() + dailyWord.slice(1)}!`
                  : dailyWord.charAt(0).toUpperCase() + dailyWord.slice(1)}
              </Text>
            </View>
            {!dailyFound && (
              <Text style={styles.huntArrow}>→</Text>
            )}
          </View>

          {/* ── What I Found ── */}
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => (navigation as any).navigate('SavedWords')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>What I Found!</Text>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
          {recentWords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyText}>Start scanning to discover words!</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {recentWords.map((word) => {
                const model = MODEL_REGISTRY[word];
                return (
                  <DiscoveredWordCard
                    key={word}
                    word={word.charAt(0).toUpperCase() + word.slice(1)}
                    emoji={model?.emoji ?? '📦'}
                  />
                );
              })}
            </View>
          )}

          {/* ── Explore ── */}
          <Text style={styles.sectionTitle}>Explore</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#5B2DC0" style={{ marginVertical: 16 }} />
          ) : (
            <View style={styles.grid}>
              {packs.map((pack) => (
                <PackCard
                  key={pack.id}
                  id={pack.id}
                  name={pack.name}
                  emoji={pack.emoji}
                  progress={computedProgress[pack.id] ?? 0}
                  total={pack.wordCount}
                  isPremium={pack.isPremium}
                  isUnlocked={!pack.isPremium}
                />
              ))}
            </View>
          )}

          {/* Space for floating tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EBFF' },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  logoChip: {
    backgroundColor: '#5B2DC0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoText: {
    fontFamily: 'SpicyRice-Regular',
    fontSize: 16,
    color: '#FFF',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  greeting: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#1A1050',
  },
  greetingName: { color: '#5B2DC0' },
  streakChip: {
    marginTop: 4,
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  streakText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 13,
    color: '#E65100',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gearBtn: { padding: 4 },
  gearIcon: { fontSize: 22 },

  // Scan banner
  scanBanner: {
    backgroundColor: '#1A1050',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scanBannerText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Daily hunt card
  huntCard: {
    backgroundColor: '#1A1050',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  huntCardDone: {
    backgroundColor: '#064E3B',
  },
  huntEmoji: { fontSize: 38 },
  huntText: { flex: 1 },
  huntLabel: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#C4B5FD',
    marginBottom: 2,
  },
  huntWord: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  huntArrow: {
    fontSize: 22,
    color: '#C4B5FD',
  },

  // Sections
  sectionTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#5B2DC0',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  seeAll: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: '#5B2DC0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#94A3B8',
  },

  // Game banner
  gameBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.25)',
  },
  gameBannerEmoji: { fontSize: 36 },
  gameBannerText: { flex: 1, gap: 2 },
  gameBannerTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  gameBannerSub: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#A78BFA',
  },
  gameBannerArrow: {
    fontSize: 16,
    color: '#C4B5FD',
  },
});

