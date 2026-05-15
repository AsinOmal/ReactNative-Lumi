import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ACHIEVEMENTS, Achievement } from '../utils/achievementRegistry';
import { getProgress, EarnedAchievement } from '../utils/achievementStore';
import { AchievementShareModal } from '../components/AchievementShareModal';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { SkyScene } from '../components/scenes/SkyScene';
import { colors } from '../constants/colors';
import { styles } from './AchievementsScreenStyles';

export const AchievementsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [selected, setSelected] = useState<{
    achievement: Achievement;
    earnedData: EarnedAchievement;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      getProgress().then((p) => setEarned(p.earned || []));
    }, [])
  );

  const unlockedCount = earned.length;
  const progress =
    ACHIEVEMENTS.length > 0 ? unlockedCount / ACHIEVEMENTS.length : 0;

  return (
    <SkyScene paused={!isFocused}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[colors.accentAmber, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <MaterialCommunityIcons
          name="trophy"
          size={190}
          color="rgba(255,255,255,0.08)"
          style={styles.watermark}
        />
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>
              {unlockedCount} / {ACHIEVEMENTS.length} unlocked
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressBar}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={22}
            color="#F59E0B"
          />
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {unlockedCount}/{ACHIEVEMENTS.length}
          </Text>
        </View>

        <View style={styles.grid}>
          {ACHIEVEMENTS.map((a) => {
            const earnedData = earned.find((e) => e.id === a.id);
            const isUnlocked = !!earnedData;
            const card = (
              <AchievementCard achievement={a} isUnlocked={isUnlocked} />
            );

            return isUnlocked && earnedData ? (
              <TouchableOpacity
                key={a.id}
                style={styles.cell}
                activeOpacity={0.85}
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
    </SkyScene>
  );
};
