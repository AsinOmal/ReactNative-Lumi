// 📖 What this does:
// Cream "Achievement Progress" card with a gold trophy disc on the left, a
// headline/count row, an encouragement sub-line and a gold-fill progress bar.
// Conveys collection completeness more meaningfully than a bare bar.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';

interface Props {
  unlockedCount: number;
  totalCount: number;
}

export const AchievementProgress: React.FC<Props> = ({
  unlockedCount,
  totalCount,
}) => {
  const ratio = totalCount > 0 ? unlockedCount / totalCount : 0;
  const sub =
    unlockedCount === 0
      ? 'Keep discovering words to earn your first badge!'
      : unlockedCount === totalCount
      ? 'Every badge collected — amazing!'
      : 'Keep discovering words to earn more badges!';

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="trophy" size={26} color="#FFF" />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Achievement Progress</Text>
          <Text style={styles.count}>
            {unlockedCount}/{totalCount}
          </Text>
        </View>
        <Text style={styles.sub}>{sub}</Text>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${Math.max(ratio * 100, 4)}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.achievementCardCream,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#C96B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.achievementGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 6 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 16,
    color: colors.achievementTextBrown,
  },
  count: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 16,
    color: colors.achievementGold,
  },
  sub: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#6B4A2A' },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(246,168,0,0.18)',
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.achievementGold,
  },
});
