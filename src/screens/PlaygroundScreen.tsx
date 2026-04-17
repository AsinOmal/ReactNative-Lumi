/**
 * PlaygroundScreen.tsx
 *
 * Lists all game modes. Active games navigate directly; coming-soon games
 * show a locked card so children can see what's ahead without crashing.
 *
 * As new game modes ship (Phase 5a Make a Meal, Phase 5b Scan & Count),
 * flip their `available` flag to true and add the route name.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,
  ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface GameMode {
  key: string;
  title: string;
  desc: string;
  emoji: string;
  available: boolean;
}

const GAMES: GameMode[] = [
  {
    key: 'ARWordFind',
    title: 'AR Word Find',
    desc: 'Find the 3D model floating in your room and tap it!',
    emoji: '🎯',
    available: true,
  },
  {
    key: 'MakeAMeal',
    title: 'Make a Meal',
    desc: 'Collect AR ingredients and cook a real recipe!',
    emoji: '🍳',
    available: false,
  },
  {
    key: 'ScanAndCount',
    title: 'Scan & Count',
    desc: 'Scan objects around you and count them up!',
    emoji: '🔢',
    available: false,
  },
];

export const PlaygroundScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Playground 🎮</Text>
          <Text style={styles.subtitle}>Pick a game to play!</Text>

          {GAMES.map(game => (
            <TouchableOpacity
              key={game.key}
              style={[styles.card, !game.available && styles.cardLocked]}
              onPress={() => game.available && (navigation as any).navigate(game.key)}
              activeOpacity={game.available ? 0.8 : 1}
            >
              <Text style={styles.cardEmoji}>{game.emoji}</Text>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, !game.available && styles.cardTitleLocked]}>
                  {game.title}
                </Text>
                <Text style={styles.cardDesc}>{game.desc}</Text>
                {!game.available && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Coming Soon</Text>
                  </View>
                )}
              </View>
              {game.available && <Text style={styles.arrow}>▶</Text>}
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EBFF' },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#1A1050', marginBottom: 4 },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: '#9B87CC', marginBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 16, marginBottom: 14, gap: 14,
    shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardLocked: { opacity: 0.65 },
  cardEmoji: { fontSize: 44 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#1A1050' },
  cardTitleLocked: { color: '#9B87CC' },
  cardDesc: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#9B87CC', lineHeight: 18 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E8E0FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  badgeText: { fontFamily: 'Fredoka-SemiBold', fontSize: 11, color: '#5B2DC0' },
  arrow: { fontSize: 16, color: '#C4B5FD' },
});
