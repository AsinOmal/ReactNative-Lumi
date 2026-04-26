import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/colors';

interface GameCard {
  key: string;
  title: string;
  desc: string;
  iconName: string;
  accent: string;
  available: boolean;
}

const GAMES: GameCard[] = [
  { key: 'ARWordFind',   title: 'AR Word Find',  desc: 'Find 3D models hidden in your room!',  iconName: 'target',               accent: colors.accentCoral,  available: true },
  { key: 'MakeAMeal',    title: 'Make a Meal',   desc: 'Cook recipes with AR ingredients!',     iconName: 'silverware-fork-knife', accent: colors.accentOrange, available: true },
  { key: 'ScanAndCount', title: 'Scan & Count',  desc: 'Count 3D models all around you!',       iconName: 'counter',               accent: colors.accentMint,   available: true },
  { key: 'ComingSoon',   title: 'Coming Soon',   desc: 'More exciting games are on the way!',   iconName: 'star-outline',          accent: '#CBD5E1',           available: false },
];

export const PlaygroundScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Coral → orange gradient — wave bottom, gamepad watermark */}
      <LinearGradient
        colors={['#FF6B6B', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <MaterialCommunityIcons
          name="gamepad-variant-outline"
          size={190}
          color="rgba(255,255,255,0.08)"
          style={styles.watermark}
        />
        <Text style={styles.title}>Playground</Text>
        <Text style={styles.subtitle}>Pick a game to play!</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {GAMES.map(game => (
            <TouchableOpacity
              key={game.key}
              style={[styles.card, { shadowColor: game.accent }, !game.available && styles.cardLocked]}
              onPress={() => game.available && (navigation as any).navigate(game.key)}
              activeOpacity={game.available ? 0.85 : 1}
            >
              <View style={[styles.iconArea, { backgroundColor: game.available ? game.accent : '#CBD5E1' }]}>
                <MaterialCommunityIcons name={game.iconName} size={52} color="rgba(255,255,255,0.95)" />
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, !game.available && styles.cardTitleLocked]} numberOfLines={1}>
                    {game.title}
                  </Text>
                  {game.available && (
                    <View style={[styles.playBtn, { backgroundColor: game.accent }]}>
                      <Ionicons name="play" size={14} color="#FFF" />
                    </View>
                  )}
                  {!game.available && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Soon</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{game.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyBottom },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  watermark: {
    position: 'absolute',
    right: -28,
    bottom: -24,
  },
  title:    { fontFamily: 'Fredoka-Bold', fontSize: 40, color: '#FFF' },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  body:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  grid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    width: '47%', borderRadius: 24, backgroundColor: colors.backgroundCard,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6,
  },
  cardLocked:      { opacity: 0.55 },
  iconArea:        { height: 130, alignItems: 'center', justifyContent: 'center' },
  cardFooter:      { padding: 12, gap: 6 },
  titleRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle:       { fontFamily: 'Fredoka-Bold', fontSize: 18, color: colors.textDark, flex: 1 },
  cardTitleLocked: { color: colors.textLight },
  cardDesc:        { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textMid, lineHeight: 18 },
  badge:           { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:       { fontFamily: 'Fredoka-SemiBold', fontSize: 10, color: colors.textMid },
  playBtn:         { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
