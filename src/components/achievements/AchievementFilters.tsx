// 📖 What this does:
// Three-chip filter row (All / Unlocked / Locked) for the achievement grid.
// Selected chip uses the gold fill; unselected uses the cream fill + brown
// text with a soft border, matching the page's reward-collection palette.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export type AchievementFilter = 'all' | 'unlocked' | 'locked';

interface Props {
  value: AchievementFilter;
  onChange: (next: AchievementFilter) => void;
}

const OPTIONS: { value: AchievementFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'locked', label: 'Locked' },
];

export const AchievementFilters: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.row}>
    {OPTIONS.map((o) => {
      const active = o.value === value;
      return (
        <TouchableOpacity
          key={o.value}
          activeOpacity={0.85}
          onPress={() => onChange(o.value)}
          style={[styles.chip, active && styles.chipActive]}
          accessibilityLabel={`${o.label} filter`}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
        >
          <Text style={[styles.text, active && styles.textActive]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: colors.achievementCardCream,
    borderWidth: 1.5,
    borderColor: 'rgba(122,74,26,0.18)',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.achievementGold,
    borderColor: colors.achievementGold,
  },
  text: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: colors.achievementTextBrown,
  },
  textActive: { color: '#FFF' },
});
