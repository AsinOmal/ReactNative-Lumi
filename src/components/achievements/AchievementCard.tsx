// 📖 What this does:
// Renders one achievement card in the 2-column grid. Unlocked cards get the
// full wood-bevel + cream face treatment; locked cards are grayed + lock icon.
// Extracted from AchievementsScreen so the screen stays under 150 lines.

import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Achievement } from '../../utils/achievementRegistry';
import { styles } from '../../screens/AchievementsScreenStyles';

interface Props {
  achievement: Achievement;
  isUnlocked: boolean;
}

export const AchievementCard: React.FC<Props> = ({
  achievement: a,
  isUnlocked,
}) => {
  const content = (
    <>
      <View
        style={[
          styles.iconCircle,
          isUnlocked
            ? { backgroundColor: a.iconColor + '22' }
            : styles.iconCircleLocked,
        ]}
      >
        {isUnlocked ? (
          <MaterialCommunityIcons
            name={a.iconName}
            size={30}
            color={a.iconColor}
          />
        ) : (
          <Ionicons name="lock-closed" size={22} color="#CBD5E1" />
        )}
      </View>
      <Text
        style={[styles.cardTitle, !isUnlocked && styles.cardTitleLocked]}
        numberOfLines={1}
      >
        {isUnlocked ? a.title : '???'}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {a.description}
      </Text>
      {isUnlocked && (
        <View style={styles.doneRow}>
          <Ionicons name="checkmark-circle" size={13} color="#059669" />
          <Text style={styles.doneText}>Unlocked</Text>
        </View>
      )}
    </>
  );

  if (!isUnlocked) {
    return <View style={[styles.cardInner, styles.cardLocked]}>{content}</View>;
  }

  return (
    <View style={styles.woodOuter}>
      <View style={styles.woodInner}>
        <View style={styles.cardInner}>{content}</View>
      </View>
    </View>
  );
};
