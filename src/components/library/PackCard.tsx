import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { woodBorderOuter, woodBorderInner, woodBorderContent } from '../../constants/skeuomorphicTokens';

const CARD_WIDTH = (Dimensions.get('window').width - 32 - 24) / 3;

const PACK_ACCENTS: Record<string, { color: string; icon: string }> = {
  fruits:     { color: colors.accentOrange, icon: 'fruit-watermelon' },
  vegetables: { color: colors.accentMint,   icon: 'carrot' },
  vehicles:   { color: colors.accentCoral,  icon: 'car' },
  dinosaurs:  { color: '#A78BFA',           icon: 'dinosaur' },
  space:      { color: '#818CF8',           icon: 'rocket-launch' },
};

interface PackCardProps {
  id: string;
  name: string;
  progress: number;
  total: number;
  isPremium?: boolean;
  isUnlocked?: boolean;
  onPress?: () => void;
}

export const PackCard = ({ id, name, progress, total, isPremium = false, isUnlocked = true, onPress }: PackCardProps) => {
  const isLocked = isPremium && !isUnlocked;
  const accent = PACK_ACCENTS[id] ?? { color: colors.primary, icon: 'cube-outline' };

  return (
    <TouchableOpacity
      style={[styles.touchable, { shadowColor: accent.color }, isLocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={woodBorderOuter}>
        <View style={woodBorderInner}>
          <View style={[woodBorderContent, styles.cardContent]}>
            <View style={[styles.strip, { backgroundColor: accent.color }]}>
              <MaterialCommunityIcons name={accent.icon} size={28} color="#FFF" />
            </View>

            <View style={styles.body}>
              <View style={[styles.badge, isLocked ? styles.badgePremium : styles.badgeFree]}>
                <Ionicons name={isLocked ? 'star' : 'checkmark'} size={10} color={isLocked ? '#92400E' : '#166534'} />
                <Text style={[styles.badgeText, isLocked ? styles.badgeTextPremium : styles.badgeTextFree]}>
                  {isLocked ? 'Premium' : 'Free'}
                </Text>
              </View>

              {isLocked && (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={14} color={colors.textLight} />
                </View>
              )}

              <Text style={styles.packName} numberOfLines={1}>{name}</Text>
              <Text style={styles.progressText}>
                {isLocked ? 'Tap to preview' : `${progress} / ${total} found`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: CARD_WIDTH,
    margin: 4,
    minHeight: 150,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContent: { flex: 1, minHeight: 150 },
  cardLocked: { opacity: 0.8 },
  strip: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeFree:    { backgroundColor: '#DCFCE7' },
  badgePremium: { backgroundColor: '#FEF3C7' },
  badgeText: { fontFamily: 'Fredoka-SemiBold', fontSize: 9 },
  badgeTextFree:    { color: '#166534' },
  badgeTextPremium: { color: '#92400E' },
  lockOverlay: { position: 'absolute', top: 10, right: 10 },
  packName: {
    fontFamily: 'Fredoka-Bold', fontSize: 15,
    color: colors.textDark, textAlign: 'center',
  },
  progressText: {
    fontFamily: 'Fredoka-Regular', fontSize: 11,
    color: colors.textMid, textAlign: 'center',
  },
});
