import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ACHIEVEMENTS, Achievement } from '../utils/achievementRegistry';
import { getProgress, EarnedAchievement } from '../utils/achievementStore';
import { AchievementShareModal } from '../components/AchievementShareModal';
import { styles } from './AchievementsScreenStyles';

export const AchievementsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [selected, setSelected] = useState<{ achievement: Achievement; earnedData: EarnedAchievement } | null>(null);

  useFocusEffect(
    React.useCallback(() => { getProgress().then(p => setEarned(p.earned || [])); }, [])
  );

  const unlockedCount = earned.length;
  const progress = ACHIEVEMENTS.length > 0 ? unlockedCount / ACHIEVEMENTS.length : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Amber → dark-amber gradient — trophy watermark + wave bottom */}
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>{unlockedCount} / {ACHIEVEMENTS.length} unlocked</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <MaterialCommunityIcons name="trophy-outline" size={22} color="#F59E0B" />
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
        </View>

        <View style={styles.grid}>
          {ACHIEVEMENTS.map(a => {
            const earnedData = earned.find(e => e.id === a.id);
            const isUnlocked = !!earnedData;

            const card = (
              <View style={[styles.card, !isUnlocked && styles.cardLocked, isUnlocked && { shadowColor: a.iconColor }]}>
                <View style={[styles.iconCircle, isUnlocked ? { backgroundColor: a.iconColor + '22' } : styles.iconCircleLocked]}>
                  {isUnlocked
                    ? <MaterialCommunityIcons name={a.iconName} size={30} color={a.iconColor} />
                    : <Ionicons name="lock-closed" size={22} color="#CBD5E1" />}
                </View>
                <Text style={[styles.cardTitle, !isUnlocked && styles.cardTitleLocked]} numberOfLines={1}>
                  {isUnlocked ? a.title : '???'}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{a.description}</Text>
                {isUnlocked && (
                  <View style={styles.doneRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#059669" />
                    <Text style={styles.doneText}>Unlocked</Text>
                  </View>
                )}
              </View>
            );

            return isUnlocked && earnedData ? (
              <TouchableOpacity key={a.id} style={styles.cell} activeOpacity={0.85} onPress={() => setSelected({ achievement: a, earnedData })}>
                {card}
              </TouchableOpacity>
            ) : (
              <View key={a.id} style={styles.cell}>{card}</View>
            );
          })}
        </View>
      </ScrollView>

      {selected && (
        <AchievementShareModal achievement={selected.achievement} earnedData={selected.earnedData} onClose={() => setSelected(null)} />
      )}
    </View>
  );
};
