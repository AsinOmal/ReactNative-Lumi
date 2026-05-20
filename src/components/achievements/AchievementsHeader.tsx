// 📖 What this does:
// Golden-orange gradient banner that anchors the Achievements screen. Holds the
// back button, title/subtitle on the left and the trophy art on the right. A
// few low-opacity sparkle glyphs sit absolutely positioned to add depth without
// stealing focus from the cards beneath.

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';

interface Props {
  unlockedCount: number;
  totalCount: number;
  insetsTop: number;
  onBack: () => void;
}

export const AchievementsHeader: React.FC<Props> = ({
  unlockedCount,
  totalCount,
  insetsTop,
  onBack,
}) => (
  <LinearGradient
    colors={[colors.achievementHeaderStart, colors.achievementHeaderEnd]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.container, { paddingTop: insetsTop + 12 }]}
  >
    <Ionicons
      name="sparkles"
      size={16}
      color="rgba(255,255,255,0.4)"
      style={styles.s1}
    />
    <Ionicons
      name="sparkles"
      size={11}
      color="rgba(255,255,255,0.32)"
      style={styles.s2}
    />
    <Ionicons
      name="sparkles"
      size={13}
      color="rgba(255,255,255,0.28)"
      style={styles.s3}
    />

    <View style={styles.row}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={24} color="#FFF" />
      </TouchableOpacity>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          {unlockedCount} / {totalCount} unlocked
        </Text>
      </View>
      <Image
        source={require('../../assets/images/achievements/header-art.png')}
        style={styles.art}
      />
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    shadowColor: '#C96B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  s1: { position: 'absolute', top: 60, left: 110 },
  s2: { position: 'absolute', bottom: 50, left: 36 },
  s3: { position: 'absolute', top: 90, right: 150 },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1, marginLeft: 12 },
  title: { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },
  subtitle: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
  },
  art: { width: 130, height: 150, resizeMode: 'contain' },
});
