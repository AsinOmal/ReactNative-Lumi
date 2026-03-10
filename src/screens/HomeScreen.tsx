import React, { useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { usePackStore } from '../store/usePackStore';
import { DiscoveredWordCard } from '../components/home/DiscoveredWordCard';
import { PackCard } from '../components/library/PackCard';

// Placeholder discovered words (will come from Firestore user progress later)
const MOCK_FOUND_WORDS = [
  { word: 'Dragon', emoji: '🐉' },
  { word: 'Train', emoji: '🚂' },
  { word: 'Earth', emoji: '🌍' },
  { word: 'Castle', emoji: '🏰' },
];

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { packs, loading, userProgress, loadPacks } = usePackStore();
  const navigation = useNavigation();

  const firstName = user?.displayName?.split(' ')[0] ?? 'Seeker';

  useEffect(() => {
    loadPacks();
  }, []);

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

          {/* ── What I Found Today ── */}
          <Text style={styles.sectionTitle}>What I Found Today!</Text>
          <View style={styles.grid}>
            {MOCK_FOUND_WORDS.map((item, i) => (
              <DiscoveredWordCard key={i} word={item.word} emoji={item.emoji} />
            ))}
          </View>

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
                  progress={userProgress[pack.id] ?? 0}
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
  greetingName: {
    color: '#5B2DC0',
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

  // Sections
  sectionTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#5B2DC0',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
});
