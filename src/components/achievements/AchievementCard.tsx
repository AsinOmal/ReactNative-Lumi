// 📖 What this does:
// One cell in the achievement grid. Unlocked cards use the cream + gold-border
// "collectible" treatment with a green Unlocked badge. Locked cards stay
// readable (no heavy fade): pale blue fill, blue border, ??? title, the
// description still acts as a clue, and a small Locked chip.
// Keeps a consistent skeleton (icon, title, description, status badge) so the
// grid reads as one coherent collection.

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Achievement } from '../../utils/achievementRegistry';
import { colors } from '../../constants/colors';

interface Props {
  achievement: Achievement;
  isUnlocked: boolean;
}

export const AchievementCard: React.FC<Props> = ({
  achievement: a,
  isUnlocked,
}) => (
  <View
    style={[styles.card, isUnlocked ? styles.cardUnlocked : styles.cardLocked]}
  >
    <View style={[styles.iconArea, !isUnlocked && styles.iconAreaLocked]}>
      {isUnlocked ? (
        a.image ? (
          <Image source={a.image} style={styles.image} />
        ) : (
          <MaterialCommunityIcons
            name={a.iconName as any}
            size={48}
            color={a.iconColor}
          />
        )
      ) : (
        <Ionicons name="lock-closed" size={28} color="#3F6E8C" />
      )}
    </View>
    <Text
      style={[styles.title, !isUnlocked && styles.titleLocked]}
      numberOfLines={1}
    >
      {isUnlocked ? a.title : '???'}
    </Text>
    <Text style={styles.desc} numberOfLines={2}>
      {a.description}
    </Text>
    <View style={isUnlocked ? styles.badgeUnlocked : styles.badgeLocked}>
      {isUnlocked ? (
        <>
          <Ionicons name="checkmark-circle" size={13} color="#FFF" />
          <Text style={styles.badgeUnlockedText}>Unlocked</Text>
        </>
      ) : (
        <>
          <Ionicons name="lock-closed" size={11} color="#3F6E8C" />
          <Text style={styles.badgeLockedText}>Locked</Text>
        </>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 230,
    borderRadius: 30,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  cardUnlocked: {
    backgroundColor: colors.achievementCardCream,
    borderWidth: 2,
    borderColor: colors.achievementGold,
    shadowColor: colors.achievementGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  cardLocked: {
    backgroundColor: '#EAF6FD',
    borderWidth: 1.5,
    borderColor: colors.achievementLockedBlue,
    opacity: 0.92,
  },
  iconArea: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconAreaLocked: { backgroundColor: 'rgba(142,201,232,0.4)' },
  image: { width: 80, height: 80, resizeMode: 'contain' },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 18,
    color: colors.achievementTextBrown,
    textAlign: 'center',
  },
  titleLocked: { color: '#3F6E8C', letterSpacing: 2 },
  desc: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#6B4A2A',
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
  badgeUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.achievementUnlockedGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeUnlockedText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 12,
    color: '#FFF',
  },
  badgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(142,201,232,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeLockedText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 12,
    color: '#3F6E8C',
  },
});
