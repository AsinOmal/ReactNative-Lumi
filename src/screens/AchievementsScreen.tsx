import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ACHIEVEMENTS, Achievement } from '../utils/achievementRegistry';
import { getProgress, EarnedAchievement } from '../utils/achievementStore';
import { AchievementShareModal } from '../components/AchievementShareModal';
import { colors } from '../constants/colors';

export const AchievementsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [selected, setSelected] = useState<{ achievement: Achievement; earnedData: EarnedAchievement } | null>(null);

  useFocusEffect(
    React.useCallback(() => { getProgress().then(p => setEarned(p.earned || [])); }, [])
  );

  const unlockedCount = earned.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>{unlockedCount} / {ACHIEVEMENTS.length} unlocked</Text>
        </View>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {ACHIEVEMENTS.map(a => {
            const earnedData = earned.find(e => e.id === a.id);
            const isUnlocked = !!earnedData;

            const card = (
              <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
                <View style={[styles.iconCircle, isUnlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked]}>
                  {isUnlocked
                    ? <MaterialCommunityIcons name="trophy" size={30} color={colors.accentYellow} />
                    : <Ionicons name="lock-closed" size={24} color={colors.textLight} />}
                </View>
                <Text style={[styles.cardTitle, !isUnlocked && styles.cardTitleLocked]} numberOfLines={1}>{isUnlocked ? a.title : '???'}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{a.description}</Text>
                {isUnlocked && (
                  <View style={styles.doneRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.successDark} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyBottom },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  backBtn: { padding: 8, width: 44 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title:    { fontFamily: 'Fredoka-Bold', fontSize: 24, color: '#FFF' },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  body:     { flex: 1 },
  scroll:   { paddingHorizontal: 16, paddingTop: 20 },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cell:     { width: '47%' },
  card: {
    backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 14,
    alignItems: 'center', gap: 6,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14, shadowRadius: 12, elevation: 4,
  },
  cardLocked: { backgroundColor: '#F3F0FA', shadowOpacity: 0, elevation: 0 },
  iconCircle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconCircleUnlocked: { backgroundColor: '#FFF9C4' },
  iconCircleLocked:   { backgroundColor: '#F1F5F9' },
  cardTitle:       { fontFamily: 'Fredoka-Bold', fontSize: 17, color: colors.textDark, textAlign: 'center' },
  cardTitleLocked: { color: '#CBD5E1' },
  cardDesc:  { fontFamily: 'Fredoka-Regular', fontSize: 14, color: colors.textMid, textAlign: 'center', lineHeight: 18 },
  doneRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  doneText:  { fontFamily: 'Fredoka-SemiBold', fontSize: 13, color: colors.successDark },
});
