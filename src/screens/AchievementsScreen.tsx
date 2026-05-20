// 📖 What this does:
// Orchestrates the reward-collection page: golden-orange header, cream progress
// card, filter chips, and the achievement grid. Heavy chrome lives in
// components/achievements/* so this file stays under the 150-line limit and
// reads as a layout, not a renderer.

import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ACHIEVEMENTS, Achievement } from '../utils/achievementRegistry';
import { getProgress, EarnedAchievement } from '../utils/achievementStore';
import { AchievementShareModal } from '../components/AchievementShareModal';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { AchievementsHeader } from '../components/achievements/AchievementsHeader';
import { AchievementProgress } from '../components/achievements/AchievementProgress';
import {
  AchievementFilters,
  AchievementFilter,
} from '../components/achievements/AchievementFilters';
import { colors } from '../constants/colors';
import { styles } from './AchievementsScreenStyles';

export const AchievementsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [filter, setFilter] = useState<AchievementFilter>('all');
  const [selected, setSelected] = useState<{
    achievement: Achievement;
    earnedData: EarnedAchievement;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      getProgress().then((p) => setEarned(p.earned || []));
    }, [])
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => {
      const unlocked = earned.some((e) => e.id === a.id);
      return filter === 'unlocked' ? unlocked : !unlocked;
    });
  }, [filter, earned]);

  return (
    <LinearGradient
      colors={[colors.achievementBgStart, colors.achievementBgEnd]}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" />
      <AchievementsHeader
        unlockedCount={earned.length}
        totalCount={ACHIEVEMENTS.length}
        insetsTop={insets.top}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AchievementProgress
          unlockedCount={earned.length}
          totalCount={ACHIEVEMENTS.length}
        />
        <AchievementFilters value={filter} onChange={setFilter} />

        <View style={styles.grid}>
          {filtered.map((a) => {
            const earnedData = earned.find((e) => e.id === a.id);
            const isUnlocked = !!earnedData;
            const card = (
              <AchievementCard achievement={a} isUnlocked={isUnlocked} />
            );
            return isUnlocked && earnedData ? (
              <TouchableOpacity
                key={a.id}
                style={styles.cell}
                activeOpacity={0.88}
                onPress={() => setSelected({ achievement: a, earnedData })}
                accessibilityLabel={`${a.title} achievement`}
                accessibilityHint="Double tap to view and share"
              >
                {card}
              </TouchableOpacity>
            ) : (
              <View key={a.id} style={styles.cell}>
                {card}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {selected && (
        <AchievementShareModal
          achievement={selected.achievement}
          earnedData={selected.earnedData}
          onClose={() => setSelected(null)}
        />
      )}
    </LinearGradient>
  );
};
