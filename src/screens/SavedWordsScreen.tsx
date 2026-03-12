import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getSavedWords, SavedWord } from '../utils/achievementStore';
import { MODEL_REGISTRY } from '../utils/modelRegistry';

function formatDate(ts: number): string {
  if (!ts) return 'Saved earlier';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const SavedWordsScreen = () => {
  const navigation = useNavigation();
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      getSavedWords().then(setSavedWords);
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1A1050" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Words</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{savedWords.length}</Text>
        </View>
      </View>

      {savedWords.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔎</Text>
          <Text style={styles.emptyTitle}>Nothing saved yet!</Text>
          <Text style={styles.emptySubtitle}>Scan a word and tap Save to see it here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {savedWords.map((item) => {
            const model = MODEL_REGISTRY[item.word];
            const displayWord = item.word.charAt(0).toUpperCase() + item.word.slice(1);
            return (
              <View key={item.word} style={styles.card}>
                <View style={styles.emojiCircle}>
                  <Text style={styles.emoji}>{model?.emoji ?? '📦'}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.wordText}>{displayWord}</Text>
                  <Text style={styles.dateText}>
                    <Ionicons name="calendar-outline" size={12} color="#94A3B8" />{' '}
                    {formatDate(item.savedAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.arBtn}
                  activeOpacity={0.8}
                  onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Scan', params: { preloadWord: item.word } })}
                >
                  <Text style={styles.arBtnText}>View in AR</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0EBFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#1A1050',
  },
  badge: {
    backgroundColor: '#5B2DC0',
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 14,
    color: '#FFF',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 32 },
  cardBody: { flex: 1, gap: 4 },
  wordText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 20,
    color: '#1A1050',
  },
  dateText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#94A3B8',
  },

  arBtn: {
    backgroundColor: '#5B2DC0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 13,
    color: '#FFF',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 60,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 8 },
  emptyTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#1A1050',
  },
  emptySubtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
