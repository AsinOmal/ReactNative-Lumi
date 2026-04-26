import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../store/useAuthStore';
import { useSavedWords } from '../hooks/useSavedWords';
import { colors } from '../constants/colors';

type Tab = 'saved' | 'wishlist';

function formatDate(ts: number): string {
  if (!ts) return 'Saved earlier';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const SavedWordsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('saved');
  const { savedWords, wishlist, loadWishlist, handleRemoveWish } = useSavedWords(user?.uid ?? null);

  useFocusEffect(React.useCallback(() => { loadWishlist(); }, [loadWishlist]));

  const count = tab === 'saved' ? savedWords.length : wishlist.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{tab === 'saved' ? 'Saved Words' : 'My Wishlist'}</Text>
          <Text style={styles.subtitle}>{count} {tab === 'saved' ? 'words' : 'wishes'}</Text>
        </View>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <View style={[styles.tabsWrapper, { paddingTop: 16 }]}>
        <View style={styles.tabs}>
          {(['saved', 'wishlist'] as Tab[]).map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)} activeOpacity={0.8}>
              <Ionicons name={t === 'saved' ? 'bookmark' : 'star'} size={16} color={tab === t ? '#FFF' : colors.textMid} />
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'saved' ? 'Saved' : 'Wishlist'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'saved' && (
        savedWords.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Nothing saved yet!</Text>
            <Text style={styles.emptySub}>Scan a word and tap Save to see it here.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
            {savedWords.map(item => {
              const display = item.word.charAt(0).toUpperCase() + item.word.slice(1);
              return (
                <View key={item.word} style={styles.card}>
                  <View style={styles.emojiCircle}><MaterialCommunityIcons name="cube-outline" size={26} color={colors.primary} /></View>
                  <View style={styles.cardBody}>
                    <Text style={styles.wordText}>{display}</Text>
                    <Text style={styles.dateText}>{formatDate(item.savedAt)}</Text>
                  </View>
                  <TouchableOpacity style={styles.arBtn} activeOpacity={0.8}
                    onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Scan', params: { preloadWord: item.word } })}>
                    <Text style={styles.arBtnText}>AR</Text>
                    <Ionicons name="arrow-forward" size={13} color="#FFF" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )
      )}

      {tab === 'wishlist' && (
        wishlist.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No wishes yet!</Text>
            <Text style={styles.emptySub}>Scan an unknown word and tap "Wish for it!"</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
            {wishlist.map(item => {
              const display = item.word.charAt(0).toUpperCase() + item.word.slice(1);
              return (
                <View key={item.word} style={[styles.card, styles.wishCard]}>
                  <View style={[styles.emojiCircle, styles.wishEmojiCircle]}>
                    <Ionicons name="star" size={28} color={colors.accentYellow} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.wordText}>{display}</Text>
                    <Text style={styles.dateText}>{formatDate(item.wishedAt)}</Text>
                  </View>
                  <TouchableOpacity style={styles.trashBtn} onPress={() => handleRemoveWish(item.word)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyBottom },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  backBtn:      { padding: 8, width: 44 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title:    { fontFamily: 'Fredoka-Bold', fontSize: 24, color: '#FFF' },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  tabsWrapper: { paddingHorizontal: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#EDE9FE', borderRadius: 16, padding: 4 },
  tab:           { flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive:     { backgroundColor: colors.primary },
  tabText:       { fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: colors.textMid },
  tabTextActive: { color: '#FFF' },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  card: {
    backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  wishCard: { backgroundColor: '#FDFBFF', borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.primaryLight, shadowOpacity: 0, elevation: 0 },
  emojiCircle:      { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  wishEmojiCircle:  { backgroundColor: '#FEF3C7' },
  cardBody: { flex: 1, gap: 3 },
  wordText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: colors.textDark },
  dateText: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: '#94A3B8' },
  arBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 4 },
  arBtnText: { fontFamily: 'Fredoka-SemiBold', fontSize: 13, color: '#FFF' },
  trashBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  emptySub:   { fontFamily: 'Fredoka-Regular', fontSize: 15, color: colors.textMid, textAlign: 'center', paddingHorizontal: 40 },
});
